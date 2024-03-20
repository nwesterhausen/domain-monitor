#!/bin/bash
#
# Automatically docker build and tag for current version
# Then upload to GH Packages
#
# Requires jq and ~/.gh_token and ~/.docker_token
# jq required for parsing package.json: version and repository.url

# Build if needed
pnpm i
pnpm build

# Github Username
USERNAME=nwesterhausen
# Get repo part of repository
IMAGE_PREFIX=$(jq .repository.url package.json | cut -d/ -f 5 | cut -d. -f 1)
# Name for this image
IMAGE=server
# Get version tag from package.json
TAG=$(jq .version package.json | cut -d\" -f 2)

# Set build tag depending if we are development or not
if [ `git branch --show-current` == "master" ]; then
    echo "Running on master, using 'latest' and version tag.";
    PRODRUN=true;
    BUILDTAG=latest;
else
    echo "Running on a development branch, using 'develop' tag only.";
    BUILDTAG=develop;
fi


# Concat strings
GH_TAGBASE="docker.pkg.github.com/$USERNAME/$IMAGE_PREFIX/$IMAGE"
DOCKER_TAGBASE="$USERNAME/$IMAGE_PREFIX"

# Build the docker image
podman build \
    -t "$DOCKER_TAGBASE:$BUILDTAG" \
    -t "$DOCKER_TAGBASE:$TAG" \
    -t "$GH_TAGBASE:$BUILDTAG" \
    -t "$GH_TAGBASE:$TAG" .

# Grab the image ID
IMAGE_ID=$(podman images -q "$DOCKER_TAGBASE")
echo $IMAGE_ID

# Login to gh packages docker repo
cat ~/.gh_token | podman login docker.pkg.github.com -u nwesterhausen --password-stdin

# Push the images
if ! [[ -z ${PRODRUN+x} ]]; then
    podman push "$GH_TAGBASE:$TAG";
fi
podman push "$GH_TAGBASE:$BUILDTAG"

# Login to docker.io
cat ~/.docker_token | podman login docker.io -u nwesterhausen --password-stdin

# Push the images
if ! [[ -z ${PRODRUN+x} ]]; then
    podman push "$DOCKER_TAGBASE:$TAG";
fi
podman push "$DOCKER_TAGBASE:$BUILDTAG"

# You could then go on to include other docker package repositories here,
# by tagging and pushing as appropriate.
