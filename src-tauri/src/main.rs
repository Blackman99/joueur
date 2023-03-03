use song::Song;
use tauri::Manager;
use id3::{Tag, TagLike};
mod song;

#[cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_metadata(path: &str) -> Song {
    let song = match Tag::read_from_path(path) {
        Ok(tag) => {
            Song {
                path: String::from(path),
                title: match tag.title() {
                    None => None,
                    Some(title) => Some(String::from(title))
                },
                artist: match tag.artist() {
                    None => None,
                    Some(title) => Some(String::from(title))
                },
                album: match tag.album() {
                    None => None,
                    Some(title) => Some(String::from(title))
                },
                year: tag.year(),
                cover: None
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
