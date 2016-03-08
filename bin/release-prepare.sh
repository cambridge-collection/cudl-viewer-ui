#!/usr/bin/env bash
set -euf -o pipefail

#
# Use this script instead of mvn release:prepare
#

# Change to the repo dir
cd "${0%/*}/../"

mvn release:prepare
./bin/postprocess-release.sh
