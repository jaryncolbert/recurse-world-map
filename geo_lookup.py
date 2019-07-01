#!/usr/bin/env python

'''
Perform geocoding of city, neighborhood, and country information.

It connects to the database specified in the environment variable DATABASE_URL,
opens a transaction, deletes the current data (if any), and inserts the new
data. The database schema must already exist.
'''

import time
import argparse
import json
import logging
import psycopg2
import sys
import geopy.geocoders
from geopy.geocoders import GeoNames
from geopy.exc import GeocoderTimedOut


def getEnvVar(var_name, fallback=""):
    value = os.getenv(var_name) or fallback
    if not value:
        logging.error(f"''{var_name}'' value not found.",
                      " Ensure a .env or .flaskenv file is present",
                      " with this environment variable set.")
        sys.exit()

    logging.info(var_name + ": " + value)
    return value


def delete_data(cursor):
    cursor.execute('DELETE FROM geolocations')


def replace_data(database_url):
    connection = psycopg2.connect(database_url)
    cursor = connection.cursor()

    delete_data(cursor)
    logging.info('Deleted existing tables')
    insert_data(cursor)
    logging.info('Completed database update')

    connection.commit()
    cursor.close()
    connection.close()


def insert_data(cursor):
    logging.info('Beginning database update')
    locations = get_locations_from_db(cursor)
    logging.info('Retrieved %s locations', len(locations))
    logging.info('Adding geolocation data... (this will take a few minutes)')

    for location in locations:
        lookup_and_insert_geodata(cursor, location)

    logging.info('Inserted %s locations', len(locations))


def lookup_and_insert_geodata(cursor, location):
    parsed = parse_location(location)
    result = geonames_query(parsed)
    geo = add_geonames_result(parsed, result)
    insert_geo_data(cursor, geo)

    return geo


def get_locations_from_db(cursor):
    logging.debug("Select: Retrieving all Locations")

    """Returns all stored locations from the database."""
    cursor.execute("""SELECT
                        location_id,
                        name
                      FROM locations
                      ORDER BY location_id""")
    return [{
        'location_id': x[0],
        'name': x[1],
    } for x in cursor.fetchall()]


geolocator = GeoNames(username=***REMOVED***)
geopy.geocoders.options.default_timeout = None


def geonames_query(location):
    time.sleep(2)  # Slow down requests to avoid timeout (< 1/sec)
    try_count = 0

    # Enhance query with all named parts of location, if present
    query = location["base_name"]
    if (location["state_name"]):
        query = query + " " + location["state_name"]
    if (location["type"] == "city"):
        query = query + " " + location["country_name"]

    try:
        return geolocator.geocode(query).raw
    except GeocoderTimedOut as e:
        if try_count > 10:      # max tries
            raise e

        try_count += 1
        time.sleep(2.5)
        return geolocator.geocode(query).raw


def get_state_name(state_code):
    usStates = {}
    with open('src/usStates.json') as json_file:
        usStates = json.load(json_file)

    return usStates[state_code]


def parse_location(location):
    location_id = location.get('location_id') if location.get(
        'location_id') else location.get('id')
    name = location.get('name')

    parts = name.split(", ")
    base_name = parts[0]
    loc_type = "country" if (len(parts) == 1) else "city"
    isUsCity = (loc_type == "city" and len(parts[1]) == 2)
    # US cities are formatted <city>, <ST> where <ST> is the two-letter state code
    state_name = get_state_name(parts[1]) if (isUsCity) else ""
    country = parts[0] if (loc_type == "country") else (
        "United States" if (isUsCity) else parts[1])
    return {
        'location_id': location_id,
        'full_name': name,
        'base_name': base_name,
        'type': loc_type,
        'state_name': state_name,
        'country_name': country
    }


def add_geonames_result(parsed_location, geonames_result):
    return {
        'location_id': parsed_location['location_id'],
        'name': parsed_location['full_name'],
        'type': parsed_location['type'],
        'subdivision_derived': parsed_location['state_name'],
        'subdivision_code': geonames_result['adminCode1'] if parsed_location['type'] == "city" else "",
        'country_name': parsed_location['country_name'],
        'country_code': geonames_result['countryCode'],
        'lat': geonames_result['lat'],
        'lng': geonames_result['lng'],
    }


def insert_geo_data(cursor, location):
    logging.info("Insert GeoLocation #{}: {} ({}), SubDiv: {} ({}), Country: {} ({}), ({},{})".format(
        location.get('location_id'),
        location.get('name'),
        location.get('type'),
        location.get('subdivision_derived'),
        location.get('subdivision_code'),
        location.get('country_name'),
        location.get('country_code'),
        location.get('lat'),
        location.get('lng'),
    ))
    cursor.execute("INSERT INTO geolocations" +
                   " (location_id, name, type," +
                   " subdivision_derived, subdivision_code," +
                   " country_name, country_code, lat, lng)" +
                   " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                   [location.get('location_id'),
                    location.get('name'),
                    location.get('type'),
                    location.get('subdivision_derived'),
                    location.get('subdivision_code'),
                    location.get('country_name'),
                    location.get('country_code'),
                    location.get('lat'),
                    location.get('lng'),
                    ]
                   )


if __name__ == "__main__":
    import os
    from dotenv import load_dotenv

    load_dotenv()
    logging.basicConfig(level=logging.INFO)
    database_url = getEnvVar('DATABASE_URL')

    logging.info('Starting World Map geolocation update...')
    replace_data(database_url)
    logging.info('Geolocation completed.')
