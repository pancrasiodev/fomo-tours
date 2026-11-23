import { execFileSync } from 'node:child_process'
import { mkdirSync, renameSync, statSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import ffmpegPath from 'ffmpeg-static'

const outDir = path.resolve('public/videos')
mkdirSync(outDir, { recursive: true })

const stories = [
  {
    slug: 'story-mara',
    ss: '0',
    dur: '4.5',
    src: path.resolve('public/videos/safari-hero.webm'),
    warm: false,
  },
  {
    slug: 'story-migration',
    ss: '12',
    dur: '4.5',
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Wildebeests_at_Grumeti_River.webm',
    warm: true,
  },
  {
    slug: 'story-coast',
    ss: '4',
    dur: '4.5',
    src: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Aerial_view_of_sand_beach._Top_view_sea_waves._Drone_footage.webm',
    warm: false,
  },
  {
    slug: 'story-naivasha',
    ss: '0.5',
    dur: '4.5',
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/35/003_Baby_Hippopotamus_in_the_rain_at_Queen_Elizabeth_National_Park_Video_by_Giles_Laurent.webm',
    warm: true,
  },
  {
    slug: 'story-nakuru',
    ss: '0.5',
    dur: '5',
    src: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/046_Greater_flamingos_courtship_display_in_the_Camargue_during_mating_season_%28normal_speed%29_Video_by_Giles_Laurent.webm',
    warm: false,
  },
]

const filterSlug = process.argv[2]
const selected = filterSlug ? stories.filter((s) => s.slug === filterSlug) : stories

for (const s of selected) {
  console.log(`\n=== Encoding ${s.slug} ===`)
  const isHttp = s.src.startsWith('http')
  const grade = s.warm
    ? ',eq=contrast=1.05:brightness=-0.02:saturation=1.15,colorbalance=rs=0.04:gs=0.01:bs=-0.04:rm=0.05:gm=0.01:bm=-0.04'
    : ',eq=contrast=1.03:saturation=1.1'
  const vf = `scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24${grade},format=yuv420p`

  const inputArgs = isHttp
    ? ['-headers', 'User-Agent: FomoToursDev/1.0 (https://github.com/pancrasiodev/fomo-tours)\r\n', '-ss', s.ss, '-i', s.src]
    : ['-ss', s.ss, '-i', s.src]

  const tmpWebm = path.join(os.tmpdir(), `${s.slug}-${Date.now()}.webm`)
  const finalWebm = path.join(outDir, `${s.slug}.webm`)

  execFileSync(
    ffmpegPath,
    [
      '-y',
      ...inputArgs,
      '-t', s.dur,
      '-vf', vf,
      '-an',
      '-c:v', 'libvpx-vp9',
      '-crf', '36',
      '-b:v', '1050k',
      '-maxrate', '1350k',
      '-bufsize', '2000k',
      '-cpu-used', '4',
      '-row-mt', '1',
      tmpWebm,
    ],
    { stdio: 'inherit' }
  )

  renameSync(tmpWebm, finalWebm)
  const kb = Math.round(statSync(finalWebm).size / 1024)
  console.log(`${s.slug}.webm => ${kb} KB`)
}
