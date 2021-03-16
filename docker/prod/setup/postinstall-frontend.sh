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

cd /root/openproject/commonmark-ckeditor-build
npm install
npm run build

echo "Preparing frontend"
cd /app/frontend
npm install --save @tinymce/tinymce-angular tinymce
npm install
npm run build

cd  ${APP_PATH}
RAILS_ENV="production" bundle config unset deployment
RAILS_ENV="production" bundle exec rake assets:clobber
RAILS_ENV="production" bundle exec rake openproject:plugins:register_frontend
RAILS_ENV="production" bundle exec rake assets:precompile
RAILS_ENV="production" bundle exec rake assets:environment
