"""
Recurse Faces back-end
"""

# Copyright (C) 2017 Jason Owen <jason.a.owen@gmail.com>

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from functools import wraps
import logging
import os
from flask import Flask, jsonify, redirect, request, send_from_directory, session, url_for
from authlib.flask.client import OAuth
from werkzeug.exceptions import HTTPException
import psycopg2
import sys
from dotenv import load_dotenv

load_dotenv()

def getEnvVar(var_name, fallback = ""):
    value = os.getenv(var_name) or fallback
    if not value:
        logging.error(f"''{var_name}'' value not found.",
            " Ensure a .env or .flaskenv file is present",
            " with this environment variable set.")
        sys.exit()

    logging.info(var_name + ": " + value)
    return value

# pylint: disable=invalid-name
app = Flask(__name__, static_url_path='/build')
app.secret_key = getEnvVar('FLASK_SECRET_KEY', 'development')

logging.basicConfig(level=logging.INFO)

connection = psycopg2.connect(getEnvVar('DATABASE_URL'))

@app.route('/')
def index():
    "Get the single-page app HTML"
    return send_from_directory('build', 'index.html')

@app.route('/static/<path:path>')
def static_file(path):
    "Get the single-page app assets"
    return send_from_directory('build/static', path)

@app.route('/api/locations/all')
def get_all_location_data():
    cursor = connection.cursor()

    """Returns the entire set of geolocation data in the database."""
    cursor.execute("""SELECT
                        location_id,
                        name,
                        lat,
                        lng
                      FROM geolocations
                      ORDER BY location_id""")
    locations = [{
        'location_id': x[0],
        'name': x[1],
        'lat': x[2],
        'lng': x[3],
    } for x in cursor.fetchall()]
    cursor.close()

    return jsonify(locations)
