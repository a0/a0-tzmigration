#!/usr/bin/env bash

set -e
set -x
cd $(dirname $0)/..

yarn docs:build
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f https://github.com/a0/a0-tzmigration.git master:gh-pages
