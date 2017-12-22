FROM node:8-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY package.json server.js /usr/src/app/
COPY lib /usr/src/app/lib
COPY public /usr/src/app/public
RUN yarn

# run
EXPOSE 3000
CMD [ "yarn", "start" ]