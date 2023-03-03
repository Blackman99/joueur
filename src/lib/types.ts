export interface JoueurConf {
  themeColor?: string
}

export interface Song {
  id: number
  path: string
  title?: string
  artist?: string
  album?: string
  year?: number
  cover?: string
  duration?: number
  display_duration?: string
}

export interface Album {
  title: string
  cover?: string
}

export interface Playlist {
  title: string
  songIds?: number[]
}

export interface Artist {
  title?: string
  songIds: number[]
}

export interface Setting {
  title: string
  description: string
}
