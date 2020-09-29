FROM node:10-alpine as client

WORKDIR /usr/src/app
COPY client/package*.json ./
RUN npm install
COPY ./client .
RUN npm run build


FROM node:10-alpine

WORKDIR /usr/src/app

COPY --from=hyperledger/fabric-tools:2.2.0 /usr/local/bin ./bin
COPY --from=client /usr/src/app/dist ./client

COPY server/package*.json ./
RUN npm install
COPY ./server .

RUN npm run build

EXPOSE 4000

CMD npm start