"""
Recurse World Map back-end
"""

# Copyright (C) 2019 Jaryn Colbert <jaryn.colbert@gmail.com>

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

from itertools import groupby
import logging
import os
import requests
from flask import Flask, jsonify, redirect, request, send_from_directory, session, url_for
from authlib.flask.client import OAuth
from werkzeug.exceptions import HTTPException
import psycopg2
import sys
from dotenv import load_dotenv
from geo_lookup import lookup_and_insert_geodata

load_dotenv()


def getEnvVar(var_name, fallback=""):
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


def group_people_by_location(locations):
    grouped_locations = []

    # Use common location info as grouping key
    for location_key, group in groupby(locations, lambda loc: {
        "location_id": loc["location_id"],
        "location_name": loc["location_name"],
        "lat": loc["lat"],
        "lng": loc["lng"],
    }):
        # Join all person information into a list for each location
        person_list = [{
            "person_id": location["person_id"],
            "first_name": location["first_name"],
            "last_name": location["last_name"],
            "image_url": location["image_url"],
        } for location in group]

        sorted_list = sorted(person_list, key=lambda p: p["first_name"])
        location_key["person_list"] = sorted_list
        grouped_locations.append(location_key)

    return grouped_locations


@app.route('/api/locations/all')
def get_all_locations():
    cursor = connection.cursor()

    """Returns the entire set of geolocation data in the database."""
    cursor.execute("""SELECT
                        location_id,
                        location_name,
                        lat,
                        lng,
                        person_id,
                        first_name,
                        last_name,
                        image_url
                      FROM geolocations_with_affiliated_people
                      ORDER BY location_id""")
    locations = [{
        'location_id': x[0],
        'location_name': x[1],
        'lat': x[2],
        'lng': x[3],
        'person_id': x[4],
        'first_name': x[5],
        'last_name': x[6],
        'image_url': x[7]
    } for x in cursor.fetchall()]
    cursor.close()

    grouped = group_people_by_location(locations)
    return jsonify(grouped)


token = getEnvVar('RC_API_ACCESS_TOKEN')


@app.route('/api/locations/search')
def locations_search():
    suggestions = []
    q = request.args.get('query')

    if (q == ""):
        return jsonify(suggestions)

    headers = {'Authorization': f'Bearer {token}'}
    url = 'https://www.recurse.com/api/v1/locations?limit={limit}&query={query}'
    limit = 10

    r = requests.get(url.format(
        limit=limit, query=q), headers=headers)
    if r.status_code != requests.codes.ok:
        r.raise_for_status()
    suggestions = r.json()
    return jsonify(suggestions)


@app.route('/api/locations/<int:id>')
def get_location(id):

    cursor = connection.cursor()

    # If location exists with people affiliated, return it
    location = get_geolocation_with_people(cursor, id)
    if (location):
        return jsonify(location)

    # Else lookup geolocation info, and then return it
    location = get_geolocation(cursor, id)
    if (location):
        return jsonify(location)

    location_name = request.args.get('name')
    if (location_name == ""):
        return jsonify({})

    # Otherwise geolocate by name, insert it into DB, and then return it
    location = {
        "id": id,
        "name": location_name,
        "short_name": request.args.get('short_name'),
        "type": request.args.get('type')
    }

    # Insert location into 'locations' table
    insert_location(cursor, location)
    connection.commit()

    # Geocode location and insert into 'geolocations' table
    lookup_and_insert_geodata(cursor, location)
    connection.commit()

    # Get new geolocation data from DB
    location = get_geolocation(cursor, id)
    cursor.close()

    return jsonify(location)


def insert_location(cursor, location):
    logging.info("Insert Location #{}: {} ({})".format(
        location.get('id'),
        location.get('name'),
        location.get('short_name')
    ))
    cursor.execute("INSERT INTO locations" +
                   " (location_id, name, short_name)" +
                   " VALUES (%s, %s, %s)",
                   [location.get('id'),
                    location.get('name'),
                    location.get('short_name')
                    ]
                   )


def get_geolocation(cursor, location_id):

    logging.info("Select Location By ID #{}".format(
        location_id
    ))
    """Returns the requested geolocation data for a location with the given idea."""
    cursor.execute("""SELECT
                        location_id,
                        name,
                        lat,
                        lng
                      FROM geolocations
                      WHERE location_id = %s""", [location_id])
    locations = [{
        'location_id': x[0],
        'location_name': x[1],
        'lat': x[2],
        'lng': x[3]
    } for x in cursor.fetchall()]

    if (len(locations) == 0):
        return {}
    if (len(locations) == 1):
        locations[0]["person_list"] = []
        return locations[0]

    # Otherwise, throw error - Result should be <= 1
    raise ValueError("Multiple locations returned for id " + id)


def get_geolocation_with_people(cursor, location_id):

    logging.info("Select Location By ID #{}".format(
        location_id
    ))
    """Returns the requested geolocation data for a location with the given idea."""
    cursor.execute("""SELECT
                        location_id,
                        location_name,
                        lat,
                        lng,
                        person_id,
                        first_name,
                        last_name,
                        image_url
                      FROM geolocations_with_affiliated_people
                      WHERE location_id = %s
                      ORDER BY location_id""", [location_id])
    locations = [{
        'location_id': x[0],
        'location_name': x[1],
        'lat': x[2],
        'lng': x[3],
        'person_id': x[4],
        'first_name': x[5],
        'last_name': x[6],
        'image_url': x[7]
    } for x in cursor.fetchall()]

    grouped = group_people_by_location(locations)

    if (len(grouped) == 0):
        return {}
    if (len(grouped) == 1):
        return grouped[0]

    # Otherwise, throw error - Result should be <= 1
    raise ValueError("Multiple locations returned for id " + id)
