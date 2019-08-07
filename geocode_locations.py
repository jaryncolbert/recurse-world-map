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
import os
import geocoder
from dotenv import load_dotenv


logging.basicConfig(level=logging.INFO)


def get_env_var(var_name, fallback=""):
    load_dotenv()

    value = os.getenv(var_name) or fallback
    if not value:
        logging.error(f"'{var_name}' value not found."
                      f" Ensure a .env or .flaskenv file is present"
                      f" with this environment variable set.")
        sys.exit()

    logging.info(var_name + ": " + value)
    return value


def delete_data(cursor):
    cursor.execute('DELETE FROM geolocations')
    cursor.execute('DELETE FROM location_aliases')
    logging.info('Deleted existing tables')


def replace_data(database_url):
    connection = psycopg2.connect(database_url)
    cursor = connection.cursor()

    delete_data(cursor)
    insert_data(cursor)
    reconcile_duplicates(cursor)

    connection.commit()
    cursor.close()
    connection.close()
    logging.info('Completed database update')


def insert_data(cursor):
    logging.info('Beginning database update')
    locations = get_locations_from_db(cursor)
    logging.info('Retrieved %s locations', len(locations))
    logging.info('Adding geolocation data... (this will take a few minutes)')

    for location in locations:
        geo = lookup_geodata(cursor, location)
        insert_geo_data(cursor, geo)

    logging.info('Inserted %s locations', len(locations))


def lookup_geodata(cursor, location):
    parsed = parse_location(location)
    result = geonames_query(parsed)
    geo = add_geonames_result(parsed, result)
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


geonames_username = get_env_var('GEONAMES_USERNAME')

def geonames_query(location):
    time.sleep(2.5)  # Slow down requests to avoid timeout (< 1/sec)

    # Enhance query with all named parts of location, if present
    query = location["base_name"]
    if (location["state_name"]):
        query = query + " " + location["state_name"]
    if (location["type"] == "city"):
        query = query + " " + location["country_name"]

    # Limit results to city and country feature types
    feature_classes = ['A', 'P']

    return geocoder.geonames(query, key=geonames_username, featureClass=feature_classes, maxRows=1).json["raw"]

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
    logging.debug("Combining geo results. Parsed: {}\n GeoNames: {}".format(
            parsed_location,
            geonames_result
        ))

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


def insert_alias(cursor, location, preferred_location):
    logging.info("Insert Alias #{} {} for Location #{} {}".format(
        location.get('location_id'),
        location.get('name'),
        preferred_location.get('location_id'),
        preferred_location.get('name')
    ))

    cursor.execute("INSERT INTO location_aliases" +
                   " (location_id, preferred_location_id)" +
                   " VALUES (%s, %s)",
                   [location.get('location_id'),
                    preferred_location.get('location_id')])


def reconcile_duplicates(cursor):
    logging.info('Beginning reconciliation of duplicate locations')

    # Find locations where lat/lng count is greater than one
    # Get counts for populations of RCers at each location
    for counts in get_location_counts(cursor):

        # Find the location with the greatest number of RCers
        preferred_index = None
        max_count = 0

        for i, loc in enumerate(counts):
            pop = loc["population"]  # pop can be null

            if (pop and pop > max_count):
                max_count = pop
                preferred_index = i

        dupe_locs = counts
        preferred_loc = dupe_locs.pop(preferred_index)

        for loc in dupe_locs:
            # Add aliases for duplicate locations to point to preferred
            insert_alias(cursor, loc, preferred_loc)

            # Update all people pointing to old location with new in location_affiliations
            update_location_affiliations(cursor, loc, preferred_loc)

            # Delete duplicate from geolocations
            delete_geolocation(cursor, loc)

    logging.info('Duplicate locations removed')


def get_location_counts(cursor):
    """Returns then lat/lng values of duplicate locations with their population counts."""
    cursor.execute("""SELECT
                        json_agg(
                            json_build_object(
                                'location_id', g.location_id, 
                                'name', g.name, 
                                'population', population
                            )
                        ) as counts
                      FROM geolocations g
                      LEFT JOIN (
                          SELECT 
                            location_id, 
                            count(person_id) as population
                          FROM location_affiliations
                          GROUP BY location_id
                        ) as p
                      ON g.location_id = p.location_id
                      GROUP BY lat, lng HAVING count(*) > 1""")

    return [x[0] for x in cursor.fetchall()]


def update_location_affiliations(cursor, old_location, new_location):
    logging.info("Update Affiliations From #{} {} to New Location #{} {}".format(
        old_location.get('location_id'),
        old_location.get('name'),
        new_location.get('location_id'),
        new_location.get('name')
    ))

    """Updates all rows with the given old_location id to the new_location id in the locations_affiliations table."""
    cursor.execute("""UPDATE location_affiliations
                      SET location_id = %s
                      WHERE location_id = %s""",
                   [new_location["location_id"], old_location["location_id"]])


def delete_geolocation(cursor, location):
    logging.info("Delete Geolocation for #{} {}".format(
        location.get('location_id'),
        location.get('name')
    ))

    """Removes the row with the given location_id from the geolocation table."""
    cursor.execute("""DELETE 
                      FROM geolocations
                      WHERE location_id = %s""", [location["location_id"]])


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    database_url = get_env_var('DATABASE_URL')

    logging.info('Starting World Map geolocation update...')
    replace_data(database_url)
    logging.info('Geolocation completed.')
