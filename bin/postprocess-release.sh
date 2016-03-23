#!/usr/bin/env bash
set -euf -o pipefail
#
# This script postprocesses the maven release plugin's commits to allow making
# additional changes when releasing.
#
# Commands in bin/post-release are executed in the repository and make
# appropriate changes to files. Any changes made are merged into the release
# commit created by maven.
#
# Similarly commands in bin/post-release are executed to clean up changes made
# by pre-release. Any changes are merged into the "prepare for next development
# iteration" commit created by maven.
#

function get_release_property() {
    grep -F "$1" ./release.properties | sed -E 's/^[^=]*=(.*)$/\1/'
}

# Change to the repo dir
cd "${0%/*}/../"

# This script runs after maven's release:prepare goal in order to add some more
# info to the release which would be extreemly awkward to do in maven itself.

# Ensure there are no staged or unstaged changes
git diff --cached --exit-code &>/dev/null || { echo "fatal: You have staged changes in git"; exit 1; }
git diff --exit-code &>/dev/null || { echo "fatal: You have unstaged changes in git"; exit 2; }

export RELEASE_TAG="$(get_release_property 'scm.tag=')"
export RELEASE_VERSION="$(get_release_property 'project.rel.ulcambridge.foundations.viewer\:viewer-ui=')"
export DEV_VERSION="$(get_release_property 'project.dev.ulcambridge.foundations.viewer\:viewer-ui=')"

# Ensure the tag exists
git rev-parse "$RELEASE_TAG" -- &>/dev/null || { echo "fatal: No such tag: $RELEASE_TAG"; exit 3; }

# Remove the tag so we can re-create it after rewriting the commits
git tag -d "$RELEASE_TAG"

# Perform the pre-release actions
run-parts --verbose --exit-on-error "./bin/pre-release"

# Stage any changes from the pre-release actions
git add --all
# Create a fixup commit for the [maven-release-plugin] prepare release x.y.z commit
git commit --allow-empty --fixup HEAD~1


# Clean up with post-release actions
run-parts --verbose --exit-on-error "./bin/post-release"

git add --all
# Create a fixup commit for the [maven-release-plugin] prepare for next
# development iteration (which is now 1 from HEAD due to the previous fixup
# commit)
git commit --allow-empty --fixup HEAD~1

# Combine the fixup commits with the original maven commits
EDITOR=':' git rebase --interactive --autosquash HEAD~4

# Re-tag the release commit
git tag -a -m "[maven-release-plugin] copy for tag $RELEASE_TAG" "$RELEASE_TAG" HEAD~1
