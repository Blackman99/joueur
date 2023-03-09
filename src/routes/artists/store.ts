import { writable } from 'svelte/store'
import type { Artist, Song } from '$lib/types'

export const SELECTED_ARTIST_KEY = 'JOUEUR_SELECTED_ALBUM'

export const selectedArtist = writable<Artist | undefined>()

export const selectedArtistSongs = writable<Song[]>([])
