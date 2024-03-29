import { writable } from 'svelte/store'
import type { Song } from '$lib/types'

export const updateLyricsDialogOpen = writable(false)
export const songToUpdateTags = writable<Song>()
export const editLyricsContent = writable('')

export const fullscreen = writable(false)
export const quittingFullscreen = writable(false)
