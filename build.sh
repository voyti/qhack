cp -r resources dist/resources
cp index.html dist/index.html
uglifyjs app/* -o dist/app.js