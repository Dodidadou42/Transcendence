ARG VERSION_FRONT=${VERSION_FRONT}

FROM node:${VERSION_FRONT} AS base

ARG PORT_FRONT=${PORT_FRONT}

RUN apk add curl

################################################################################
################################################################################
#							DEV BUILD
################################################################################
################################################################################
FROM base AS development

ENV NODE_ENV="development"

COPY ./Frontend /app

WORKDIR /app

CMD npm i && npm run dev


################################################################################
################################################################################
#							PROD BUILD
################################################################################
################################################################################
FROM base AS production

ENV NODE_ENV="production"

COPY ./Frontend /app

WORKDIR /app

CMD npm i && npm run start
