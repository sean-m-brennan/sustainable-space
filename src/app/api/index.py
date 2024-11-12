import json
import logging
import traceback
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .spice_converter import transform_coordinates, fixed_to_j2000, celestial_position

logger = logging.getLogger(__name__)
app = FastAPI()

origins = ["*"]  # TODO use specific IPs here, preferably from config file

app.add_middleware(
    CORSMiddleware,  # noqa
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/check")
async def check_connection():
    return {}


@app.get("/convert/")
async def convert_coords(ident: str, coords: str, original: str, new: str, dt_str: str):
    try:
        if original.upper() not in ['ITRF93', 'J2000'] or new.upper() not in ['ITRF93', 'J2000']:
            return {'ident': ident, 'error': 'Unsupported conversion %s => %s' % (original, new)}
        position = json.loads(coords)
        dt = datetime.fromisoformat(dt_str)
        coords = transform_coordinates(position, original.upper(), new.upper(), dt)
        return {'ident': ident, 'coordinates': coords}
    except Exception as e:
        logger.error(traceback.format_exc())
        return {'ident': ident, 'error': str(e)}


@app.get("/fixed2j2k/")
async def fixed_to_j2k(ident: str, lat: float, lon: float, alt: float, dt_str: str):
    try:
        dt = datetime.fromisoformat(dt_str)
        coords = fixed_to_j2000(lat, lon, alt, dt)
        return {'ident': ident, 'coordinates': coords}
    except Exception as e:
        logger.error(traceback.format_exc())
        return {'ident': ident, 'error': str(e)}


@app.get("/position/")
async def body_position(ident: str, body: str, dt_str: str):
    try:
        dt = datetime.fromisoformat(dt_str)
        #if body.lower() == 'sun':
        #    coords = sun_position(dt)
        #else:
        coords = celestial_position(body, dt)
        return {'ident': ident, 'position': coords}
    except Exception as e:
        logger.error(traceback.format_exc())
        return {'ident': ident, 'error': str(e)}
