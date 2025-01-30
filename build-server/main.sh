#!/bin/bash

export GIT_REPOSITORY_URL = "$GIT_REPOSITORY_URL"

git clone "$GIT_REPOSITORY_URL" /homr/app/output

exec node script.js