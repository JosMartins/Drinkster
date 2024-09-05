# Base image for Node.js
FROM node:18

# Set the working directory
WORKDIR /app

# Copy and install backend dependencies
COPY ./package*.json ./backend/
RUN cd backend && npm install

# Copy backend code
COPY . ./backend/

# Expose port
EXPOSE 3432

# Start the backend
CMD ["node", "/app/backend/app.js"]
