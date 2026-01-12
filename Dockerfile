# 1. Use an official Node.js 'environment' as the starting point
FROM node:18

# 2. Create a folder inside the container for our app
WORKDIR /usr/src/app

# 3. Copy our 'shopping list' (package.json) and install the tools
COPY package*.json ./
RUN npm install

# 4. Copy all our actual code (app.js, etc.) into the container
COPY . .

# 5. Open a 'window' (port) so we can talk to the app
EXPOSE 4000

# 6. The command to start the bank
CMD ["node", "app.js"]
