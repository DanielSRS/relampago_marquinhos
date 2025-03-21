#!/bin/sh

docker run --rm -v $(pwd):/app -w /app node:23 sh -c "corepack enable && yarn install"
