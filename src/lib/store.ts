import { writable } from 'svelte/store'

export const PLAYING_SONG_ID_KEY = 'JOUEUR_PLAYING_SONG_ID_KEY'

export const playingSongId = writable(Number(localStorage.getItem(PLAYING_SONG_ID_KEY)))

playingSongId.subscribe(newSongId => {
  localStorage.setItem(PLAYING_SONG_ID_KEY, newSongId.toString())
})
