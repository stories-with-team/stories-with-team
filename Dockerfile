FROM node:13.2.0-alpine3.10

COPY build.sh .
COPY frontend frontend
COPY backend backend

RUN ./build.sh

WORKDIR backend

CMD npm start
