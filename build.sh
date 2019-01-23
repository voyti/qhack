rm -rf dist
mkdir dist
mkdir dist/app
cp -R -a resources dist/resources
cp index.html dist/index.html
uglifyjs app/* -o dist/app/app.js