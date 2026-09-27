#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
node launch.mjs
