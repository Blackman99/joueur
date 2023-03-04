import type { FileEntry } from '@tauri-apps/api/fs'
import { invoke } from '@tauri-apps/api'
import type { Song } from '../types'
import { AUDIO_EXTENSIONS } from '$lib/constants'

export const isAudio = (path: string) => AUDIO_EXTENSIONS.includes(path.split('.').pop()?.toLowerCase() || '')

export const getSongInfoFromFile = async (filePath: string) => {
  const song = await invoke('get_metadata', { path: filePath })

  return song as Song
}

export const parseSongsFromFileEntries = async (fileEntries: FileEntry[], songs: Song[] = []) => {
  const parseEntry = async (entry: FileEntry) => {
    if (isAudio(entry.path)) {
      const song = await getSongInfoFromFile(entry.path)
      if (song) songs.push(song)
    }
    else if (entry.children?.length)
    { await parseSongsFromFileEntries(entry.children, songs) }
  }
  for (const entry of fileEntries)
    await parseEntry(entry)
  return songs
}
