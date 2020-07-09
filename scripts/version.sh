#!/bin/sh

# Bumps the NPM version, create a git tag.
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
      # Make sure versions are equal
      compare_versions $current_version

      # Bump NPM version and git tag
      declare -r new_version=$(npm version $bump_increment)
   fi
}

# Compares the NPM version, and Git tag version
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
