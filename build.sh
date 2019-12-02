#!/usr/bin/env sh
BASEDIR=`dirname $0`

cd $BASEDIR
cd frontend
npm install
npm run build

cd ..
cd backend
npm install
npm run build
