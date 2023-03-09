interface WithAutoGenerateId {
  id: number
}

interface WithTitle extends WithAutoGenerateId {
  title: string
}

interface WithAddTime extends WithTitle {
  addTime: Date
}

interface WithSongs extends WithAddTime {
  songIds: number[]
}

export interface Song extends WithAddTime {
  path: string
  artist: string
  album: string
  year?: number
  cover?: string
  duration: number
  display_duration?: string
  lyrics: {
    text?: string
    description?: string
    lang?: string
  }[]
}

export interface Album extends WithSongs {
  artist: string
  cover?: string
}

export interface Playlist extends WithSongs {
}

export interface Artist extends WithSongs {
  songIds: number[]
  albumIds: number[]
}

export interface Setting extends WithTitle {
  description: string
}
