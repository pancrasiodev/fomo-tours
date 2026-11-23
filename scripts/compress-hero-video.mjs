import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, renameSync, statSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import ffmpegPath from 'ffmpeg-static'

const args = process.argv.slice(2)
const warm = args.includes('--warm')
const positional = args.filter((a) => !a.startsWith('--'))
const input = positional[0]
const duration = positional[1] || '9'

if (!input || !existsSync(input)) {
  console.error('Usage: npm run compress:video -- <input-video-path> [duration-seconds] [--warm]')
  process.exit(1)
}

const outDir = path.resolve('public/videos')
mkdirSync(outDir, { recursive: true })

const gradeFilter = warm
  ? ',eq=contrast=1.06:brightness=-0.03:saturation=1.18,colorbalance=rs=0.05:gs=0.01:bs=-0.05:rm=0.07:gm=0.02:bm=-0.06'
  : ''

const vf = `scale=1280:-2,fps=24${gradeFilter},format=yuv420p`

const tmpWebm = path.join(os.tmpdir(), `safari-hero-${Date.now()}.webm`)
const tmpMp4 = path.join(os.tmpdir(), `safari-hero-${Date.now()}.mp4`)
const finalWebm = path.join(outDir, 'safari-hero.webm')
const finalMp4 = path.join(outDir, 'safari-hero.mp4')

console.log('Encoding lightweight VP9 WebM (720p, 24fps, yuv420p, muted)...')
execFileSync(
  ffmpegPath,
  [
    '-y',
    '-i', input,
    '-t', String(duration),
    '-vf', vf,
    '-an',
    '-c:v', 'libvpx-vp9',
    '-crf', '35',
    '-b:v', '1200k',
    '-maxrate', '1600k',
    '-bufsize', '2400k',
    '-cpu-used', '4',
    '-row-mt', '1',
    tmpWebm,
  ],
  { stdio: 'inherit' }
)

console.log('Encoding faststart H.264 MP4 fallback (720p, 24fps, yuv420p, muted)...')
execFileSync(
  ffmpegPath,
  [
    '-y',
    '-i', input,
    '-t', String(duration),
    '-vf', vf,
    '-an',
    '-c:v', 'libx264',
    '-crf', '28',
    '-maxrate', '1800k',
    '-bufsize', '2800k',
    '-preset', 'medium',
    '-movflags', '+faststart',
    tmpMp4,
  ],
  { stdio: 'inherit' }
)

renameSync(tmpWebm, finalWebm)
renameSync(tmpMp4, finalMp4)

const webmKb = Math.round(statSync(finalWebm).size / 1024)
const mp4Kb = Math.round(statSync(finalMp4).size / 1024)
console.log(`Done! safari-hero.webm: ${webmKb} KB | safari-hero.mp4: ${mp4Kb} KB`)
