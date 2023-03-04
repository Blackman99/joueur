import { derived, writable } from 'svelte/store'

export const PLAYING_SONG_ID_KEY = 'JOUEUR_PLAYING_SONG_ID_KEY'

export const playingSongId = writable(Number(localStorage.getItem(PLAYING_SONG_ID_KEY)))

export const playedMilliseconds = writable(0)

export const displayPlayedSeconds = derived(playedMilliseconds, $playedMilliseconds => {
  const totalSeconds = Math.ceil($playedMilliseconds / 60)
  const minutes = Math.floor(totalSeconds / 60)
  const secondsRemain = totalSeconds % 60
  return `${twoDigits(minutes)}:${twoDigits(secondsRemain)}`
})

function twoDigits(n: number) {
  return n.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })
}

playingSongId.subscribe(newSongId => {
  localStorage.setItem(PLAYING_SONG_ID_KEY, newSongId.toString())
})
