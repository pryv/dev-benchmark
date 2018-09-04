#!/usr/bin/env bash

####
####    do not EVER use the '--delete' option as the user data is in the synchronized directory scope
####

RSYNC_OPTIONS="--recursive --times --human-readable --verbose --perms"


echo "Syncing hooks machine"

echo "###############################"
echo "Syncing sthooks-obpm-azure-nl-01.pryv.net"
echo "###############################"
rsync $RSYNC_OPTIONS -e ssh --rsync-path='sudo rsync' hooks/ sthooks-obpm-azure-nl-01.pryv.net:/diskdata/pryv.io/hook/api/data/testHook  --exclude ".*"

