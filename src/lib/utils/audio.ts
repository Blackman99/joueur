import { readBinaryFile } from '@tauri-apps/api/fs'
import * as musicMetadata from 'music-metadata-browser'
import type { Song } from '../types'
import { AUDIO_EXTENSIONS } from '$lib/constants'

export const isAudio = (path: string) => AUDIO_EXTENSIONS.some(ext => path.endsWith(`.${ext}`))

export const getSongInfoFromFile = async (filePath: string) => {
  const fileContents = await readBinaryFile(filePath)
  const { common } = await musicMetadata.parseBuffer(fileContents)
  const albumCover = common.picture?.[0]
  const song: Song = {
    path: filePath,
    title: common.title,
    album: common.album,
    artist: common.artist,
    year: common.year,
    cover: albumCover ? `data:${albumCover.format};base64, ${albumCover.data.toString('base64')}` : undefined,
  }
  return song
}
