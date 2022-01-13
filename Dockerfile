FROM node:latest

# Create the bot's directory
RUN mkdir -p /usr/src/komubot
WORKDIR /usr/src/komubot

COPY package.json /usr/src/komubot
RUN npm install

COPY . /usr/src/komubot

EXPOSE 3000

# Start the bot.
CMD ["node", "shader.js"]