import {
  BaseDirectory,
  createDir,
  exists,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/api/fs'

export const BASE_STORE_PATH = 'store'
export const MAIN_CONF_PATH = `${BASE_STORE_PATH}/joueur.conf`

export const ensureStore = async () => {
  if (!await exists(BASE_STORE_PATH, { dir: BaseDirectory.AppData })) await createDir(BASE_STORE_PATH, { dir: BaseDirectory.AppData, recursive: true })
}

export const getMainConfWithEnsure = async () => {
  await ensureStore()
  if (!await exists(MAIN_CONF_PATH, { dir: BaseDirectory.AppData })) await writeTextFile(MAIN_CONF_PATH, '{}', { dir: BaseDirectory.AppData })
  return await readTextFile(MAIN_CONF_PATH, { dir: BaseDirectory.AppData })
}
