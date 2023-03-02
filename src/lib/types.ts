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
  id: string
  title: string
  artist: string
  album: string
  year: number
}

export interface Album {
  name: string
  cover: string
}
