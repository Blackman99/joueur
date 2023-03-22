import { liveQuery } from 'dexie'
import { derived, get, writable } from 'svelte/store'
import type { Readable } from 'svelte/store'
import { db } from './db'
import type { Mode, Playlist, Song } from './types'
import { twoDigits } from './utils/format'

// local storage keys
export const PLAYING_SONG_ID_KEY = 'JOUEUR_PLAYING_SONG_KEY'
export const SELECTED_PLAYLIST_ID_KEY = 'JOUEUR_SELECTED_PLAYLIST_KEY'
export const CURRENT_TIME_KEY = 'JOUEUR_CURRENT_TIME_KEY'
export const PLAYING_KEY = 'JOUEUR_PLAYING_KEY'
export const CURRENT_SONGS_KEY = 'JOUEUR_CURRENT_SONGS_KEY'
export const VOLUME_KEY = 'JOUEUR_VOLUME_KEY'
export const MODE_KEY = 'JOUEUR_MODE_KEY'
export const COLOR_MODE_KEY = 'JOUEUR_COLOR_MODE'

// global states
export const paused = writable(localStorage.getItem(PLAYING_KEY) === 'off')
export const playingSongId = writable(Number(localStorage.getItem(PLAYING_SONG_ID_KEY)))
export const playingSong = writable<Song | undefined>()
export const playedSeconds = writable(Number(localStorage.getItem(CURRENT_TIME_KEY)))
export const selectedPlaylistId = writable(Number(localStorage.getItem(SELECTED_PLAYLIST_ID_KEY) || -1))
export const selectedPlaylistSongNumber = writable(0)
export const currentPlaylistSongs = writable<Song[]>([])
export const selectedPlaylistOffset = writable(0)
export const selectedPlaylistLimit = writable(10)

export const currentPlayingSongIds = writable<number[]>([])
const storeVolume = localStorage.getItem(VOLUME_KEY)
export const volume = writable(storeVolume === null ? 1 : Number(storeVolume))
export const mode = writable<Mode>(localStorage.getItem(MODE_KEY) as Mode || 'repeat-list')
export const audioDom = writable<HTMLAudioElement>()
export const duration = writable(0)
export const isDark = writable(localStorage.getItem(COLOR_MODE_KEY) === 'on')
export const inWindow = writable(true)

export const displayPlayedSeconds = derived(playedSeconds, $playedSeconds => {
  const minutes = Math.floor($playedSeconds / 60)
  const secondsRemain = $playedSeconds % 60
  return `${twoDigits(minutes)}:${twoDigits(Math.ceil(secondsRemain))}`
})

export const displayDuration = derived(duration, $duration => {
  const minutes = Math.floor($duration / 60)
  const secondsRemain = $duration % 60
  return `${twoDigits(minutes)}:${twoDigits(Math.ceil(secondsRemain))}`
})

const totalSongsNumber = liveQuery(async () => await db.songs.count())

export const playlists = liveQuery(() =>
  db.playlists.toArray(),
) as unknown as Readable<Playlist[]>

export async function refreshCurrentSongs() {
  const selectedPlayList = await db.playlists.where('id').equals(get(selectedPlaylistId)).first()
  if (selectedPlayList) {
    selectedPlaylistSongNumber.set(selectedPlayList.songIds.length)
    return currentPlaylistSongs.set(await db.songs.where('id').anyOf(selectedPlayList.songIds || []).offset(get(selectedPlaylistOffset)).limit(get(selectedPlaylistLimit)).toArray())
  }

  return []
}

export const playNext = () => {
  const $playingSong = get(playingSong)
  if (!$playingSong) return
  const $currentPlayingSongIds = get(currentPlayingSongIds)
  const $mode = get(mode)
  const currentIndex = $currentPlayingSongIds.findIndex(id => id === $playingSong.id)
  const shuffleNext = () => {
    let nextIndex = Math.floor(Math.random() * $currentPlayingSongIds.length)
    while (nextIndex === currentIndex && $currentPlayingSongIds.length > 1)
      nextIndex = Math.floor(Math.random() * $currentPlayingSongIds.length)
    playingSongId.set($currentPlayingSongIds[nextIndex])
  }
  switch ($mode) {
    case 'repeat-list':
      if (currentIndex !== -1)
        playingSongId.set($currentPlayingSongIds[(currentIndex + 1) % $currentPlayingSongIds.length])

      break
    case 'repeat-one':
      get(audioDom).load()
      break
    case 'shuffle':
      shuffleNext()
  }
}

export const playPrev = () => {
  const $playingSong = get(playingSong)
  const $currentPlayingSongIds = get(currentPlayingSongIds)
  if (!$playingSong) return
  const currentIndex = $currentPlayingSongIds.findIndex(id => id === $playingSong.id)
  if (currentIndex !== -1) {
    if (currentIndex > 0)
      playingSongId.set($currentPlayingSongIds[currentIndex - 1])
    else
      playingSongId.set($currentPlayingSongIds[$currentPlayingSongIds.length - 1])
  }
}

export const togglePlayOrPause = () => {
  const $audioDom = get(audioDom)
  if ($audioDom.paused) {
    $audioDom.currentTime = get(playedSeconds)
    $audioDom.play()
  }
  else {
    $audioDom.pause()
  }
}

totalSongsNumber.subscribe(() => refreshCurrentSongs())
