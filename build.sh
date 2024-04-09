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
# Get repo part of repository by turning this
# "https://github.com/nwesterhausen/domain-monitor" into this "domain-monitor"
IMAGE_PREFIX=$(jq .repository.url package.json | cut -d\/ -f5 | cut -d\" -f1)
# Name for this image
IMAGE=server
# Get version tag from package.json
TAG=$(jq .version package.json | cut -d\" -f 2)

# Set build tag depending if we are development or not
if [ `git branch --show-current` == "main" ]; then
    echo "Running on master, using 'latest' and version tag."
    PRODRUN=true
    BUILDTAG=latest
elif [ `git branch --show-current` == "go-rewrite" ]; then
    echo "Running on the go-rewrite development branch, using 'beta' tag only."
    BUILDTAG=beta
else
    echo "Running on a development branch, using 'develop' tag only."
    BUILDTAG=develop
fi


# Concat strings
IMAGE_BASE=$USERNAME/$IMAGE_PREFIX
GH_TAGBASE=ghcr.io/$IMAGE_BASE
DOCKER_TAGBASE=docker.io/$IMAGE_BASE

# Echo tags to console for reference
echo
echo "Building image with tags:"
echo "  $DOCKER_TAGBASE:$BUILDTAG"
echo "  $DOCKER_TAGBASE:$TAG"
echo "  $GH_TAGBASE:$BUILDTAG"
echo "  $GH_TAGBASE:$TAG"
echo "  $IMAGE_BASE:$BUILDTAG"
echo "  $IMAGE_BASE:$TAG"
echo

# Build the docker image
podman build \
    -t "$DOCKER_TAGBASE:$BUILDTAG" \
    -t "$DOCKER_TAGBASE:$TAG" \
    -t "$GH_TAGBASE:$BUILDTAG" \
    -t "$GH_TAGBASE:$TAG" \
    -t "$IMAGE_BASE:$BUILDTAG" \
    -t "$IMAGE_BASE:$TAG" \
    --annotation="org.opencontainers.image.title=Domain Monitor Server" \
    --annotation="org.opencontainers.image.documentation=https://github.com/nwesterhausen/domain-monitor" \
    --annotation="org.opencontainers.image.authors=Nicholas Westerhausen <nicholas@mail.nwest.one>" \
    --annotation="org.opencontainers.image.description=A simple domain monitoring tool, which tracts the expiration date of domains and sends notifications." \
    --annotation="org.opencontainers.image.source=https://github.com/nwesterhausen/domain-monitor" \
    --annotation="org.opencontainers.image.license=MIT" \
    .

# Grab the image ID
IMAGE_ID=$(podman images -q "$DOCKER_TAGBASE")
echo "Successfully build image: $IMAGE_ID"

# Login to gh packages docker repo
#echo "Logging into GitHub Packages Container Repo"
#cat ~/.gh_token | podman login ghcr.io -u nwesterhausen --password-stdin
#
## Push the images
#if ! [[ -z ${PRODRUN+x} ]]; then
#    podman push "$IMAGE:$TAG" "$GH_TAGBASE:$TAG";
#fi
#podman push "$IMAGE:$BUILDTAG" "$GH_TAGBASE:$BUILDTAG"

# Login to docker.io
echo "Logging into Docker.io"
cat ~/.docker_token | podman login docker.io -u nwesterhausen --password-stdin

# Push the images (docker doesn't like the docker.io prefix)
if ! [[ -z ${PRODRUN+x} ]]; then
    podman push "$IMAGE_BASE:$TAG";
fi
podman push "$IMAGE_BASE:$BUILDTAG"

# You could then go on to include other docker package repositories here,
# by tagging and pushing as appropriate.
