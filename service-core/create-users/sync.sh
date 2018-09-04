#!/usr/bin/env bash

RSYNC_OPTIONS="--recursive --times --human-readable --verbose"

rsync $RSYNC_OPTIONS -e ssh --rsync-path='sudo rsync' createUsers.js stcore-azure-nl-02.pryv.net:/var/pryv/pryv.li/users-create  --exclude ".DS_Store" --exclude ".*"
