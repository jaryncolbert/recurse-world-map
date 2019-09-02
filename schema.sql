CREATE TABLE IF NOT EXISTS batches (
  batch_id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  short_name TEXT NULL
);

CREATE TABLE IF NOT EXISTS people (
  person_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  location_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NULL
);

CREATE TABLE IF NOT EXISTS geolocations (
  location_id INTEGER REFERENCES locations (location_id) PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subdivision_derived TEXT NULL,
  subdivision_code TEXT NULL,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  lat TEXT NOT NULL,
  lng TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS location_affiliations (
  person_id INTEGER NOT NULL REFERENCES people (person_id),
  location_id INTEGER NOT NULL REFERENCES locations (location_id),
  start_date DATE NULL,
  end_date DATE NULL,
  affiliation_type TEXT NULL,
  PRIMARY KEY (person_id, affiliation_type)
);

CREATE TABLE IF NOT EXISTS stints (
  person_id INTEGER NOT NULL REFERENCES people (person_id),
  batch_id INTEGER NULL REFERENCES batches (batch_id),
  stint_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  title TEXT NULL,
  PRIMARY KEY (person_id, start_date)
);

CREATE TABLE IF NOT EXISTS location_aliases (
  location_id INTEGER NOT NULL REFERENCES locations (location_id) PRIMARY KEY,
  preferred_location_id INTEGER NOT NULL REFERENCES locations (location_id)
);

CREATE VIEW stints_for_people AS
SELECT
  stints.person_id,
  stints.stint_type,
  stints.title AS rc_title,
  stints.start_date,
  batches.short_name AS batch_name
FROM stints
LEFT JOIN batches
  ON stints.batch_id = batches.batch_id
ORDER BY stints.start_date;

CREATE VIEW stints_for_people_agg AS
SELECT
  person_id,
  json_agg(
    json_build_object(
        'stint_type', stint_type,
        'rc_title', rc_title,
        'batch_name', batch_name,
        'start_date', start_date
    )
    ORDER BY start_date
  ) AS stints
FROM stints_for_people
GROUP BY person_id;
           
CREATE VIEW geolocations_with_affiliated_people AS
SELECT
  l.location_id,
  l.name AS location_name,
  l.lat,
  l.lng,
  l.country_code,
  l.type,
  p.person_id,
  p.name AS person_name,
  p.image_url
FROM geolocations l
INNER JOIN location_affiliations a
  ON (a.location_id = l.location_id)
INNER JOIN people p
  ON a.person_id = p.person_id
ORDER BY l.location_id;

CREATE VIEW geolocations_people_and_stints_agg AS
SELECT
  g.location_id,
  g.location_name,
  g.type,
  g.lat,
  g.lng,
  COALESCE(p.city_count, 0) AS city_count,
  COALESCE(p.total_population, 0) AS total_population,
  json_agg(
      json_build_object(
          'person_id', g.person_id, 
          'name', person_name, 
          'image_url', image_url,
          'stints', stints
      )
      ORDER BY person_name
  ) AS person_list
FROM geolocations_with_affiliated_people AS g
INNER JOIN stints_for_people_agg AS s
  ON s.person_id = g.person_id
LEFT JOIN geolocations_popl_by_country_agg p 
  ON p.location_id = g.location_id
GROUP BY g.location_id, g.location_name, g.type, g.lat, g.lng,
  p.city_count, p.total_population
ORDER BY g.location_id;

CREATE VIEW geolocations_popl_by_country AS
SELECT DISTINCT
  a.location_id,
  a.name AS country_name,
  b.location_id AS sub_id, 
  b.type AS sub_type,
  b.location_name AS sub_name, 
  COUNT(b.person_id) AS population
FROM geolocations a
INNER JOIN geolocations_with_affiliated_people b
  ON a.country_code = b.country_code
WHERE a.type = 'country' 
GROUP BY a.location_id, a.name,
  b.location_id, b.type, b.location_name
ORDER BY a.location_id;

CREATE VIEW geolocations_popl_by_country_agg AS
SELECT 
  location_id,
  country_name,
  COUNT(sub_id) FILTER (WHERE sub_type = 'city') AS city_count,
  SUM(population::INTEGER) AS total_population
FROM geolocations_popl_by_country
GROUP BY location_id, country_name
ORDER BY location_id;