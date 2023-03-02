import { readBinaryFile } from '@tauri-apps/api/fs'
import * as musicMetadata from 'music-metadata-browser'
import type { Song } from '../types'
import { AUDIO_EXTENSIONS } from '$lib/constants'

export const isAudio = (path: string) => AUDIO_EXTENSIONS.some(ext => path.endsWith(`.${ext}`))

export const getSongInfoFromFile = async (filePath: string) => {
  const fileContents = await readBinaryFile(filePath)
  const { common } = await musicMetadata.parseBuffer(fileContents)
  const song: Song = {
    path: filePath,
    title: common.title,
    album: common.album,
    artist: common.artist,
    year: common.year,
    cover: common.picture?.[0].data.toString(),
  }
  return song
}
