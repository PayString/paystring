#!/bin/sh

# Parses a YAML file and prints the key value pairs.
# Adapted from: https://gist.github.com/pkuczynski/8665367
#
# $1 - The YAML file path string.
# $2 - The prefix string for the outputted keys.
parse_yaml() {
   declare -r prefix=$2
   declare -r s='[[:space:]]*'
   declare -r w='[a-zA-Z0-9_]*'
   declare -r fs=$(echo @|tr @ '\034')
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

error()
{
	echo "ERROR - $1" 1>&2
	exit 1
}

# Compares the Docker image version, NPM version, and Git tag version
# in the repo. Throws an error if any do not match.
#
# $1 - The NPM version string.
compare_versions() {
   eval $(parse_yaml docker-compose.yml "config_")
   declare -r docker_image_version=$(echo $config_services_payid_image | cut -f 2 -d ':')
   declare -r npm_version=$1
   declare -r git_tag_version=$(git describe --tags | cut -f 1 -d '-')

   if [[ $docker_image_version != $npm_version || \
         $docker_image_version != $git_tag_version || \
         $npm_version != $git_tag_version
   ]]; then
      error "Version Mismatch:

      Docker Image Version: "$docker_image_version"
      NPM Version: "$npm_version"
      Git Tag Version: "$git_tag_version"
      "
   else
      echo "Docker, NPM, Git Tag Version: "$npm_version
   fi
}

compare_versions $1
