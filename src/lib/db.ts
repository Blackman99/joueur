import Dexie from 'dexie'
import { get } from 'svelte/store'
import { DEFAULT_PLAYLIST_TITLE } from './constants'
import type { Album, Artist, Playlist, Setting, Song } from './types'
import { selectedPlaylistId } from './store'

class JoueurDB extends Dexie {
  songs!: Dexie.Table<Song, number>
  albums!: Dexie.Table<Album, any>
  playlists!: Dexie.Table<Playlist, number>
  artists!: Dexie.Table<Artist, number>
  settings!: Dexie.Table<Setting, number>

  constructor() {
    super('JoueurDB')

    this.version(15).stores({
      songs: '++id,title,album,artist,path,addTime',
      albums: '++id,title,artist,addTime',
      playlists: '++id,title,addTime',
      artists: '++id,title,addTime',
      settings: '++id',
    })
  }

  /**
   * Make sure the song is unique by compare the combination of path, title, artist.
   */
  async songExists(song: Song) {
    return await this.songs
      .where('path').equals(song.path)
      .and(s => s.title === song.title)
      .and(s => s.artist === song.artist)
      .first()
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
      await this.artists.put({ title: song.artist, songIds: [song.id], addTime: new Date() } as unknown as Artist)
    } else if (!existingArtist.songIds.includes(song.id)) {
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
        addTime: new Date(),
      } as unknown as Album)
    } else if (!existingAlbum.songIds.includes(song.id)) {
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
    if (isExist) {
      song = isExist
    } else {
      song.addTime = new Date()
      if (!song.title)
        song.title = song.path.split('/').pop()?.replace(/\.mp3/, '') || ''
      if (!song.album) song.album = 'Unknown'
      if (!song.artist) song.artist = 'Unknown'

      const newSongId = await this.songs.put(song)
      song.id = newSongId
      // grouping the artist
      await this.addOrUpdateArtistBySong(song)

      // grouping the album
      await this.addOrUpdateAlbumBySong(song)
    }

    // Add new song to default `'all'` list
    const allList = await this.getAllList()
    if (!allList.songIds.includes(song.id)) {
      allList.songIds.push(song.id)
      await this.playlists.update(allList.id, allList)
    }

    // Add new song to current playlist
    const currentPlayListId = get(selectedPlaylistId)
    if (currentPlayListId !== allList.id) {
      const playList = await this.playlists.where('id').equals(currentPlayListId).first()
      if (playList && !playList.songIds.includes(song.id)) {
        playList.songIds.push(song.id)
        await this.playlists.update(playList.id, playList)
      }
    }
  }

  /**
   * Always use this instead of `db.songs.bulkAdd`
   * @param songs songs to add
   */
  async addSongs(songs: Song[]) {
    const newSongs = []
    let songIdsWillAddToPlaylist = []
    for (const song of songs) {
      const isExist = await this.songExists(song)
      if (!isExist) {
        song.addTime = new Date()
        newSongs.push(song)
      }
      else {
        songIdsWillAddToPlaylist.push(isExist.id)
      }
    }
    const newSongIds = await this.songs.bulkAdd(newSongs, {
      allKeys: true,
    })

    songIdsWillAddToPlaylist = songIdsWillAddToPlaylist.concat(newSongIds)

    for (let i = 0; i < newSongs.length; i++) {
      const newSong = newSongs[i]
      newSong.id = newSongIds[i]
      await this.addOrUpdateArtistBySong(newSong)
      await this.addOrUpdateAlbumBySong(newSong)
    }

    // Add new song to default `'all'` list
    const allList = await this.getAllList()
    allList.songIds = allList.songIds.concat(songIdsWillAddToPlaylist.filter(id => !allList.songIds.includes(id)))
    await this.playlists.update(allList.id, allList)

    // Add new song to current selected playlist
    const currentPlayListId = get(selectedPlaylistId)
    if (currentPlayListId !== allList.id) {
      const playList = await this.playlists.where('id').equals(currentPlayListId).first()
      if (playList) {
        playList.songIds = playList.songIds.concat(songIdsWillAddToPlaylist.filter(id => !playList.songIds.includes(id)))
        await this.playlists.update(playList.id, playList)
      }
    }
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
      addTime: new Date(),
      songIds: [],
    } as unknown as Playlist
    await this.playlists.put(newPlayList)
  }
}

export const db = new JoueurDB()
