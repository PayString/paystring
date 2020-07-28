#!/usr/bin/env bash

# Bumps the NPM version.
#
# $1 - The current NPM version.
# $2 - The type of version bump (major, minor, patch).
function bump() {
   declare -r current_version=$1
   declare -r bump_increment=$2

   if [[ $bump_increment != "major" && \
         $bump_increment != "minor" && \
         $bump_increment != "patch"
   ]]; then
      error "Invalid bump increment. Please specify 'major', 'minor', or 'patch'."
   else
      declare ir versions_match=$(compare_versions current_version)

      # Bump only if Git & NPM versions are equal
      if [[ versions_match ]]; then
        declare -r new_version=$(npm --no-git-tag-version version $bump_increment)

        echo "NPM Version: "${new_version:1}
      else
        error "Version Mismatch:

        NPM Version: "$npm_version"
        Git Tag Version: "${git_tag_version:1}"
        "
      fi
   fi
}

# Compares the NPM version and Git tag version
# in the repo. 
#
# $1 - The NPM version string.
# 
# returns - A boolean indicating if the versions match.
function compare_versions {
   declare -r npm_version=$1
   declare -r git_tag_version=$(git describe --tags | cut -f 1 -d '-')

   # Drop the 'v' from the Git tag for the comparison.
   if [[ $npm_version != ${git_tag_version:1} ]]; then
     false
   else
     true
   fi
}

# Prints an error string to stderr, and exits the program with a 1 code.
#
# $1 - The error string to print.
function error {
	echo "ERROR - $1" 1>&2
	exit 1
}
