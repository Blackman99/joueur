import Dexie from 'dexie'
import type { Album, Artist, Playlist, Setting, Song } from './types'

class JoueurDB extends Dexie {
  songs!: Dexie.Table<Song, number>
  albums!: Dexie.Table<Album, any>
  playlists!: Dexie.Table<Playlist, number>
  artists!: Dexie.Table<Artist, number>
  settings!: Dexie.Table<Setting, number>

  constructor() {
    super('JoueurDB')

    this.version(11).stores({
      songs: '++id,title,album,artist',
      albums: '++id,title,artist',
      playlists: '++id,title',
      artists: '++id',
      settings: '++id',
    })
  }
}

export const db = new JoueurDB()
