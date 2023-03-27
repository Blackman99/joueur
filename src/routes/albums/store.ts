import { writable } from 'svelte/store'
import { liveQuery } from 'dexie'
import type { Readable } from 'svelte/store'
import type { Album, Song } from '$lib/types'
import { db } from '$lib/db'
export const SELECTED_ALBUM_KEY = 'JOUEUR_SELECTED_ALBUM'

export const selectedAlbum = writable<Album | undefined>()

export const selectedAlbumSongs = writable<Song[]>([])

export const albums = writable<Album[]>([])
export const offset = writable(0)
export const limit = writable(10)
export const scrollTop = writable(0)

export const totalAlbumNumber = liveQuery(() => db.albums.count()) as unknown as Readable<number>
