OS := $(shell uname)

all: prod

ifeq ($(OS),Linux)
replace-env-host:
	@grep -v '^HOST=' .env > new-env
	@mv new-env .env
	@echo "HOST='$(shell hostname)'" >> .env
	@echo "Replace HOST on Linux system to permit connexion at school"
else
replace-env-host:
	@echo "Skipping replace-env-host on non-Linux system"
endif

prod: replace-env-host
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

build: replace-env-host
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

dev: replace-env-host
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

stop:
	@docker-compose -f docker-compose.yml down

VolumeNb := $(shell docker volume ls | grep transcendance_db-data | wc -l)

ifeq ($(VolumeNb),1)
clean: stop
	@docker volume rm transcendance_db-data
else
clean: stop
	@echo "No volume to remove"
endif

fclean: clean
	@docker system prune -a -f

re: fclean all
