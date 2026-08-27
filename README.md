# Lanterns of the Eternal Kingdom

A cinematic romantic visual novel set in the royal kingdom of Noorabad.

## How to Play
1. Ensure all files (`index.html`, `style.css`, `game.js`) are in the same folder.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).
3. Use your mouse to click through dialogue or press **Space/Enter**.
4. Press **Esc** to open settings.

## Asset Customization
The game uses a robust placeholder system. To add real art:
- Create an `assets` folder.
- Backgrounds: Place `.jpg` files named `bg_palace_balcony_night.jpg`, etc.
- Characters: Place transparent `.png` files named `char_amara_worried.png`, etc.
- Music: Place `.mp3` files in `assets/audio/`.

## Story Structure
The game is built on a non-linear branching data structure found in `game.js`. 
To add scenes, simply append new objects to the `STORY_DATA` constant.
