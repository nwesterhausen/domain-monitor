#!/bin/bash
#
# Automatically docker build and tag for current version
# Then upload to GH Packages
#
# Requires jq and ~/.gh_token

# Github Username
USERNAME=nwesterhausen
# Get repo part of repository
IMAGE_PREFIX=$(jq .repository.url package.json | cut -d/ -f 5 | cut -d. -f 1)
# Name for this image
IMAGE=server
# Get version tag from package.json
TAG=$(jq .version package.json)

# Concat strings
VERSIONED_TAG="docker.pkg.github.com/$USERNAME/$IMAGE_PREFIX/$IMAGE:$TAG"
LATEST_TAG="docker.pkg.github.com/$USERNAME/$IMAGE_PREFIX/$IMAGE:latest"

# Build the docker image
docker build -t "$VERSIONED_TAG" .

# Also build a latest
docker build -t "$LATEST_TAG" .

# Login to gh packages docker repo
cat ~/.gh_token | docker login docker.pkg.github.com -u nwesterhausen --password-stdin

# Push the images
docker push "$VERSIONED_TAG"
docker push "$LATEST_TAG"
