FROM node

COPY . /code

WORKDIR /code

RUN npm i

RUN npm i -g ts-node nodemon