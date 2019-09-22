#!/bin/bash
BUILD_DIR=/frontend-web/build
DIST_DIR=/frontend-web/dist
TEMP_LOC=/frontend-web/prev.public.toDelete

# this moves the output "build" directory of create-react-app to the "dist" directory served by nginx

if [ ! -d "$BUILD_DIR" ]; then
  echo "$BUILD_DIR does not exist"; exit 1
fi
if [ -d "$DIST_DIR" ]; then
  mv -f "$DIST_DIR" "$TEMP_LOC";
  echo "Moved previous public dir to $TEMP_LOC"
fi
mv "$BUILD_DIR" "$DIST_DIR"
echo "Moved create-react-app build dir to $DIST_DIR"