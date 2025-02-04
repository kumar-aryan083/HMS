# Use the official Node.js image as base
FROM node:20.12.1

ARG JWT_SECRET


ENV JWT_SECRET=${JWT_SECRET}
ENV WEBHOOK_URL=${WEBHOOK_URL}


# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Grant execute permissions to entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Define the entrypoint
ENTRYPOINT ["./entrypoint.sh"]

# Expose the port your app runs on
EXPOSE 3012

# Command to run your application
CMD ["npm", "start"]
