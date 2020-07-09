#!/bin/sh

# Bumps the NPM version, create a git tag, & bump the Docker version.
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

      # Bump the Docker image version by finding and replacing the old
      # version for the new. Drop the 'v' from the Git tag.
      sed -i "" "s|payid:$current_version|payid:${new_version:1}|g" docker-compose.yml
   fi
}

# Compares the Docker image version, NPM version, and Git tag version
# in the repo. Throws an error if any do not match.
#
# $1 - The NPM version string.
function compare_versions() {
   eval $(parse_yaml docker-compose.yml "config_")
   declare -r npm_version=$1
   declare -r docker_image_version=$(echo $config_services_payid_server_image | cut -f 2 -d ':')
   declare -r git_tag_version=$(git describe --tags | cut -f 1 -d '-')

   # Drop the 'v' from the Git tag for the comparison.
   if [[ $docker_image_version != $npm_version || $npm_version != ${git_tag_version:1} ]]; then
      error "Version Mismatch:

      NPM Version: "$npm_version"
      Git Tag Version: "${git_tag_version:1}"
      Docker Image Version: "$docker_image_version"
      "
   else
      echo "Docker, NPM, Git Tag Version: "$npm_version
   fi
}

# Parses a YAML file and prints the key value pairs.
# Adapted from: https://gist.github.com/pkuczynski/8665367
#
# $1 - The YAML file path string.
# $2 - The prefix string for the outputted keys.
function parse_yaml() {
   # The second argument to the function is the prefix we use to access the fields
   declare -r prefix=$2

   # Regex to match against 0 or more whitespace chars
   declare -r s='[[:space:]]*'

   # Regex to match against 0 or more letters / numbers
   declare -r w='[a-zA-Z0-9_]*'

   # Regex to match against field separator
   declare -r fs=$(echo @|tr @ '\034')

   # Uses `sed` to insert field separators & awk to iterate through
   # yaml using field separators to print key value pairs as "key=value".
   #
   # When you call this through `eval`, the key value pairs get assigned
   # as variables in the environment.
   sed -ne "s|^\($s\)\($w\)$s:$s\"\(.*\)\"$s\$|\1$fs\2$fs\3|p" \
        -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p"  $1 |
   awk -F$fs '{
      indent = length($1)/2;
      vname[indent] = $2;
      for (i in vname) {if (i > indent) {delete vname[i]}}
      if (length($3) > 0) {
         vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
         printf("%s%s%s=\"%s\"\n", "'$prefix'",vn, $2, $3);
      }
   }'
}

# Prints an error string to stderr, and exits the program with a 1 code.
#
# $1 - The error string to print.
function error() {
	echo "ERROR - $1" 1>&2
	exit 1
}
