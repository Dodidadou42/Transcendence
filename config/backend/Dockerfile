ARG VERSION_BACK=${VERSION_BACK}
FROM python:3.9-alpine3.13 AS base
LABEL maintainer="42Team7"

RUN apk add --no-cache curl

ENV PYTHONUNBUFFERED 1
ARG DEV=false
ENV IS_DEV=${DEV}
ENV DB_HOST=${DB_HOST}
ENV DB_USER=${DB_USER}
ENV DB_NAME=${DB_NAME}
ENV DB_PASS=${DB_PASS}
ENV DB_SU_NAME=${DB_SU_NAME}
ENV DB_SU_EMAIL=${DB_SU_EMAIL}
ENV DB_SU_PASSWORD=${DB_SU_PASSWORD}
ENV JWT_SECRET=${JWT_SECRET}
ENV PORT_NGINX_HOST=${PORT_NGINX_HOST}
ENV HOST=${HOST}
ENV EMAIL_HOST_USER=${EMAIL_HOST_USER}
ENV EMAIL_HOST_PASSWORD=${EMAIL_HOST_PASSWORD}
ENV DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}

################################################################################
################################################################################
#							DEV BUILD
################################################################################
################################################################################
FROM base AS development

COPY ./config/backend/requirements.txt /tmp/requirements.txt
COPY ./config/backend/requirements.dev.txt /tmp/requirements.dev.txt
COPY ./config/backend/script.sh script.sh
COPY ./Backend /app

WORKDIR /app

RUN python -m venv /py && \
	/py/bin/pip install --upgrade pip && \
	apk add --update --no-cache postgresql-client && \
	apk add --update --no-cache --virtual .tmp-build-deps \
		build-base postgresql-dev musl-dev && \
	/py/bin/pip install -r /tmp/requirements.txt && \
	if [ $DEV = "true" ]; \
		then /py/bin/pip install -r /tmp/requirements.dev.txt ; \
	fi && \
	rm -rf /tmp && \
	apk del .tmp-build-deps && \
	adduser \
		--disabled-password \
		--no-create-home \
		myuser

RUN dos2unix ../script.sh

ENV PATH="/py/bin:$PATH"

ENTRYPOINT [ "sh", "../script.sh" ]

################################################################################
################################################################################
#							PROD BUILD
################################################################################
################################################################################
FROM base AS production

COPY ./config/backend/requirements.txt /tmp/requirements.txt
COPY ./config/backend/requirements.dev.txt /tmp/requirements.dev.txt
COPY ./config/backend/script.sh script.sh
COPY ./Backend /app

WORKDIR /app

RUN python -m venv /py && \
	/py/bin/pip install --upgrade pip && \
	apk add --update --no-cache postgresql-client && \
	apk add --update --no-cache --virtual .tmp-build-deps \
		build-base postgresql-dev musl-dev && \
	/py/bin/pip install -r /tmp/requirements.txt && \
	if [ $DEV = "true" ]; \
		then /py/bin/pip install -r /tmp/requirements.dev.txt ; \
	fi && \
	rm -rf /tmp && \
	apk del .tmp-build-deps && \
	adduser \
		--disabled-password \
		--no-create-home \
		myuser

RUN dos2unix ../script.sh

ENV PATH="/py/bin:$PATH"

ENTRYPOINT [ "sh", "../script.sh" ]