FROM node:slim

MAINTAINER hfreire@exec.sh

# Create app directory
RUN mkdir -p /opt/pgo
WORKDIR /opt/pgo

# Install app dependencies
COPY package.json /opt/pgo
RUN npm install --production

# Bundle app source
COPY src/server /opt/pgo/src

CMD [ "npm", "run server" ]