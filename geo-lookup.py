#!/usr/bin/env python

'''
Perform geocoding of city, neighborhood, and country information.

It connects to the database specified in the environment variable DATABASE_URL,
opens a transaction, deletes the current data (if any), and inserts the new
data. The database schema must already exist.
'''

import argparse
import json
import logging
import psycopg2
import sys
from geopy.geocoders import Nominatim, GeoNames

def getEnvVar(var_name, fallback = ""):
    value = os.getenv(var_name) or fallback
    if not value:
        logging.error(f"''{var_name}'' value not found.",
            " Ensure a .env or .flaskenv file is present",
            " with this environment variable set.")
        sys.exit()

    logging.info(var_name + ": " + value)
    return value

def lookup_geonames(location_name):
    username = ***REMOVED***
    geolocator = GeoNames(username=username)
    geolocation = geolocator.geocode(location_name)
    print("GeoNames: ", geolocation.raw)

    return geolocation

def enhance_location(location):
    location_id = location.get('id')
    name = location.get('name').strip()

    parts = name.split(", ")
    type = "country" if (len(parts) == 1) else "city"
    isUsCity = (type == "city" and len(parts[1]) == 2)
    # US cities are formatted <city>, <ST> where <ST> is the two-letter state code
    subdivision = parts[1] if (isUsCity) else ""
    country = parts[0] if (type == "country") else ("United States" if (isUsCity) else parts[1])

    geolocation = lookup_geonames(name)

    enhanced = {
        'location_id': location_id,
        'name': name,
        'type': type,
        'subdivision_derived': subdivision,
        'subdivision_code': geolocation.adminCode1 if geolocation.adminCode1 != "00" else "",
        'country_name': country_name,
        'country_code': geolocation.countryCode,
        'lat': geolocation.lat,
        'long': geolocation.lng,
        }

    return enhanced

def update_location(cursor, location):
    logging.debug("Location #{}: {} ({}), {}".format(
        location_id,
        name,
        location.get('short_name'),
        type
    ))
    cursor.execute("INSERT INTO locations" +
                   " (location_id, name, short_name, type)" +
                   " VALUES (%s, %s, %s, %s)",
                   [location_id,
                    name,
                    location.get('short_name'),
                    type
                   ]
                  )

    if (type == "city"):
        cursor.execute("INSERT INTO cities" +
                       " (location_id, name, subdivision_name, country_name)" +
                       " VALUES (%s, %s, %s, %s)",
                       [location_id,
                        parts[0],
                        subdivision,
                        country
                       ]
                      )

        if (country not in country_names):
            country_names.add(country)
            cursor.execute("INSERT INTO countries" +
                           " (name)" +
                           " VALUES (%s)",
                           [ country ]
                          )
    else:
        country_names.add(name)
        cursor.execute("INSERT INTO countries" +
                       " (location_id, name)" +
                       " VALUES (%s, %s)",
                       [location_id,
                        name
                       ]
                      )

def get_location_from_db(cursor, location):
    """Returns the stint type, name, and duration for each stint in which the current
    user participated."""
    cursor.execute("""SELECT
                        stints.stint_type,
                        stints.start_date,
                        stints.end_date,
                        stints.title,
                        batches.short_name
                      FROM stints
                      LEFT JOIN batches
                        ON stints.batch_id = batches.batch_id
                      WHERE stints.person_id = %s
                      ORDER BY stints.start_date""",
                   [user])
    return [x for x in cursor.fetchall()]


def main(database_url, token):
    logging.info('Starting World Map geolocation service...')

    brooklyn = {
        'location_id': 21726,
        'name': 'Brooklyn, NY'
        }
    uk = {
        'location_id': 84,
        'name': 'United Kingdom'
        }
    print("Looking up ", brooklyn['name'])
    lookup_geonames(brooklyn['name'])
    print("Looking up ", uk['name'])
    lookup_geonames(uk['name'])

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv

    load_dotenv()

    logging.basicConfig(level=logging.INFO)

    database_url = getEnvVar('DATABASE_URL')
    token = getEnvVar('RC_API_ACCESS_TOKEN')

    main(database_url, token)
