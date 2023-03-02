import {
  BaseDirectory,
  createDir,
  exists,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/api/fs'
import type { JoueurConf } from './types'

export const BASE_STORE_PATH = 'store'
export const MAIN_CONF_PATH = `${BASE_STORE_PATH}/joueur.conf`
export const MUSIC_ENTRIES_PATH = `${BASE_STORE_PATH}/music-entries.json`

export const ensureStore = async () => {
  if (!await exists(BASE_STORE_PATH, { dir: BaseDirectory.AppData })) await createDir(BASE_STORE_PATH, { dir: BaseDirectory.AppData, recursive: true })
}

export const ensureMainConf = async () => {
  if (!await exists(MAIN_CONF_PATH, { dir: BaseDirectory.AppData })) await writeTextFile(MAIN_CONF_PATH, '{}', { dir: BaseDirectory.AppData })
}

export const ensureMusicEntries = async () => {
  if (!await exists(MUSIC_ENTRIES_PATH, { dir: BaseDirectory.AppData })) await writeTextFile(MUSIC_ENTRIES_PATH, '{}', { dir: BaseDirectory.AppData })
}

export const getMainConfWithEnsure = async () => {
  await ensureStore()
  await ensureMainConf()
  return JSON.parse(await readTextFile(MAIN_CONF_PATH, { dir: BaseDirectory.AppData })) as JoueurConf
}

export const getMusicEntries = async () => {
  await ensureStore()
  await ensureMusicEntries()
}
