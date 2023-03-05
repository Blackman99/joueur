import Dexie from 'dexie'
import { DEFAULT_PLAYLIST_TITLE } from './constants'
import type { Album, Artist, Playlist, Setting, Song } from './types'

class JoueurDB extends Dexie {
  songs!: Dexie.Table<Song, number>
  albums!: Dexie.Table<Album, any>
  playlists!: Dexie.Table<Playlist, number>
  artists!: Dexie.Table<Artist, number>
  settings!: Dexie.Table<Setting, number>

  constructor() {
    super('JoueurDB')

    this.version(12).stores({
      songs: '++id,title,album,artist,path',
      albums: '++id,title,artist',
      playlists: '++id,title',
      artists: '++id',
      settings: '++id',
    })
  }

  async songExists(song: Song) {
    return !!await this.songs.where('path').equals(song.path).and(s => s.title === song.title).and(s => s.artist === song.artist).count()
  }

  // get the default 'All' playlist
  async getAllList() {
    let allList = await this.playlists.where('title').equals(DEFAULT_PLAYLIST_TITLE).first()
    if (!allList) {
      allList = {
        id: -1,
        title: DEFAULT_PLAYLIST_TITLE,
        songIds: [],
      } as Playlist
      const id = await this.playlists.put(allList)
      allList.id = id
      return allList
    }
    return allList
  }

  // use this instead of `this.songs.add`
  async addSong(song: Song) {
    const isExist = await this.songExists(song)
    if (!isExist) {
      const newSongId = await this.songs.put(song)
      const allList = await this.getAllList()
      allList.songIds.push(newSongId)
      await this.playlists.update(allList.id, allList)
    }
  }

  // use this instead of `this.songs.bulkAdd`
  async addSongs(songs: Song[]) {
    const newSongs = []
    for (const song of songs) {
      const isExist = await this.songExists(song)
      if (!isExist) newSongs.push(song)
    }
    const newSongIds = await this.songs.bulkAdd(newSongs, {
      allKeys: true,
    })
    const allList = await this.getAllList()
    allList.songIds.push(...newSongIds)
    await this.playlists.update(allList.id, allList)
  }
}

export const db = new JoueurDB()
