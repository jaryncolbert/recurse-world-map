CREATE TABLE IF NOT EXISTS batches (
  batch_id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  short_name TEXT
);

CREATE TABLE IF NOT EXISTS people (
  person_id INTEGER PRIMARY KEY,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS locations (
  location_id INTEGER PRIMARY KEY,
  name TEXT,
  short_name TEXT
);

CREATE TABLE IF NOT EXISTS locations_geo (
  location_id INTEGER NULL REFERENCES locations (location_id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subdivision_derived TEXT,
  subdivision_code TEXT,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  lat TEXT NOT NULL,
  lng TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS location_affiliations (
  person_id INTEGER NOT NULL REFERENCES people (person_id),
  location_id INTEGER NULL REFERENCES locations (location_id),
  start_date DATE,
  end_date DATE,
  affiliation_type TEXT,
  PRIMARY KEY (person_id, location_id)
);

CREATE TABLE IF NOT EXISTS stints (
  person_id INTEGER NOT NULL REFERENCES people (person_id),
  batch_id INTEGER NULL REFERENCES batches (batch_id),
  stint_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  title TEXT,
  PRIMARY KEY (person_id, start_date)
);
