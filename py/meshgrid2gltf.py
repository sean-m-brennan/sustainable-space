import resource
import sys

import numpy as np
import pygltflib

resource.setrlimit(resource.RLIMIT_STACK, (2**29,-1))
sys.setrecursionlimit(10**6)

def _normalize(vector):
    norm = 0
    for i in range(0, len(vector)):
        norm += vector[i] * vector [i]
    norm = np.sqrt(norm)
    for i in range(0, len(vector)):
        vector[i] = vector[i] / norm
    return vector

def _local_find_normal(p1, p2, p3):
    v1 = p2 - p1
    v2 = p3 - p1
    v3 = np.cross(v1, v2)
    n = v3 / np.sqrt(np.sum(v3*v3))
    return n


def meshgrid_to_gltf(meshes: list[tuple[np.ndarray, np.ndarray, np.ndarray]]):
    points = []
    normals = []

    for mesh in meshes:
        x, y, z = mesh
        if z.ndim != 2:
            raise Exception('Variable z must be a 2-dimensional array')

        if len(x.shape) == 1 and x.shape[0] == z.shape[1] \
                and len(y.shape) == 1 and y.shape[0] == z.shape[0]:
            x, y = np.meshgrid(x, y)

        if len(x.shape) != len(z.shape) \
                or len(y.shape) != len(z.shape) \
                or x.shape[1] != z.shape[1] \
                or y.shape[0] != z.shape[0]:
            raise Exception('Unable to resolve x and y variables')

        for i in range(z.shape[0]-1):
            for j in range(z.shape[1]-1):
                p1 = np.array([x[i,j], y[i,j], z[i,j]])
                points.append(p1)
                p2 = np.array([x[i,j+1], y[i,j+1], z[i,j+1]])
                points.append(p1)
                p3 = np.array([x[i+1,j+1], y[i+1,j+1], z[i+1,j+1]])
                points.append(p1)
                norm = _local_find_normal(p1, p2, p3)
                #norm = _normalize(norm)
                normals.append(norm)
                normals.append(norm)
                normals.append(norm)

    points = np.array(points, dtype="float32")
    normals = np.array(normals, dtype="float32")
    points_binary_blob = points.tobytes()
    normals_binary_blob = normals.tobytes()

    gltf = pygltflib.GLTF2(
        scene=0,
        scenes=[pygltflib.Scene(nodes=[0])],
        nodes=[pygltflib.Node(mesh=0)],
        meshes=[
            pygltflib.Mesh(
                primitives=[
                    pygltflib.Primitive(
                        attributes=pygltflib.Attributes(POSITION=0, NORMAL=1), indices=None
                    )
                ]
            )
        ],
        accessors=[
            pygltflib.Accessor(
                bufferView=0,
                componentType=pygltflib.FLOAT,
                count=len(points),
                type=pygltflib.VEC3,
                max=points.max(axis=0).tolist(),
                min=points.min(axis=0).tolist(),
            ),
            pygltflib.Accessor(
                bufferView=1,
                componentType=pygltflib.FLOAT,
                count=len(normals),
                type=pygltflib.VEC3,
                max=None,
                min=None,
            ),
        ],
        bufferViews=[
            pygltflib.BufferView(
                buffer=0,
                byteOffset=0,
                byteLength=len(points_binary_blob),
                target=pygltflib.ARRAY_BUFFER,
            ),
            pygltflib.BufferView(
                buffer=0,
                byteOffset=len(points_binary_blob),
                byteLength=len(normals_binary_blob),
                target=pygltflib.ARRAY_BUFFER,
            ),
        ],
        buffers=[
            pygltflib.Buffer(
                byteLength=len(points_binary_blob) + len(normals_binary_blob)
            )
        ],
    )
    gltf.set_binary_blob(points_binary_blob + normals_binary_blob)
    return gltf
