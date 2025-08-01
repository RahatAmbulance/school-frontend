# Use an official Node.js runtime as a base image
FROM node:16-alpine

RUN  mkdir /opt/school-frontend

# Set the working directory
WORKDIR /opt/school-frontend

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install -force

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Set environment variable for production
ENV NODE_ENV=production

# Expose the port that the app will run on
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]