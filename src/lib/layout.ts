import { derived, writable } from 'svelte/store'

const SMALL = 800

export const windowInnerWidth = writable(0)
export const isSm = derived(windowInnerWidth, w => w < SMALL)
