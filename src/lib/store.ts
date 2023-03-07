import { liveQuery } from 'dexie'
import { derived, get, writable } from 'svelte/store'
import type { Readable } from 'svelte/store'
import { db } from './db'
import type { Playlist, Song } from './types'
import { twoDigits } from './utils/format'

export const PLAYING_SONG_ID_KEY = 'JOUEUR_PLAYING_SONG_ID_KEY'
export const SELECTED_PLAYLIST_ID_KEY = 'JOUEUR_SELECTED_PLAYLIST_ID_KEY'
export const CURRENT_TIME_KEY = 'JOUEUR_CURRENT_TIME_ID_KEY'
export const PLAYING_KEY = 'JOUEUR_PLAYING_KEY_ID'

export const playingSongId = writable(Number(localStorage.getItem(PLAYING_SONG_ID_KEY)))

export const playingSong = derived(playingSongId, async $id => await db.songs.where('id').equals($id).first())

export const playedMilliseconds = writable(0)

export const selectedPlaylistId = writable(Number(localStorage.getItem(SELECTED_PLAYLIST_ID_KEY)))

export const currentSongsInList = writable<Song[]>([])

export const playing = writable(localStorage.getItem(PLAYING_KEY) === 'on')

export const currentTime = writable(Number(localStorage.getItem(CURRENT_TIME_KEY) || 0))

export const displayPlayedSeconds = derived(playedMilliseconds, $playedMilliseconds => {
  const totalSeconds = Math.ceil($playedMilliseconds / 60)
  const minutes = Math.floor(totalSeconds / 60)
  const secondsRemain = totalSeconds % 60
  return `${twoDigits(minutes)}:${twoDigits(secondsRemain)}`
})

const totalSongsNumber = liveQuery(async () => await db.songs.count())

export const playlists = liveQuery(() =>
  db.playlists.toArray(),
) as unknown as Readable<Playlist[]>

export async function refreshCurrentSongs($id: number) {
  const selectedPlayList = await db.playlists.where('id').equals($id).first()
  if (selectedPlayList)
    return currentSongsInList.set(await db.songs.where('id').anyOf(selectedPlayList.songIds || []).toArray())

  return []
}

totalSongsNumber.subscribe(() => refreshCurrentSongs(get(selectedPlaylistId)))

playingSongId.subscribe(newSongId => {
  localStorage.setItem(PLAYING_SONG_ID_KEY, newSongId.toString())
})
