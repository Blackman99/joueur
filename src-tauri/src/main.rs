use base64::{Engine as _, engine::general_purpose};
use song::{Song, LyricsItem};
use id3::{Tag, TagLike};
mod song;

#[cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]


#[tauri::command]
fn get_metadata(path: &str) -> Option<Song> {
    match Tag::read_from_path(path) {
        Ok(tag) => {
            let lyrics: Vec<LyricsItem> = tag.lyrics().into_iter().map(|f| LyricsItem {
                text: f.text.to_owned(),
                description: f.description.to_owned(),
                lang: f.lang.to_owned()
            }).collect();
            Some(Song {
                path: String::from(path),
                title: unwrap_str(tag.title()),
                artist: unwrap_str(tag.artist()),
                album: unwrap_str(tag.album()),
                year: tag.year(),
                lyrics: Some(lyrics),
                cover: match tag.pictures().next() {
                    None => None,
                    Some(p) => {
                        let mut str = "data:".to_owned();
                        str.push_str(&p.mime_type);
                        str.push_str(";base64, ");
                        let base64_str = general_purpose::STANDARD_NO_PAD.encode(&p.data);
                        str.push_str(&base64_str);
                        Some(str)
                    }
                }
            })
        },
        Err(_e) => None
    }
}

fn unwrap_str(var: Option<&str>) -> Option<String> {
    match var {
        None => None,
        Some(str) => Some(String::from(str))
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_metadata])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
