# World of Recurse Map

Visualize the locations of members
of the [Recurse Center](https://recurse.com) community
on an interactive map.

## Using the Map

The app starts by displaying a map of the world
with markers for each city or country
where a Recurser is located.

<img src="./screenshots/world_map.png?raw=true" alt="RC World Map" width="500"/>

Green markers are generally single cities,
and the number inside the marker indicates
the number of Recursers in that location.
Clicking on a green marker will produce a popup
that displays the location name
and names of all Recursers at that location.
Each name is a link to that person's entry
in the [RC Directory](https://www.recurse.com/directory).

Grey markers are clusters of locations
that are spaced closely together,
and zooming into the map will automatically expand
the grey clusters into green markers.

The search bar at the top allows searching
for locations by name
with autosuggest provided by the RC API's locations endpoint.

<img src="./screenshots/london_autosuggest.png?raw=true" alt="RC World Map" width="500"/>

Once a location is selected
from the search bar,
the map will pan and zoom to that location
and display the popup with information
about Recursers in that location.

<img src="./screenshots/london_results.png?raw=true" alt="RC World Map" width="500"/>

## Stack

Initially, this code was ported over  
from Jason Owens' [Recurse Faces app](https://github.com/jasonaowen/recurse-faces)! 
Like Faces, its main stack is also mainly Postgresql, Flask, and React.

This app reads Recursers' locations
from their profiles in the
[Recurse Center API](https://github.com/recursecenter/wiki/wiki/Recurse-Center-API)
(_login required_),
and then uses the [Geopy](https://github.com/geopy/geopy) Python library
with the [GeoNames](https://geonames.org) geocoder
to find the latitude and longitude
for each location name.
Once those locations are retrieved,
the points are displayed on a [Leaflet](https://leafletjs.com/) map
using [OpenStreetMap](https://www.openstreetmap.org/#map=19/40.65010/-73.94958) tiles.

## Local Set Up

The app is comprised of a Flask back-end and a React front-end.
The instructions below detail 
how to set up and start both parts of the app.

### Start the Back End with the RC API

The Python server is a Flask app
that serves the index page and the JavaScript,
geocodes and stores the locations,
proxies the requests for location names
in the autocomplete search bar,
and looks up locations and associated users
in the database.

Running the API locally requires populating the database
and setting up the Python environment.

#### Python Virtual Environment

You'll first need to install the Python dependencies.
First, set up a [virtual environment](https://docs.python.org/3/tutorial/venv.html):

```sh
$ python3 -m venv venv
```

or

```sh
$ python3 -m virtualenv --python=python3 venv
```

Then, activate the virtual environment
and install the app's dependencies into it:

```sh
$ . venv/bin/activate
(venv)$ pip install -r requirements.txt
```

To populate the database or start the Flask app,
the scripts must be run in this virtual environment (venv).
The virtual environment can be reactivated at any time with the command:

```sh
$ . venv/bin/activate
```

#### Create a .env File

The Flask app needs some configuration,
which it takes through environment variables.
For convenience, this project uses a `.env` file
to store these variables.

First, copy the `env.template` file to a new file named `.env`:

```sh
$ cp env.template .env
```

The next few sections will describe
how to set and add to this initial set of variables.

**Note**: The `.env` file should not be placed under version control
and is included in the `.gitignore` file.

#### Populate the Database

We use [PostgreSQL](https://www.postgresql.org/) as our database.
Follow the [installation instructions](https://www.postgresql.org/download/)
for your platform to set up the database server.

First, choose or [create](https://www.postgresql.org/docs/current/tutorial-createdb.html)
a database:

```sh
$ createdb --owner=$(whoami) worldmap
```

Depending on your platform,
you may need to run that command
as the operating system user which owns the database server:

```sh
$ sudo -u postgres createdb --owner=$(whoami) worldmap
```

Then, create the schema:

```sh
$ psql worldmap < schema.sql
```

Add your database connection URL to the `.env` file:
`DATABASE_URL=postgres:///worldmap/`

**Note**: the `DATABASE_URL` can be any
[libpq connection string](https://www.postgresql.org/docs/current/static/libpq-connect.html#LIBPQ-CONNSTRING).
An alternate database URL you might try is
`postgres://localhost/worldmap`
to connect over TCP/IP to the database named `worldmap`.

There is a script
to get the data the application needs
from the Recurse Center API
and store it in the database.
To connect to the RC API,
the script needs a personal access token,
which you can create in the
[Apps page in your RC Settings](https://www.recurse.com/settings/apps).
The personal access token will only be shown once,
so copy it to a safe place
and add it to the `.env` file:
`RC_API_ACCESS_TOKEN=<personal_access_token>`

Run the script to populate the database
in your [Python Virtual Environment](#python-virtual-environment):

```sh
(venv)$ ./update_data.py
```

It should print out how many people and locations were added.

Next, another script geocodes the locations retrieved
from the `update_data.py` script
using the [GeoNames database](https://www.geonames.org/)
To connect to GeoNames,
the script needs a personal access token,
which you can create
on the [GeoNames login page](http://www.geonames.org/login).
Add your username
to the `.env` file:
`GEONAMES_USERNAME=<username>`

Then, run the script to geocode the locations
that were added by the last script:

```sh
(venv)$ ./geo_lookup.py
```

**Note**: GeoNames rate limits the number
of requests per second
that can be delivered to a single app,
so this script can take a long time to complete.
The script will display informational messages
when it retrieves lat/lng results
for each location
and when the script is complete.

#### Build Front-End Assets

First, install dependencies by running the [npm](https://www.npmjs.com/get-npm) command:

```sh
$ npm install
```

Next, build the static resources for the Flask app to serve:

```sh
$ npm run build
```

#### Start the Flask App

Next, start the Flask API
in your [Python Virtual Environment](#python-virtual-environment):

```sh
(venv)$ flask run
```

Now, your local instance of Recurse Faces
with live data from the RC API
will be available at http://127.0.0.1:5000/:

However, because this instance is running
with statically generated resources from `npm build`,
local changes to the React front end
will not be reflected at this URL.

The React dev server is configured to proxy the Flask API,
so to run your local front end code
with live data from the RC API,
leave the Flask app running
and start the React front end in another terminal tab or window:

```sh
$ npm run start
```

Now, the React front end reflecting any local code changes
will be running at http://localhost:3000/
with data from the Flask back end API
running at http://127.0.0.1:5000/.

## Troubleshooting

If you receive either of the following messages:

```sh
File "./update_data.py", line 24
headers = {'Authorization': f'Bearer {token}'}
                                                ^
SyntaxError: invalid syntax
```

or

```sh
/usr/bin/python: No module named flask
```

reactivate your [Python virtual environment](#python-virtual-environment),
and then try to run the previous command again.

If you receive the following message:

```sh
psycopg2.OperationalError: could not connect to server: No such file or directory
	Is the server running locally and accepting
	connections on Unix domain socket "/tmp/.s.PGSQL.5432"?
```

make sure Postgres is running locally and the database connection URL is specified in the .env file.

<a href='http://www.recurse.com' title='Made with love at the Recurse Center'><img src='https://cloud.githubusercontent.com/assets/2883345/11325206/336ea5f4-9150-11e5-9e90-d86ad31993d8.png' height='20px'/></a>
![Licensed under the AGPL, version 3](https://img.shields.io/badge/license-AGPL3-blue.svg)
