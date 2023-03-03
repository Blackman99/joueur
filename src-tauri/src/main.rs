use song::Song;
use tauri::Manager;
use id3::{Tag, TagLike};
mod song;
use base64::{Engine as _, engine::general_purpose};

#[cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]


#[tauri::command]
fn get_metadata(path: &str) -> Song {
    let song = match Tag::read_from_path(path) {
        Ok(tag) => {
            Song {
                path: String::from(path),
                title: unwrap_str(tag.title()),
                artist: unwrap_str(tag.artist()),
                album: unwrap_str(tag.album()),
                year: tag.year(),
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
            }
        },
        Err(_e) => {
            Song {
                path: String::from(path),
                title: None,
                artist: None,
                album: None,
                year: None,
                cover: None
            }
        }
    };
    song
}

fn unwrap_str(var: Option<&str>) -> Option<String> {
    match var {
        None => None,
        Some(s) => Some(String::from(s))
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_metadata])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
