import json
from datetime import datetime

from fastapi import FastAPI

from .spice_converter import transform_coordinates, fixed_to_j2000, celestial_position

app = FastAPI()


@app.get("/convert/")
async def convert_coords(ident: int, coords: str, original: str, new: str, dt_str: str):
    try:
        if original.upper() not in ['ITRF93', 'J2000'] or new.upper() not in ['ITRF93', 'J2000']:
            return {'id': ident, 'error': 'Unsupported conversion %s => %s' % (original, new)}
        position = json.loads(coords)
        dt = datetime.fromisoformat(dt_str)
        coords = transform_coordinates(position, original.upper(), new.upper(), dt)
        return {'id': ident, 'coordinates': coords}
    except Exception as e:
        return {'id': ident, 'error': str(e)}


@app.get("/fixed2j2k/")
async def fixed_to_j2k(ident: int, lat: float, lon: float, alt: float, dt_str: str):
    try:
        dt = datetime.fromisoformat(dt_str)
        coords = fixed_to_j2000(lat, lon, alt, dt)
        return {'id': ident, 'coordinates': coords}
    except Exception as e:
        return {'id': ident, 'error': str(e)}


@app.get("/position/")
async def body_position(ident: int, body: str, dt_str: str):
    try:
        dt = datetime.fromisoformat(dt_str)
        #if body.lower() == 'sun':
        #    coords = sun_position(dt)
        #else:
        coords = celestial_position(body, dt)
        return {'id': ident, 'position': coords}
    except Exception as e:
        return {'id': ident, 'error': str(e)}
