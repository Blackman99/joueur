import { type Readable, writable } from 'svelte/store'
import { liveQuery } from 'dexie'
import type { Artist, Song } from '$lib/types'
import { db } from '$lib/db'

export const SELECTED_ARTIST_KEY = 'JOUEUR_SELECTED_ALBUM'

export const selectedArtist = writable<Artist | undefined>()

export const selectedArtistSongs = writable<Song[]>([])

export const artists = writable<Artist[]>([])
export const totalArtistNumber = liveQuery(() => db.artists.count()) as unknown as Readable<number>
export const offset = writable(0)
export const limit = writable(10)
export const scrollTop = writable(0)
