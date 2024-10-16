#!/bin/sh

image=icon.png

# Hand-made image for 16x16 instead
#convert $image -resize 16x16 -extent 16x16 -background black favicon-16x16.png
convert $image -resize 32x32 -extent 32x32 -background black favicon-32x32.png
convert $image -resize 48x48 -extent 48x48 -background black favicon-48x48.png
convert $image -resize 64x64 -extent 64x64 -background black favicon-64x64.png

convert $image -background black \
          favicon-16x16.png favicon-32x32.png favicon-48x48.png favicon-64x64.png \
          -delete 0 -alpha off -colors 256 favicon.ico

convert $image -resize 192x192 -extent 192x192 -background black android-icon-192x192.png
convert $image -resize 512x512 -extent 512x512 -background black android-icon-512x512.png
convert $image -resize 180x180 -extent 180x180 -background black apple-touch-icon.png
convert $image -resize 800x800 -extent 800x800 -background black share.png

