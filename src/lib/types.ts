interface WithAutoGenerateId {
  id: number
}

interface WithTitle extends WithAutoGenerateId {
  title: string
}

interface WithSongs extends WithTitle {
  songIds: number[]
}

export interface Song extends WithTitle {
  path: string
  artist: string
  album: string
  year?: number
  cover?: string
  duration: number
  display_duration?: string
}

export interface Album extends WithSongs {
  artist: string
  cover?: string
}

export interface Playlist extends WithSongs {
}

export interface Artist extends WithSongs {
  songIds: number[]
}

export interface Setting extends WithTitle {
  description: string
}
