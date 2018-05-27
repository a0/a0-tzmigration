#!/usr/bin/env bash

set -e
set -x
cd $(dirname $0)/..

yarn docs:build
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:aldrinmartoq/a0-tzmigration-web.git master:gh-pages
