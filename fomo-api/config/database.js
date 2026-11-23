const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const DATA_DIR = path.join(__dirname, '..', 'data')
const SQLITE_PATH = path.join(DATA_DIR, 'fomo_tours.sqlite')

let activeDriver = null // 'mysql' | 'sqlite'
let mysqlPool = null
let sqliteDb = null
let initPromise = null

function translateSqlForSqlite(sql) {
  return String(sql)
    .replace(/CURDATE\(\)/gi, "date('now')")
    .replace(/NOW\(\)/gi, "datetime('now')")
}

function createSqliteAdapter() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync(SQLITE_PATH)
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA foreign_keys = ON;')
  return db
}

async function ensureConnection() {
  if (activeDriver) return activeDriver
  if (initPromise) return initPromise

  initPromise = (async () => {
    const dbHost = process.env.DB_HOST || 'localhost'
    const dbPort = Number(process.env.DB_PORT || 3306)
    const dbUser = process.env.DB_USER || 'root'
    const dbPassword = process.env.DB_PASSWORD || ''
    const dbName = process.env.DB_NAME || 'fomo_tours'

    if (process.env.DB_DRIVER !== 'sqlite') {
      try {
        const bootstrap = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          connectTimeout: 2500,
        })
        await bootstrap.query(
          `CREATE DATABASE IF NOT EXISTS \`${dbName.replace(/`/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        )
        await bootstrap.end()

        mysqlPool = mysql.createPool({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          database: dbName,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        })
        await mysqlPool.query('SELECT 1')
        activeDriver = 'mysql'
        console.log(`[DB] Connected to MySQL database "${dbName}" on ${dbHost}:${dbPort}`)
        return activeDriver
      } catch {
        // Fall through cleanly to embedded relational SQLite database for local dev
      }
    }

    sqliteDb = createSqliteAdapter()
    activeDriver = 'sqlite'
    console.log(`[DB] MySQL offline — using persistent relational SQLite database (${SQLITE_PATH})`)
    return activeDriver
  })()

  return initPromise
}

async function query(sql, params = []) {
  const driver = await ensureConnection()
  if (driver === 'mysql') {
    return mysqlPool.query(sql, params)
  }

  const normalizedSql = translateSqlForSqlite(sql).trim()
  const safeParams = params.map((p) => (p === undefined ? null : p))
  const isRead = /^(SELECT|PRAGMA|WITH)\b/i.test(normalizedSql)

  const stmt = sqliteDb.prepare(normalizedSql)
  if (isRead) {
    const rows = stmt.all(...safeParams)
    return [rows, []]
  }
  const result = stmt.run(...safeParams)
  return [
    {
      insertId: Number(result.lastInsertRowid || 0),
      affectedRows: Number(result.changes || 0),
    },
    [],
  ]
}

async function execRaw(sqlBlock) {
  const driver = await ensureConnection()
  if (driver === 'mysql') {
    const cleanSql = sqlBlock
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
    const statements = cleanSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    for (const stmt of statements) {
      if (/^(CREATE DATABASE|USE )/i.test(stmt)) continue
      await mysqlPool.query(stmt)
    }
    return
  }
  sqliteDb.exec(sqlBlock)
}

function getDriverName() {
  return activeDriver || 'initializing'
}

module.exports = {
  query,
  execRaw,
  ensureConnection,
  getDriverName,
  SQLITE_PATH,
}
