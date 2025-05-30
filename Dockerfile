FROM node:24 AS build

WORKDIR /app

COPY . .

# Install dependencies
RUN npm install

# Run the vite build command from package json
RUN NODE_ENV=production npm run build

FROM ubuntu:22.04

WORKDIR /app

# copy the compiled files from the build image
COPY --from=build /app/dist /app