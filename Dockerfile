# Base image for building the application
FROM node:18 AS builder

# Set the working directory
WORKDIR /code

# Copy package.json and package-lock.json first to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the source code
COPY . .

# Transpile TypeScript and bundle with Webpack
RUN npx  tsc src/index.ts --outDir ./dist

# Final stage
FROM node:18 AS final

# Set the working directory
WORKDIR /code

# Copy the built application from the builder stage
COPY --from=builder /code/dist /code
COPY --from=builder /code/package*.json ./

# Install dependencies in the final image
RUN npm ci --omit=dev

# Use npm start to run the application
CMD ["node", "src/index.js"]
