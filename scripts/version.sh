#!/bin/bash

# Compares the Docker image version, NPM version, and Git tag version
# in the repo. Throws an error if any do not match.
#
# $1 - The NPM version string.
function compare_versions() {
   declare -r npm_version=$1
   declare -r git_tag_version=$(git describe --tags | cut -f 1 -d '-')

   # Drop the 'v' from the Git tag for the comparison.
   if [[ $npm_version != ${git_tag_version:1} ]]; then
      error "Version Mismatch:

      NPM Version: "$npm_version"
      Git Tag Version: "${git_tag_version:1}"
      "
   else
      echo "NPM, Git Tag Version: "$npm_version
   fi
}

# Prints an error string to stderr, and exits the program with a 1 code.
#
# $1 - The error string to print.
function error() {
	echo "ERROR - $1" 1>&2
	exit 1
}
