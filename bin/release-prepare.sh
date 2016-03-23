#!/usr/bin/env bash
set -euf -o pipefail

#
# Use this script instead of mvn release:prepare
#

# Change to the repo dir
cd "${0%/*}/../"

if [ -f ./release.properties ]; then
    echo "fatal: Release already prepared (release.properties exists)"
    echo "tip: use:"
    echo "    \$ mvn release:clean"
    echo "to clean up after a release."
    exit 4
fi

mvn release:prepare
./bin/postprocess-release.sh
