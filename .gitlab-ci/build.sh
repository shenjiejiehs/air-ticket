#!/bin/bash
echo "start building..."
ln -s /cache/npm_pkg/gulp/node_modules node_modules
npm run build
cp -R /cache/npm_pkg/app/node_modules dist/node_modules
cd ./dist && tar -zcvf ../build.tar.gz *
echo "building succeeded!"
