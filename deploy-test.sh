rm -rf ./build
mkdir build && cd build
cp ../lambda/*.js .
cp -R ../lambda/node_modules .


zip -X -r index.zip *.js node_modules

aws lambda update-function-code --function-name qldbApi --zip-file fileb://index.zip
