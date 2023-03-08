import { writable } from 'svelte/store'
import type { Album, Song } from '$lib/types'

export const SELECTED_ALBUM_KEY = 'JOUEUR_SELECTED_ALBUM'

export const selectedAlbum = writable<Album | undefined>()

export const selectedAlbumSongs = writable<Song[]>([])
