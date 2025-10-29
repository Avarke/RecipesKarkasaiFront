FROM node:alpine

#pull in node modules as a separate layer, this prevents reinstalling unless package.json changes
WORKDIR /app
COPY package.json .
RUN npm install

#copy over remaining code
WORKDIR /app
COPY . .

#
CMD ["npm", "run", "serve"]