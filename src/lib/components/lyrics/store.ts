import { writable } from 'svelte/store'
import type { Song } from '$lib/types'

export const updateLyricsDialogOpen = writable(false)
export const songToUpdateLyrics = writable<Song>()
export const editLyricsContent = writable('')
