FROM node:18-bullseye

# Install build tools
RUN apt-get update && apt-get install -y build-essential

WORKDIR /app

# Copy package files first
COPY package*.json ./
RUN npm install

# Copy entire project
COPY . .

# Build Swiss Ephemeris using its Makefile
WORKDIR /app/Swisseph-src
RUN make

# Go back to app folder
WORKDIR /app

EXPOSE 3000

CMD ["node", "server.js"]