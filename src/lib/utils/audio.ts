import type { FileEntry } from '@tauri-apps/api/fs'
import { invoke } from '@tauri-apps/api'
import { get } from 'svelte/store'
import type { Album, Artist, Song } from '../types'
import { playingSong } from '../store'
import { AUDIO_EXTENSIONS } from '$lib/constants'
import { db } from '$lib/db'

export const isAudio = (path: string) => AUDIO_EXTENSIONS.includes(path.split('.').pop()?.toLowerCase() || '')

export const getSongInfoFromFile = async (filePath: string) => {
  const song = await invoke('get_metadata', { path: filePath })
  return song as Song
}

export const parseSongsFromFileEntries = async (fileEntries: FileEntry[], songs: Song[] = []) => {
  const parseEntry = async (entry: FileEntry) => {
    if (isAudio(entry.path)) {
      const song = await getSongInfoFromFile(entry.path)
      if (song) songs.push(song)
    }
    else if (entry.children?.length)
    { await parseSongsFromFileEntries(entry.children, songs) }
  }
  for (const entry of fileEntries)
    await parseEntry(entry)
  return songs
}

export const updateSongLyrics = async (song: Song, lyrics: string) => {
  try {
    await invoke('update_lyrics', { path: song.path, lyrics })
    const lyc = song.lyrics[0]
    if (lyc) {
      lyc.text = lyrics
    } else {
      song.lyrics.push({
        text: lyrics,
        description: '',
        lang: 'XXX',
      })
    }
    await db.songs.update(song.id, song)
    if (get(playingSong)?.id === song.id)
      playingSong.set(song)
  } catch (error) {
  }
}

export const updateAlbum = async (album: Album, albumTitle: string) => {
  try {
    const songs = await db.songs.where('album').equals(album.title).and(s => s.artist === album.artist).toArray()
    await Promise.all(songs.map(async song => await invoke('update_album', { path: song.path, albumTitle })))
    await db.transaction('rw', db.songs, db.albums, async () => {
      album.title = albumTitle
      await db.albums.update(album.id, album)
      await Promise.all(songs.map(async song => {
        song.album = albumTitle
        await db.songs.update(song.id, song)
      }))
    })
  } catch (error) {
  }
}

export const updateAlbumBySong = async (song: Song, albumTitle: string) => {
  const album = await db.albums.where('title').equals(song.album).and(al => al.artist === song.artist).first()
  if (album)
    await updateAlbum(album, albumTitle)
}

export const updateCover = async (song: Song, imagePath: string) => {
  const imageBase64 = await invoke('update_cover', {
    songPath: song.path,
    imagePath,
  }) as string
  song.cover = imageBase64
  await db.songs.update(song.id, song)
}

export const updateTitle = async (song: Song, newTitle: string) => {
  await invoke('update_title', {
    path: song.path,
    title: newTitle,
  })
  song.title = newTitle
  await db.songs.update(song.id, song)
}

export const updateArtist = async (song: Song, newArtistName: string) => {
  await db.transaction('rw', db.artists, db.songs, async () => {
    const oldArtist = await db.artists.filter(ar => ar.title === song.artist && ar.songIds.includes(song.id)).first()
    if (oldArtist) {
      oldArtist.albumIds = oldArtist.songIds.filter(s => s !== song.id)
      await db.artists.update(oldArtist.id, oldArtist)
    }
    const existingArtist = await db.artists.filter(ar => ar.title === newArtistName).first()
    if (existingArtist) {
      existingArtist.songIds.push(song.id)
      await db.artists.update(existingArtist.id, existingArtist)
    } else {
      const newArtist = {
        title: newArtistName,
        songIds: [song.id],
        addTime: new Date(),
      } as Artist
      await db.artists.put(newArtist)
    }
    song.artist = newArtistName
    await db.songs.update(song.id, song)
  })

  await invoke('update_artist', {
    path: song.path,
    artist: newArtistName,
  })
}
