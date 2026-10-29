WEEK 4 SCHOOL LIFE SMARTBOARD SITE

START
1. Double-click index.html for a quick offline check.
2. For the most reliable classroom use, run a simple local web server in this folder.
3. Open the printed local address and press F or the Full Screen button.

WINDOWS LOCAL SERVER EXAMPLE
python -m http.server 8765

FILES
- index.html: main lesson
- styles.css: smartboard layout and animations
- app.js: all lesson logic; no server or database
- weekday-cards.html: printable day cards and WEEKEND banner
- assets/: compressed local WebP images

TEACHER KEYS
- Right Arrow or Space: next teacher-controlled step
- Left Arrow: previous section
- F: full screen
- M: lesson menu
- Escape: close menu

LESSON FLOW
Warm-up -> Meet My Friends -> Days Chain -> Place Story -> Place Quiz -> Success -> Choose a Friend -> School Map -> Wrap-up

SMARTBOARD NOTES
- The page is designed for 16:9 displays, including 1366 x 768.
- There is no vertical scrolling in the main lesson.
- Buttons and map targets are large enough for touch use.
- Wrong quiz and map choices do not reveal the correct answer.
- The map uses all nine places before a new random cycle begins and prevents an immediate repeat.
- The map loop continues until the teacher presses Finish lesson or uses the menu.
- Browser speech synthesis is optional. The lesson works without sound.
- The site is fully static and does not require internet access after the folder is copied.
- This version has not been deployed.
