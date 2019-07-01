#!/usr/bin/env python

'''
Fetch and insert Recurse Center API data into database.

This script fetches the list of batches and the list of profiles from the
Recurse Center API using the personal access token specified in the environment
variable RC_API_ACCESS_TOKEN.

It connects to the database specified in the environment variable DATABASE_URL,
opens a transaction, deletes the current data (if any), and inserts the new
data. The database schema must already exist.
'''

import argparse
import json
import logging
import psycopg2
import requests
import sys


def getEnvVar(var_name, fallback=""):
    value = os.getenv(var_name) or fallback
    if not value:
        logging.error(f"''{var_name}'' value not found.",
                      " Ensure a .env or .flaskenv file is present",
                      " with this environment variable set.")
        sys.exit()

    logging.info(var_name + ": " + value)
    return value


def get_people(token):
    people = []

    headers = {'Authorization': f'Bearer {token}'}
    url = 'https://www.recurse.com/api/v1/profiles?limit={limit}&offset={offset}'
    limit = 50
    offset = 0

    while True:
        r = requests.get(url.format(
            limit=limit, offset=offset), headers=headers)
        if r.status_code != requests.codes.ok:
            r.raise_for_status()
        page = r.json()
        if page == []:
            break
        people.extend(page)
        offset += limit

    return people


def replace_data(database_url, people):
    connection = psycopg2.connect(database_url)
    cursor = connection.cursor()

    delete_data(cursor)
    logging.info('Deleted existing tables')
    insert_data(cursor, people)
    logging.info('Completed database update')

    connection.commit()
    cursor.close()
    connection.close()


def delete_data(cursor):
    cursor.execute('DELETE FROM geolocations')
    cursor.execute('DELETE FROM location_affiliations')
    cursor.execute('DELETE FROM locations')
    cursor.execute('DELETE FROM stints')
    cursor.execute('DELETE FROM people')
    cursor.execute('DELETE FROM batches')


def insert_data(cursor, people):
    processed_batches = set()
    processed_locations = set()

    for person in people:
        person_id = person.get('id')

        logging.debug("Person #{}: {} {} {}; {}".format(
            person_id,
            person.get('first_name'),
            person.get('middle_name'),
            person.get('last_name'),
            person.get('image')
        ))
        cursor.execute("INSERT INTO people" +
                       " (person_id, first_name, middle_name," +
                       "  last_name, image_url)" +
                       " VALUES (%s, %s, %s, %s, %s)",
                       [person_id,
                        person.get('first_name'),
                        person.get('middle_name'),
                        person.get('last_name'),
                        person.get('image_path')
                        ]
                       )

        location = person.get('current_location')
        if (location):
            location_id = location.get('id')

            if (location_id not in processed_locations):
                processed_locations.add(location_id)
                logging.debug("Location #{}: {} ({})".format(
                    location_id,
                    location.get('name'),
                    location.get('short_name')
                ))
                cursor.execute("INSERT INTO locations" +
                               " (location_id, name, short_name)" +
                               " VALUES (%s, %s, %s)",
                               [location_id,
                                location.get('name'),
                                location.get('short_name')
                                ]
                               )

            cursor.execute("INSERT INTO location_affiliations" +
                           " (person_id, location_id)" +
                           " VALUES (%s, %s)",
                           [person_id,
                            location_id
                            ]
                           )

        for stint in person['stints']:
            batch_id = None
            batch = stint.get('batch')

            if (batch):
                batch_id = batch.get('id')

                if (batch_id not in processed_batches):
                    logging.debug("  Batch {}, \"{}\" ({})".format(
                        batch_id,
                        batch.get('name'),
                        batch.get('short_name')
                    ))
                    cursor.execute("INSERT INTO batches " +
                                   " (batch_id, name, short_name)" +
                                   " VALUES (%s, %s, %s)",
                                   [batch_id,
                                    batch.get('name'),
                                    batch.get('short_name')
                                    ]
                                   )
                    processed_batches.add(batch_id)

            logging.debug("  Stint: {}, Batch: {}, {} - {}".format(
                stint.get('type'),
                batch_id,
                stint.get('start_date'),
                stint.get('end_date')
            ))
            cursor.execute("INSERT INTO stints" +
                           " (person_id, batch_id, stint_type," +
                           "  start_date, end_date, title)" +
                           " VALUES (%s, %s, %s, %s, %s, %s)",
                           [person_id,
                            batch_id,
                            stint.get('type'),
                            stint.get('start_date'),
                            stint.get('end_date'),
                            stint.get('title'),
                            ]
                           )

    logging.info('Inserted %s people', len(people))
    logging.info('Inserted %s batches', len(processed_batches))
    logging.info('Inserted %s locations', len(processed_locations))


def main(database_url, token):
    logging.info('Starting World Map database update...')
    people = get_people(token)
    logging.info('Found %s people', len(people))

    replace_data(database_url, people)


if __name__ == "__main__":
    import os
    from dotenv import load_dotenv

    load_dotenv()

    logging.basicConfig(level=logging.INFO)

    database_url = getEnvVar('DATABASE_URL')
    token = getEnvVar('RC_API_ACCESS_TOKEN')

    main(database_url, token)
