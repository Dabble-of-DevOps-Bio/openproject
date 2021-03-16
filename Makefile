.PHONY: help Makefile

DEV="docker-compose.yml"

# Put it first so that "make" without argument is like "make help".
help:
	@echo "You must have ../commonmark-ckeditor-build"
	@echo "Run dev-up in order to start the dev server"

remove-f-lock:
	find ./ -name __ngcc_lock_file__ | xargs -I {} rm -rf {}

dev-ckeditor-clone:
	cd ..
	git clone https://github.com/Dabble-of-DevOps-Bio/commonmark-ckeditor-build.git

#https://docs.openproject.org/development/development-environment-docker/
dev-up:
	@echo "You should have the ../commonmark-ckeditor-build directory already available"
	@echo "If you don't please run make dev-ckeditor-clone"
	$(MAKE) remove-f-lock
	find ./ -name __ngcc_lock_file__ | xargs -I {} rm -rf {}
	bin/compose setup
	# or bin/compose run?
	bin/compose start
	@echo "The server should be up at : http://localhost:3000"
	@echo "Login with admin, admin"


#  frontend:
#    build:
#      <<: *frontend-build
#    command: "npm run serve"
#    volumes:
#      - ".:/home/dev/openproject"
#      - "../commonmark-ckeditor-build/build/:/home/dev/openproject/frontend/src/vendor/ckeditor/"
dev-ckeditor:
	$(MAKE) remove-f-lock
	docker-compose exec frontend bash -c "npm run build"
	docker-compose exec frontend bash -c "/home/dev/openproject/frontend/src/vendor/ckeditor/bin/copy.sh"

dev-logs:
	docker-compose logs -f

dev-stop:
	docker-compose stop

dev-clean:
	docker-compose stop; docker-compose rm -f
	$(MAKE) remove-f-lock

dev-clean-v:
	docker-compose stop; docker-compose rm -f -v
	$(MAKE) remove-f-lock
