# syntax=docker/dockerfile:1
# Use the official golang image to create a build artifact.
FROM docker.io/golang:1.22-alpine as builder
WORKDIR /src
RUN mkdir app

# Setup dependencies
RUN apk add --no-cache nodejs npm
# Install templ
RUN go install github.com/a-h/templ/cmd/templ@latest

# Copy source (see .dockerignore for exclusions)
COPY . .

# Install Frontend
RUN npx pnpm install --frozen-lockfile
# "Build" the frontend files
RUN npx pnpm build
# Compile the templ files
RUN templ compile
# Build the Go app
RUN go build -o /app/main ./cmd/main.go

# Copy the frontend files to the app
RUN cp -r assets /app/assets

# Use a smaller image to run the app
FROM docker.io/alpine:latest
COPY --from=builder /app/main /app/main
COPY --from=builder /app/assets /app/assets

LABEL maintainer="Nicholas Westerhausen <nicholas@mail.nwest.one>"
LABEL description="A simple domain monitoring tool, which tracts the expiration date of domains and sends notifications."

WORKDIR /app

# Setup the data directory
RUN mkdir /app/data
VOLUME /app/data

# Expose the default port
EXPOSE 3124

# Command to run the executable
CMD ["./main","--data-dir","/app/data"]
