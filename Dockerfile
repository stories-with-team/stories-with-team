FROM node:13.2.0-alpine3.10

USER node
WORKDIR /home/node

COPY --chown=node:node build.sh /home/node/build.sh
COPY --chown=node:node frontend /home/node/frontend
COPY --chown=node:node backend /home/node/backend

RUN /home/node/build.sh

WORKDIR /home/node/backend

CMD npm start
