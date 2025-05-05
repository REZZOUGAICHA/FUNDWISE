FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Create log directory
RUN mkdir -p /app/logs

# Copy source files
COPY ./src ./src

# Set environment variables
ENV NODE_ENV=production
ENV RABBITMQ_HOST=rabbitmq
ENV RABBITMQ_PORT=5672
ENV RABBITMQ_USERNAME=guest
ENV RABBITMQ_PASSWORD=guest

# Run as non-root user for better security
USER node

# Command to run the application
CMD ["node", "src/index.js"]