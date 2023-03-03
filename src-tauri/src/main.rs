use base64::{Engine as _, engine::general_purpose};
use song::Song;
use tauri::Manager;
use id3::{Tag, TagLike};
use mp3_duration;
mod song;

#[cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]


#[tauri::command]
fn get_metadata(path: &str) -> Option<Song> {
    match Tag::read_from_path(path) {
        Ok(tag) => {
            let d = match mp3_duration::from_path(path){
                Ok(d) => Some(d),
                Err(_e) => None
            };
            Some(Song {
                path: String::from(path),
                title: unwrap_str(tag.title()),
                artist: unwrap_str(tag.artist()),
                album: unwrap_str(tag.album()),
                year: tag.year(),
                duration: match d {
                    Some(d) => Some(d.as_millis()),
                    None => None
                },
                display_duration: match d {
                    None => None,
                    Some(d) => {
                        let seconds = d.as_secs() % 60;
                        Some(format!("{:02}:{:02}", (d.as_secs() - seconds) / 60, seconds))
                    }
                },
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
