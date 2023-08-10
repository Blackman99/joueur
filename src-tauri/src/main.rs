#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{Engine as _, engine::general_purpose};
use song::{Song, LyricsItem};
use id3::{Tag, TagLike, Frame, Version};
use id3::frame::{Content, Lyrics, Picture, PictureType};
use mp3_duration;
use tauri::Manager;
use window_shadows::set_shadow;
mod song;
use std::io::Read;
use std::io::BufReader;
use std::fs::File;

#[tauri::command]
fn get_metadata(path: &str) -> Option<Song> {
    match Tag::read_from_path(path) {
        Ok(tag) => {
            let d = match mp3_duration::from_path(path){
                Ok(d) => Some(d),
                Err(_e) => None
            };
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
        Err(_e) => None,
    }
}

#[tauri::command]
fn update_lyrics(path: &str, lyrics: &str) -> Result<String, String> {
    let tag = Tag::read_from_path(path);
    match tag {
        Ok(mut t) => {
            t.add_frame(Frame::with_content("USLT", Content::Lyrics(Lyrics {
                text: lyrics.to_owned(),
                lang: String::from("XXX"),
                description: String::from("")
            })));
            match t.write_to_path(path, Version::Id3v24) {
                Err(e) => Err(e.description),
                Ok(_o) => Ok("Success".to_owned())
            }
        },
        Err(e) => Err(e.description)
    }
}

#[tauri::command]
fn update_title(path: &str, title: &str) -> Result<String, String> {
    let tag = Tag::read_from_path(path);
    match tag {
        Ok(mut t) => {
            t.set_title(title);
            match t.write_to_path(path, Version::Id3v24) {
                Err(e) => Err(e.description),
                Ok(_o) => Ok("Success".to_owned())
            }
        },
        Err(e) => Err(e.description)
    }
}

#[tauri::command]
fn update_cover(song_path: &str, image_path: &str) -> Result<String, String> {
    let tag = Tag::read_from_path(song_path);
    let f = File::open(image_path).unwrap();
    let mut reader = BufReader::new(f);
    let mut buffer = Vec::new();
    let _size = reader.read_to_end(&mut buffer);

    let mut base64_str = "data:image/jpeg;base64, ".to_owned();
    base64_str.push_str(&general_purpose::STANDARD_NO_PAD.encode(buffer.clone()));

    match tag {
        Ok(mut t) => {
            t.remove_all_pictures();
            t.add_frame(Frame::with_content("APIC", Content::Picture(Picture {
                mime_type: "image/jpeg".to_owned(),
                picture_type: PictureType::CoverFront,
                description: "".to_owned(),
                data: buffer,
            })));
            match t.write_to_path(song_path, Version::Id3v24) {
                Err(e) => Err(e.description),
                Ok(_o) => Ok(base64_str)
            }
        },
        Err(e) => Err(e.description)
    }
}

#[tauri::command]
fn update_album(path: &str, album_title: &str) -> Result<String, String> {
    let tag = Tag::read_from_path(path);
    match tag {
        Ok(mut t) => {
            t.set_album(album_title);
            match t.write_to_path(path, Version::Id3v24) {
                Err(e) => Err(e.description),
                Ok(_o) => Ok("Success".to_owned())
            }
        },
        Err(e) => Err(e.description)
    }
}

#[tauri::command]
fn update_artist(path: &str, artist: &str) -> Result<String, String> {
    let tag = Tag::read_from_path(path);
    match tag {
        Ok(mut t) => {
            t.set_artist(artist);
            match t.write_to_path(path, Version::Id3v24) {
                Err(e) => Err(e.description),
                Ok(_o) => Ok("Success".to_owned())
            }
        },
        Err(e) => Err(e.description)
    }
}

fn unwrap_str(var: Option<&str>) -> Option<String> {
    match var {
        None => Some(String::from("Unknown")),
        Some(str) => Some(String::from(str))
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            set_shadow(&window, true).expect("Unsupported platform!");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_metadata, 
            update_lyrics, 
            update_album,
            update_cover,
            update_title,
            update_artist
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
