#!/bin/bash

set -e
set -o pipefail

export OPENPROJECT_CORE="/app"
export OPENPROJECT_ROOT="/app"

pushd "${APP_PATH}/frontend"

echo "Customizing some styles"
mkdir -p /root/openproject
cd /root/openproject

echo "Compiling CKEditor"
git clone https://github.com/Dabble-of-DevOps-Bio/commonmark-ckeditor-build.git

# Link the correct ckeditor!
cd /root/openproject/commonmark-ckeditor-build
npm install
npm run build
npm run dist

echo "Preparing frontend"
cd /app/frontend
npm install
npm run build

