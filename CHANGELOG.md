## Next

### 💪 Optimized

* Move logo and global search to top title bar
* Window control buttons' position go along with system behavior
* Layouts and player control optimize

### 🐛 Fixes

* Current playing songs style in fullscreen mode
* Current playing songs virtual scroll should reset when songs changed
* Album dialog popup editor text color
* Album and artist analyzing during songs add should be synchronized

## 0.1.1

### 💪 Optimized

* Add close button on album dialog
* Mode subscription changed to svelte auto by $
* Sidebar top logo can now dragging window

### 🐛 Fixes

* Title bar z-index should be less than backdrop
* Current playing song list styles
* Global search result width changed due to different results
* Playlist songs disappeared when full screen toggle back
* Add missing windows media and style csp 
* Command line prompt should not open in windows production
* Drop loading mask should have a larger z index than title bar

## 0.1.0

### 💡 Added

* Popup editor for album title in album dialog and lyrics editor dialog

### 💪 Optimized

* Resize observe use debounce
* Title bar and player control bottom bar auto hide in full screen mode
* Volume control dark mode style
* Optimize all queries with virtual scroll + pagination

### 🐛 Fixes

* Do not add song when id3 info pared is empty 
* Should use transaction for song and songs adding
* Use "Unknown" for song that cannot get album metadata
* Title bar left position should change along with sidebar width

## 0.0.3

### 💡 Added

* Global search
* Lyrics editable
  * By context menu
  * By current playing lyrics display module 
* Zen(Full screen) mode toggle
* Virtual scroll
* Dark Mode
* Customize title bar

### 💪 Optimized

* Context menu popup position
* Lyrics display position recompute when size change
* Global search layout ui

### 🐛 Fixes

* Lyrics display should exclude empty line

## 0.0.2

### 💡 Added

* Playing spectrum
* Album animation detail
* Settings about page

## 0.0.1


### 💡 Added

* Player core
* Drag & drop file
* Playlist CRUD
* Basic context menu
* Auto artist and album grouping
* Lyrics display