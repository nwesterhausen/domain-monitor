# syntax=docker/dockerfile:1

FROM docker.io/golang:1.22-alpine

WORKDIR /app

# Setup the data directory
RUN mkdir -p /app/data
VOLUME /app/data

# Install nodejs
RUN apk add --no-cache nodejs npm

# Copy go mod and sum files to the working directory
COPY go.mod go.sum ./
# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Install pnpm
RUN npm install -g pnpm
# Copy the pnpm-lock.yaml and package.json files to the working directory
COPY pnpm-lock.yaml package.json ./
# Install all the dependencies
RUN pnpm install

# Copy the asset files
COPY assets ./assets
# Copy the source from the current directory to the Working Directory inside the container
COPY . ./

# Build the Go app
RUN go build ./cmd/main.go
# Build the frontend dependencies
RUN pnpm build

# Expose the default port
EXPOSE 3124

# Command to run the executable
CMD ["./main","--data-dir","/app/data"]
