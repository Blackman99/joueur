import { liveQuery } from 'dexie'
import { derived, get, writable } from 'svelte/store'
import { db } from './db'
import type { Song } from './types'

export const PLAYING_SONG_ID_KEY = 'JOUEUR_PLAYING_SONG_ID_KEY'

export const playingSongId = writable(Number(localStorage.getItem(PLAYING_SONG_ID_KEY)))

export const playedMilliseconds = writable(0)

export const displayPlayedSeconds = derived(playedMilliseconds, $playedMilliseconds => {
  const totalSeconds = Math.ceil($playedMilliseconds / 60)
  const minutes = Math.floor(totalSeconds / 60)
  const secondsRemain = totalSeconds % 60
  return `${twoDigits(minutes)}:${twoDigits(secondsRemain)}`
})

export const selectedPlaylistId = writable(-1)
const totalSongsNumber = liveQuery(async () => await db.songs.count())

refreshCurrentSongs()

selectedPlaylistId.subscribe(refreshCurrentSongs)
totalSongsNumber.subscribe(refreshCurrentSongs)

export const currentSongsInList = writable<Song[]>([])

playingSongId.subscribe(newSongId => {
  localStorage.setItem(PLAYING_SONG_ID_KEY, newSongId.toString())
})

function twoDigits(n: number) {
  return n.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })
}

async function refreshCurrentSongs() {
  const $id = get(selectedPlaylistId)
  const selectedPlayList = await db.playlists.where('id').equals($id).first()
  if (selectedPlayList)
    return currentSongsInList.set(await db.songs.where('id').anyOf(selectedPlayList.songIds || []).toArray())

  return []
}
