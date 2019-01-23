rm -rf dist
mkdir dist
mkdir dist/app
cp -R -a resources dist/resources
cp index.html dist/index.html
terser app/app.js --compress --mangle -o dist/app/app.js
terser app/drawing.js --compress --mangle -o dist/app/drawing.js
terser app/audio.js --compress --mangle -o dist/app/audio.js
terser app/board.js --compress --mangle -o dist/app/board.js


rm -rf dist/.DS_Store
rm -rf dist/app/.DS_Store
rm -rf dist/resources/.DS_Store