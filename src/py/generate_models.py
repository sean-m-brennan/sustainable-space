import argparse
import os
import subprocess

import numpy as np
import stl
from stl import mesh
from meshgrid2gltf import meshgrid_to_gltf

try:
    import surf2stl
except ImportError:
    import urllib.request
    url = 'https://raw.githubusercontent.com/asahidari/surf2stl-python/refs/heads/master/surf2stl.py'
    urllib.request.urlretrieve(url)
    import surf2stl

from roche_lagrangian import RocheLagrangian
from solar_constants import Planets, Satellites, Celestial



def _planet_to_mesh(planet: Celestial):
    rl = RocheLagrangian(planet.orbits.mass, planet.mass, planet.semimajor)
    scale = -1.5
    limit = .5
    radius = 1.725
    v_x, v_y, v_z = rl.cartesian_sampling(50, radius=radius, limit=limit, mesh=True)
    v_z = np.vectorize(lambda z: scale * (z if z < limit else limit) - .75)(v_z)
    return v_x, v_y, v_z


def to_gltf(planet: Celestial, directory: str = os.getcwd()):  # Broken: stack exhaustion
    target = os.path.join(directory, planet.name + '.glb')
    x, y, z = _planet_to_mesh(planet)

    gltf = meshgrid_to_gltf([(x, y, z), (x, y, -z)])
    gltf.save(target)
    return target


def to_stl(planet: Celestial, directory: str = os.getcwd()):
    target = os.path.join(directory, planet.name + '.stl')
    x, y, z = _planet_to_mesh(planet)

    surf2stl.write(target + '_1', x, y, z)
    surf2stl.write(target + '_2', x, y, -z)
    stl_files = [target + '_1', target + '_2']
    meshes = [mesh.Mesh.from_file(file) for file in stl_files]
    combined = mesh.Mesh(np.concatenate([m.data for m in meshes]))
    combined.save(target, mode=stl.Mode.BINARY)
    os.remove(target + '_1')
    os.remove(target + '_2')
    return target


def to_gltf_via_stl(planet: Celestial, directory: str = os.getcwd()):
    target = os.path.join(directory, planet.name + '.glb')
    intermediate = to_stl(planet, directory=directory)
    subprocess.run(['blender', '-b', '-P', 'stl2gltf.py', '--', intermediate, target],
                   env={'BLENDER_EXTERN_DRACO_LIBRARY_PATH': '/usr/lib/x86_64-linux-gnu/libdraco.so'})
    return target


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog=os.path.basename(__file__),
        description='Create GLTF or STL model of planetary Lagrangians and Roche potentials')
    parser.add_argument('-C', '--directory', type=str, default=os.getcwd(), help='Directory to save plot')
    parser.add_argument('--gltf', action='store_true', help='Create GLTF model (default)')
    parser.add_argument('--stl', action='store_true', help='Create STL model')
    args = parser.parse_args()

    func = to_gltf_via_stl
    if args.stl:
        func = to_stl
    elif args.gltf:
        func = to_gltf

    for s in Satellites:
        func(s, args.directory)
    #for p in Planets:
    #    func(p)
