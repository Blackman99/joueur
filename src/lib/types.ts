export interface JoueurConf {
  /**
   * Directories added by user
   */
  directoryEntries?: string[]
  /**
   * Single files added by user
   */
  fileEntries?: string[]
}

export interface Song {
  id: string // file path also used as id
  title?: string
  artist?: string
  album?: string
  year?: number
  cover?: string
}
