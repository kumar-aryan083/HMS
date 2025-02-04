# Stage 1: Build the React app
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the React app using http-server
FROM node:18

# Install serve globally
RUN npm install -g serve

# Set the working directory
WORKDIR /usr/share/app

# Copy the build files
COPY --from=build /app/dist .  

# Expose the port
EXPOSE 3015

# Serve the app
CMD ["serve", "-s", ".", "-l", "3015"]
