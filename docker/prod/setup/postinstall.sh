#!/bin/bash

set -e
set -o pipefail

export PGBIN="$(pg_config --bindir)"

display_error() {
	echo " !--> ERROR on postinstall:"
	tail -n 200 /tmp/dockerize.log
	exit 1
}

echo " ---> POSTINSTALL"

# Add MySQL-to-Postgres migration script to path (used in entrypoint.sh)
cp ./docker/prod/mysql-to-postgres/bin/migrate-mysql-to-postgres /usr/local/bin/

# Ensure we can write in /tmp/op_uploaded_files (cf. #29112)
mkdir -p /tmp/op_uploaded_files/ && chown -R $APP_USER:$APP_USER /tmp/op_uploaded_files/

rm -f ./config/database.yml

if test -f ./docker/prod/setup/postinstall-$PLATFORM.sh ; then
	echo " ---> Executing postinstall for $PLATFORM..."
	./docker/prod/setup/postinstall-$PLATFORM.sh
fi

#echo " ---> Precompiling assets with custom ckeditor. This will take a while..."
#./docker/prod/setup/postinstall-frontend.sh

echo " ---> Precompiling assets. This will take a while..."
./docker/prod/setup/postinstall-common.sh

echo "      OK."
