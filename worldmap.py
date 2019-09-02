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
from functools import wraps
import requests
from flask import Flask, jsonify, redirect, request, send_from_directory, session, url_for
from authlib.flask.client import OAuth
from werkzeug.exceptions import HTTPException
import psycopg2
from geocode_locations import get_env_var, lookup_geodata, insert_geo_data, insert_alias


# pylint: disable=invalid-name
app = Flask(__name__, static_url_path='/build')
app.secret_key = get_env_var('FLASK_SECRET_KEY', 'development')

logging.basicConfig(level=logging.INFO)

rc = OAuth(app).register(
    'Recurse Center',
    api_base_url='https://www.recurse.com/api/v1/',
    authorize_url='https://www.recurse.com/oauth/authorize',
    access_token_url='https://www.recurse.com/oauth/token',
    client_id=get_env_var('CLIENT_ID'),
    client_secret=get_env_var('CLIENT_SECRET'),
)

connection = psycopg2.connect(get_env_var('DATABASE_URL'))
token = get_env_var('RC_API_ACCESS_TOKEN')


@app.route('/')
def index():
    "Get the single-page app HTML"
    return send_from_directory('build', 'index.html')


@app.route('/favicon.ico')
def favicon():
    "Get the app favicon"
    return send_from_directory('build', 'favicon.ico')


@app.route('/manifest.json')
def manifest():
    "Get the app manifest"
    return send_from_directory('build', 'manifest.json')


@app.route('/static/<path:path>')
def static_file(path):
    "Get the single-page app assets"
    return send_from_directory('build/static', path)


@app.route('/auth/recurse')
def auth_recurse_redirect():
    "Redirect to the Recurse Center OAuth2 endpoint"
    callback = get_env_var('CLIENT_CALLBACK')
    return rc.authorize_redirect(callback)


@app.route('/auth/recurse/callback', methods=['GET', 'POST'])
def auth_recurse_callback():
    "Process the results of a successful OAuth2 authentication"

    try:
        token = rc.authorize_access_token()
    except HTTPException:
        logging.error(
            'Error %s parsing OAuth2 response: %s',
            request.args.get('error', '(no error code)'),
            request.args.get('error_description', '(no error description'),
        )
        return (jsonify({
            'message': 'Access Denied',
            'error': request.args.get('error', '(no error code)'),
            'error_description': request.args.get('error_description', '(no error description'),
        }), 403)

    me = rc.get('people/me', token=token).json()
    logging.info("Logged in: %s %s %s",
                 me.get('first_name', ''),
                 me.get('middle_name', ''),
                 me.get('last_name', ''))

    session['recurse_user_id'] = me['id']
    return redirect(url_for('index'))


def needs_authorization(route):
    """ Use the @needs_authorization annotation to check that a valid session
    exists for the current user."""
    @wraps(route)
    def wrapped_route(*args, **kwargs):
        """Check the session, or return access denied."""
        if app.debug:
            return route(*args, **kwargs)
        elif 'recurse_user_id' in session:
            return route(*args, **kwargs)
        else:
            return (jsonify({
                'message': 'Access Denied',
            }), 403)

    return wrapped_route


# @app.route('/api/locations/all')
@needs_authorization
def get_all_rc_locations():
    cursor = connection.cursor()

    """Returns all locations in the database
    with their geolocation data."""
    cursor.execute("""SELECT
                        location_id,
                        name,
                        lat,
                        lng
                      FROM geolocations
                      WHERE EXISTS(
                          SELECT location_id
                          FROM location_affiliations
                          WHERE location_id = geolocations.location_id
                        )
                      ORDER BY location_id""")
    locations = [{
        'location_id': x[0],
        'location_name': x[1],
        'lat': x[2],
        'lng': x[3],
        'has_rc_people': True
    } for x in cursor.fetchall()]
    cursor.close()

    return jsonify(locations)


@app.route('/api/locations/all')
@needs_authorization
def get_all_rc_locations_with_people():
    cursor = connection.cursor()

    # Query returns list of locations grouped in the format:
    # {
    #   location_id:
    #   location_name:
    #   lat:
    #   lng:
    #   person_list: [
    #     {
    #        person_id:
    #        first_name:
    #        last_name:
    #        stints: [
    #          {
    #            stint_type:
    #            rc_title:
    #            batch_name:
    #            start_date:
    #          }
    #        ]
    #     }
    #   ]
    # }

    """Returns all locations in the database
    with their geolocation data and all affiliated RC users."""
    cursor.execute("""SELECT
                        location_id,
                        location_name,
                        lat,
                        lng,
                        person_list
                      FROM geolocations_people_and_stints_agg""")

    locations = [{
        'location_id': x[0],
        'location_name': x[1],
        'lat': x[2],
        'lng': x[3],
        'has_rc_people': True,
        'person_list': x[4]
    } for x in cursor.fetchall()]
    cursor.close()

    return jsonify(locations)


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
    if r.status_code != requests.codes['ok']:
        r.raise_for_status()
    suggestions = r.json()
    return jsonify(suggestions)


@app.route('/api/locations/<int:id>')
@needs_authorization
def get_location(id):
    cursor = connection.cursor()

    # If location is aliased to another location, find preferred location
    preferred_id = get_alias(cursor, id)
    if (preferred_id):
        id = preferred_id

    # If geolocation data exists with people affiliated, return it
    location = get_geolocation_with_people(cursor, id)
    if (location):
        return jsonify(location)

    # Else lookup existing geolocation info, and then return it
    location = get_geolocation(cursor, id)
    if (location):
        return jsonify(location)

    # Otherwise, create and insert new location
    location_name = request.args.get('name')
    if (location_name == ""):
        return jsonify({})

    location = {
        "id": id,
        "location_id": id,
        "name": location_name,
        "short_name": request.args.get('short_name'),
        "type": request.args.get('type')
    }

    insert_location(cursor, location)
    connection.commit()

    # If there's an existing location in the db with the same lat/lng,
    # return its geolocation instead and create an alias
    geo = lookup_geodata(cursor, location)
    preferred_location = find_location_with_coords(cursor, geo)
    if (preferred_location):
        insert_alias(cursor, location, preferred_location)
        return get_location(preferred_location["location_id"])

    # Otherwise, insert new geolocation into database and return it
    insert_geo_data(cursor, geo)
    connection.commit()

    # Format geolocation data to only pull out relevant keys
    return jsonify({
        "location_id": geo["location_id"],
        "location_name": geo["name"],
        "lat": geo["lat"],
        "lng": geo["lng"],
        "has_rc_people": False
    })


# Returns the id of the preferred location if this location
# has an alias (e.g. "Manhattan, NY" -> "New York City, NY").
# If no alias exists, returns None.


def get_alias(cursor, location_id):
    logging.info("Select Alias for Location ID #{}".format(
        location_id
    ))
    """Returns the preferred location alias for the location 
        with the given id if an alias exists."""
    cursor.execute("""SELECT
                        preferred_location_id
                      FROM location_aliases
                      WHERE location_id = %s""", [location_id])

    alias_id = cursor.fetchone()

    return alias_id[0] if alias_id else None


def find_location_with_coords(cursor, location):
    """Searches database for a location with lat/lng values matching those of the given location."""
    cursor.execute("""SELECT
                        location_id,
                        name,
                        lat,
                        lng
                      FROM geolocations
                      WHERE lat = %s
                      AND lng = %s
                      AND NOT location_id = %s""",
                   [location["lat"], location["lng"], location["location_id"]])

    results = [{
        'location_id': x[0],
        'location_name': x[1]
    } for x in cursor.fetchall()]

    return require_one(results, location["location_id"])


def insert_location(cursor, location):
    logging.info("Insert Location #{}: {} ({})".format(
        location.get('id'),
        location.get('name'),
        location.get('short_name')
    ))
    cursor.execute("INSERT INTO locations" +
                   " (location_id, name, short_name)" +
                   " VALUES (%s, %s, %s) " +
                   " ON CONFLICT ON CONSTRAINT locations_pkey " +
                   " DO NOTHING ",
                   [location.get('id'),
                    location.get('name'),
                    location.get('short_name')
                    ]
                   )


def get_geolocation(cursor, location_id):
    logging.info("Select Location By ID #{}".format(
        location_id
    ))
    """Returns the requested geolocation data for a location with the given id."""
    cursor.execute("""SELECT
                        location_id,
                        name,
                        lat,
                        lng
                      FROM geolocations
                      WHERE location_id = %s""", [location_id])

    x = cursor.fetchone()

    return {
        'location_id': x[0],
        'location_name': x[1],
        'lat': x[2],
        'lng': x[3],
        'has_rc_people': False
    } if x else {}


def get_geolocation_with_people(cursor, location_id):
    logging.info("Select Location By ID #{}".format(
        location_id
    ))
    """Returns the requested geolocation data for a location with the given id."""
    cursor.execute("""SELECT
                        location_id,
                        location_name,
                        lat,
                        lng,
                        person_list
                      FROM geolocations_people_and_stints_agg
                      WHERE location_id = %s""", [location_id])
    locations = [{
        'location_id': x[0],
        'location_name': x[1],
        'lat': x[2],
        'lng': x[3],
        'has_rc_people': True,
        'person_list': x[4]
    } for x in cursor.fetchall()]

    return require_one(locations, location_id)


def require_one(location_arr, location_id):
    if (len(location_arr) == 0):
        return {}
    if (len(location_arr) == 1):
        return location_arr[0]

    # Otherwise, throw error - Result should be <= 1
    raise ValueError("Multiple locations returned for id " + location_id)
