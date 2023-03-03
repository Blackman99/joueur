import Dexie from 'dexie'
import type { Album, Song } from './types'

class JoueurDB extends Dexie {
  songs!: Dexie.Table<Song, number>
  albums!: Dexie.Table<Album, number>

  constructor() {
    super('JoueurDB')
    this.version(1).stores({
      songs: 'path',
    })
  }
}

export const db = new JoueurDB()
