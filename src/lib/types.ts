export interface JoueurConf {
  themeColor?: string
}

export interface Song {
  id?: number
  path: string
  title?: string
  artist?: string
  album?: string
  year?: number
  cover?: string
}

export interface Album {
  title: string
  cover?: string
}
