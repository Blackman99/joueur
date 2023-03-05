interface WithAutoGenerateId {
  id: number
}

interface WithTitle extends WithAutoGenerateId {
  title: string
}

export interface Song extends WithTitle {
  path: string
  artist?: string
  album?: string
  year?: number
  cover?: string
  duration?: number
  display_duration?: string
}

export interface Album extends WithTitle {
  cover?: string
}

export interface Playlist extends WithTitle {
  songIds: number[]
}

export interface Artist extends WithTitle {
  songIds: number[]
}

export interface Setting extends WithTitle {
  description: string
}
