import sys

import bpy

start = sys.argv.index('--') + 1
in_filepath = sys.argv[start]
out_filepath = sys.argv[start + 1]

bpy.ops.import_mesh.stl(filepath=in_filepath)
bpy.ops.export_scene.gltf(filepath=out_filepath, export_format='GLB')
