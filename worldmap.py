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
from geocode_locations import get_env_var, insert_geo_data


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


def group_people_by_location(locations):
    grouped_locations = []

    # Use common location info as grouping key
    for location_key, group in groupby(locations, lambda loc: {
        "location_id": loc["location_id"],
        "location_name": loc["location_name"],
        "lat": loc["lat"],
        "lng": loc["lng"],
        "has_rc_people": loc["has_rc_people"]
    }):
        # Join all person information into a list for each location
        person_list = [{
            "person_id": location["person_id"],
            "first_name": location["first_name"],
            "last_name": location["last_name"],
            "image_url": location["image_url"],
            "stint_type": location["stint_type"],
            "rc_title": location["rc_title"],
            "batch_name": location["batch_name"]
        } for location in group]
        print("Person ", location_key, " for ", person_list)

        person_list_with_stints = group_stints_by_person(person_list)
        location_key["person_list"] = person_list_with_stints
        grouped_locations.append(location_key)

    return grouped_locations


def group_stints_by_person(person_list):
    grouped_stints = []

    # Use common stint info as grouping key
    for stint_key, group in groupby(person_list, lambda s: {
        "person_id": s["person_id"],
        "first_name": s["first_name"],
        "last_name": s["last_name"],
        "image_url": s["image_url"]
    }):
        # Join all stint information into a list for each person
        stint_list = [{
            "stint_type": stint["stint_type"],
            "rc_title": stint["rc_title"],
            "batch_name": stint["batch_name"]
        } for stint in group]

        print("Stint ", stint_key, " for ", stint_list)

        stint_key["stints"] = stint_list
        grouped_stints.append(stint_key)

    return grouped_stints


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

    """Returns all locations in the database
    with their geolocation data and all affiliated RC users."""
    cursor.execute("""SELECT
                        g.location_id,
                        g.location_name,
                        g.lat,
                        g.lng,
                        g.person_id,
                        g.first_name,
                        g.last_name,
                        g.image_url,
                        s.stint_type,
                        s.title,
                        s.short_name,
                        s.start_date
                      FROM geolocations_with_affiliated_people as g
                      INNER JOIN stints_for_people as s
                        ON s.person_id = g.person_id
                      ORDER BY location_id, first_name, person_id, start_date""")
    locations = [{
        'location_id': x[0],
        'location_name': x[1],
        'lat': x[2],
        'lng': x[3],
        'has_rc_people': True,
        'person_id': x[4],
        'first_name': x[5],
        'last_name': x[6],
        'image_url': x[7],
        'stint_type': x[8],
        'rc_title': x[9],
        'batch_name': x[10]
    } for x in cursor.fetchall()]
    cursor.close()

    grouped = group_people_by_location(locations)
    return jsonify(grouped)


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
    """Returns the requested geolocation data for a location with the given id."""
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
        'lng': x[3],
        'has_rc_people': False
    } for x in cursor.fetchall()]

    if (len(locations) == 0):
        return {}
    if (len(locations) == 1):
        return locations[0]

    # Otherwise, throw error - Result should be <= 1
    raise ValueError("Multiple locations returned for id " + id)


def get_geolocation_with_people(cursor, location_id):
    logging.info("Select Location By ID #{}".format(
        location_id
    ))
    """Returns the requested geolocation data for a location with the given id."""
    cursor.execute("""SELECT
                        g.location_id,
                        g.location_name,
                        g.lat,
                        g.lng,
                        g.person_id,
                        g.first_name,
                        g.last_name,
                        g.image_url,
                        s.stint_type,
                        s.title,
                        s.short_name,
                        s.start_date
                      FROM geolocations_with_affiliated_people as g
                      INNER JOIN stints_for_people as s
                      ON s.person_id = g.person_id
                      WHERE location_id = %s
                      ORDER BY location_id, first_name, person_id, start_date""", [location_id])
    locations = [{
        'location_id': x[0],
        'location_name': x[1],
        'lat': x[2],
        'lng': x[3],
        'has_rc_people': True,
        'person_id': x[4],
        'first_name': x[5],
        'last_name': x[6],
        'image_url': x[7],
        'stint_type': x[8],
        'rc_title': x[9],
        'batch_name': x[10]
    } for x in cursor.fetchall()]

    grouped = group_people_by_location(locations)

    if (len(grouped) == 0):
        return {}
    if (len(grouped) == 1):
        return grouped[0]

    # Otherwise, throw error - Result should be <= 1
    raise ValueError("Multiple locations returned for id " + id)
