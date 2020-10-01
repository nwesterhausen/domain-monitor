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
TAG=$(jq .version package.json | cut -d\" -f 2)

# Concat strings
GH_TAGBASE="docker.pkg.github.com/$USERNAME/$IMAGE_PREFIX/$IMAGE"

# Build the docker image
docker build -t "$USERNAME/$IMAGE_PREFIX" .

# Grab the image ID
IMAGE_ID=$(docker images -q "$USERNAME/$IMAGE_PREFIX")
echo $IMAGE_ID

# Tag the image
docker tag $IMAGE_ID "$GH_TAGBASE:$TAG"
docker tag $IMAGE_ID "$GH_TAGBASE:latest"

# Login to gh packages docker repo
cat ~/.gh_token | docker login docker.pkg.github.com -u nwesterhausen --password-stdin

# Push the images
docker push "$GH_TAGBASE:$TAG"
docker push "$GH_TAGBASE:latest"

# You could then go on to include other docker package repositories here,
# by tagging and pushing as appropriate.
