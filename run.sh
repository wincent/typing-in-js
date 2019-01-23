#!/bin/bash
#
# Serves presentation assets at localhost:8888.

# http://stackoverflow.com/a/246128/2103996
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$DIR/content"

PORT=8888
echo "Launching server at http://localhost:$PORT"
python -m SimpleHTTPServer $PORT
