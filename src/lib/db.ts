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

    this.version(13).stores({
      songs: '++id,title,album,artist,path',
      albums: '++id,title,artist',
      playlists: '++id,title',
      artists: '++id,title',
      settings: '++id',
    })
  }

  /**
   * Make sure the song is unique by compare the combination of path, title, artist.
   */
  async songExists(song: Song) {
    return !!await this.songs
      .where('path').equals(song.path)
      .and(s => s.title === song.title)
      .and(s => s.artist === song.artist)
      .count()
  }

  /**
   * Get the default 'All' playlist. Would auto create the default list when there's none.
   * @returns The `'All'` list
   */
  async getAllList() {
    let allList = await this.playlists.where('title').equals(DEFAULT_PLAYLIST_TITLE).first()
    if (!allList) {
      allList = {
        id: -1,
        title: DEFAULT_PLAYLIST_TITLE,
        songIds: (await this.songs.toArray()).map(song => song.id),
      } as Playlist
      const id = await this.playlists.put(allList)
      allList.id = id
      return allList
    }
    return allList
  }

  /**
   * Add or update artist based on the new added song info.
   * @param song the new added song
   */
  async addOrUpdateArtistBySong(song: Song) {
    const existingArtist = await this.artists.where('title').equals(song.artist).first()
    if (!existingArtist) {
      await this.artists.put({ title: song.artist, songIds: [song.id] } as unknown as Artist)
    } else {
      existingArtist.songIds.push(song.id)
      await this.artists.update(existingArtist.id, existingArtist)
    }
  }

  /**
   * Add or update album based on the new added song info.
   * @param song the new added song
   */
  async addOrUpdateAlbumBySong(song: Song) {
    const existingAlbum = await this.albums.where('title').equals(song.album).and(al => al.artist === song.artist).first()

    if (!existingAlbum) {
      await this.albums.put({
        title: song.album,
        songIds: [song.id],
        artist: song.artist,
        cover: song.cover,
      } as unknown as Album)
    } else {
      existingAlbum.songIds.push(song.id)
      await this.albums.update(existingAlbum.id, existingAlbum)
    }
  }

  /**
   * Always use this instead of `db.songs.add`
   * @param song The song to add
   */
  async addSong(song: Song) {
    const isExist = await this.songExists(song)
    if (isExist) return
    const newSongId = await this.songs.put(song)
    song.id = newSongId

    // Add new song to default `'all'` list
    const allList = await this.getAllList()
    allList.songIds.push(newSongId)
    await this.playlists.update(allList.id, allList)

    // grouping the artist
    await this.addOrUpdateArtistBySong(song)

    // grouping the album
    await this.addOrUpdateAlbumBySong(song)
  }

  /**
   * Always use this instead of `db.songs.bulkAdd`
   * @param songs songs to add
   */
  async addSongs(songs: Song[]) {
    const newSongs = []
    for (const song of songs) {
      const isExist = await this.songExists(song)
      if (!isExist)
        newSongs.push(song)
    }
    const newSongIds = await this.songs.bulkAdd(newSongs, {
      allKeys: true,
    })

    for (let i = 0; i < newSongs.length; i++) {
      const newSong = newSongs[i]
      newSong.id = newSongIds[i]
      await this.addOrUpdateArtistBySong(newSong)
      await this.addOrUpdateAlbumBySong(newSong)
    }

    // Add new song to default `'all'` list
    const allList = await this.getAllList()
    allList.songIds.push(...newSongIds)
    await this.playlists.update(allList.id, allList)
  }

  /**
   * Add new playlist. Always use this instead of `db.playlists.put`
   * @param newPlayListTitle The new playlist title
   */
  async addPlaylist(newPlayListTitle: string) {
    const existingPlayList = await this.playlists.where('title').equals(newPlayListTitle).first()
    if (existingPlayList) return
    const newPlayList = {
      title: newPlayListTitle,
      songIds: [],
    } as unknown as Playlist
    await this.playlists.put(newPlayList)
  }
}

export const db = new JoueurDB()
