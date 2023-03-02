import {
  BaseDirectory,
  createDir,
  exists,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/api/fs'
import type { JoueurConf, Song } from './types'

export const BASE_STORE_PATH = 'store'
export const MAIN_CONF_PATH = `${BASE_STORE_PATH}/joueur.conf`
export const MUSIC_ENTRIES_PATH = `${BASE_STORE_PATH}/music-entries.json`

export const ensureStore = async () => {
  if (!await exists(BASE_STORE_PATH, { dir: BaseDirectory.AppData })) await createDir(BASE_STORE_PATH, { dir: BaseDirectory.AppData, recursive: true })
}

export const ensureMainConf = async () => {
  await ensureStore()
  if (!await exists(MAIN_CONF_PATH, { dir: BaseDirectory.AppData })) await writeTextFile(MAIN_CONF_PATH, '{}', { dir: BaseDirectory.AppData })
}

export const ensureMusicEntries = async () => {
  await ensureStore()
  if (!await exists(MUSIC_ENTRIES_PATH, { dir: BaseDirectory.AppData })) await writeTextFile(MUSIC_ENTRIES_PATH, '{}', { dir: BaseDirectory.AppData })
}

export const getMainConfWithEnsure = async () => {
  await ensureMainConf()
  return JSON.parse(await readTextFile(MAIN_CONF_PATH, { dir: BaseDirectory.AppData })) as JoueurConf
}

export const getMusicEntries = async () => {
  await ensureMusicEntries()
  return JSON.parse(await readTextFile(MUSIC_ENTRIES_PATH, { dir: BaseDirectory.AppData })) as Song[]
}

export const saveMusicEntries = async (entries: Song[]) => {
  await writeTextFile(MUSIC_ENTRIES_PATH, JSON.stringify(entries), { dir: BaseDirectory.AppData })
}

export const hasSong = async (id: string) => {
  const musicEntries = await getMusicEntries()
  return musicEntries.some(song => song.id === id)
}

export const addSong = async (song: Song) => {
  if (!hasSong(song.id)) {
    const musicEntries = await getMusicEntries()
    musicEntries.push(song)
    saveMusicEntries(musicEntries)
  }
}

export const addSongs = async (songs: Song[]) => {
  const musicEntries = await getMusicEntries()
  const newSongs = songs.filter(s1 => musicEntries.every(s2 => s2.id !== s1.id))
  musicEntries.push(...newSongs)
  saveMusicEntries(musicEntries)
}
