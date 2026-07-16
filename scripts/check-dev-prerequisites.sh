#!/bin/sh

set -eu

# Minimum versions for local development. The Maven build pins the exact
# Node/npm it downloads (see pom.xml); these are only the floors for `make dev`,
# which uses your system Node. Keep the majors aligned with pom.xml.
min_node="24.0.0"
min_npm="11.0.0"
webpack_port="8080"

fail() {
    printf 'Error: %s\n' "$1" >&2
    exit 1
}

# Succeed if $1 (the detected version) is >= $2 (the minimum). Compares
# dotted version numbers via `sort -V`; assumes a well-formed "X.Y.Z" $1
# (as produced by node/npm). An empty $1 is treated as too old.
version_ge() {
    if [ "$1" = "$2" ]; then
        return 0
    fi
    [ "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -n1)" = "$2" ]
}

if ! command -v node >/dev/null 2>&1; then
    fail "Node was not found. Node ${min_node} or newer is required; run 'node --version' after activating it."
fi

detected_node=$(node --version 2>/dev/null || true)
if ! version_ge "${detected_node#v}" "$min_node"; then
    fail "Node ${detected_node:-could not be detected} is active, but Node ${min_node} or newer is required. Activate a compatible version and verify it with 'node --version'."
fi

if ! command -v npm >/dev/null 2>&1; then
    fail "npm was not found. npm ${min_npm} or newer is required; run 'npm --version' after activating it."
fi

detected_npm=$(npm --version 2>/dev/null || true)
if ! version_ge "${detected_npm}" "$min_npm"; then
    fail "npm ${detected_npm:-could not be detected} is active, but npm ${min_npm} or newer is required. Activate a compatible version and verify it with 'npm --version'."
fi

if ! command -v mvn >/dev/null 2>&1; then
    fail "Maven was not found. Maven is required to install the UI artefact; verify it with 'mvn --version'."
fi

if command -v lsof >/dev/null 2>&1 && \
        lsof -nP -iTCP:"$webpack_port" -sTCP:LISTEN >/dev/null 2>&1; then
    fail "Port ${webpack_port} is already in use. Stop the process using it and verify the port with 'lsof -nP -iTCP:${webpack_port} -sTCP:LISTEN'."
fi
