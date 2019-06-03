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

def getEnvVar(var_name, fallback = ""):
    value = os.getenv(var_name) or fallback
    if not value:
        logging.error(f"''{var_name}'' value not found.",
            " Ensure a .env or .flaskenv file is present",
            " with this environment variable set.")
        sys.exit()

    logging.info(var_name + ": " + value)
    return value

def delete_data(cursor):
    cursor.execute('DELETE FROM locations_geo')

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
    for location in get_locations_from_db(cursor):
        geo = get_geolocation(location)
        insert_geolocation(cursor, geo)

def get_locations_from_db(cursor):
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
def lookup_geonames(location_name):
    time.sleep(1.5) # Slow down requests to avoid timeout (< 1/sec)
    try_count = 0

    try:
        return geolocator.geocode(location_name).raw
    except GeocoderTimedOut as e:
        if try_count > 10:      # max tries
            raise e

        try_count += 1
        time.sleep(1.5)
        return geolocator.geocode(location_name).raw

def get_geolocation(location):
    location_id = location.get('location_id')
    name = location.get('name').strip()

    parts = name.split(", ")
    type = "country" if (len(parts) == 1) else "city"
    isUsCity = (type == "city" and len(parts[1]) == 2)
    # US cities are formatted <city>, <ST> where <ST> is the two-letter state code
    subdivision = parts[1] if (isUsCity) else ""
    country = parts[0] if (type == "country") else ("United States" if (isUsCity) else parts[1])

    geolocation = lookup_geonames(name)
    geo = {
        'location_id': location_id,
        'name': name,
        'type': type,
        'subdivision_derived': subdivision,
        'subdivision_code': geolocation['adminCode1'] if type == "city" else "",
        'country_name': country,
        'country_code': geolocation['countryCode'],
        'lat': geolocation['lat'],
        'lng': geolocation['lng'],
        }

    return geo

def insert_geolocation(cursor, location):
    logging.debug("GeoLocation #{}: {} ({}), SubDiv: {} ({}), Country: {} ({}), ({},{})".format(
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
    cursor.execute("INSERT INTO locations_geo" +
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
