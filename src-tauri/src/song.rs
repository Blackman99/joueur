use serde::Serialize;

#[derive(Serialize)]
pub struct LyricsItem {
    pub text: String,
    pub description: String,
    pub lang: String
}


#[derive(Serialize)]
pub struct Song {
    pub path: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub year: Option<i32>,
    pub cover: Option<String>,
    pub duration: Option<u128>,
    pub display_duration: Option<String>,
    pub lyrics: Option<Vec<LyricsItem>>
}
