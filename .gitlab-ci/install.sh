#!/bin/bash
echo "Installing npm modules..."
# set node-sass binary mirror site
export SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass/

yarn config set registry http://192.168.2.174:4873

GULP_CACHE_DIR=/cache/npm_pkg/gulp
APP_CACHE_DIR=/cache/npm_pkg/app

GULP_PKG=`readlink -f package.json`
GULP_YARN_LOCK=`readlink -f yarn.lock`
APP_PKG=`readlink -f app/package.json`
APP_YARN_LOCK=`readlink -f app/yarn.lock`

mkdir -p $GULP_CACHE_DIR && mkdir -p $APP_CACHE_DIR

if [[ -e $GULP_CACHE_DIR/package.json &&  -z `diff -p $GULP_PKG $GULP_CACHE_DIR/package.json` ]]
then
  echo "no update for gulp npm install!"
else
  cp $GULP_PKG $GULP_CACHE_DIR/package.json &&\
    if [[ -e $GULP_YARN_LOCK ]]; then cp $GULP_YARN_LOCK $GULP_CACHE_DIR/yarn.lock; fi &&\
    cd $GULP_CACHE_DIR && yarn
fi


if [[ -e $APP_CACHE_DIR/package.json &&  -z `diff -p $APP_PKG $APP_CACHE_DIR/package.json` ]]
then
  echo "no update for app npm install!"
else
  cp $APP_PKG $APP_CACHE_DIR/package.json &&\
    if [[ -e $APP_YARN_LOCK ]]; then cp $APP_YARN_LOCK $APP_CACHE_DIR/yarn.lock; fi &&\
    cd $APP_CACHE_DIR && yarn
fi
