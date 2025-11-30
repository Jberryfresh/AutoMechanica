#!/usr/bin/env sh
# shellcheck shell=sh

# Minimal Husky shim for environments without package installation
if [ -z "$husky_skip_init" ]; then
  export husky_skip_init=1
fi
