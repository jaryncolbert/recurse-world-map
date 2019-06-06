import React from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";

export default function LocationMarker({ location }) {
  const people = location["person_list"];
  const radius = getRadius(people.length);

  return (
    <Marker
      position={[parseFloat(location["lat"]), parseFloat(location["lng"])]}
      className={"location-marker-" + radius}
      icon={circleIcon(radius)}
    >
      <LocationPopup
        key={location["location_id"]}
        locationName={location["location_name"]}
        people={people}
      />
    </Marker>
  );
}

/* Use approx fibonacci seq to scale sizes of markers */
const getRadius = size => {
  const popToRadius = {
    1: 10,
    2: 15,
    5: 25,
    10: 40,
    20: 60,
    50: 80,
    100: 150,
    200: 250,
    400: 350,
    800: 500,
    1500: 800
  };
  // Find the first key that is greater than the original size
  const pop = Object.keys(popToRadius).reduce((result, n, i) => {
    let max = result[0];
    const origSize = result[1];
    let found = result[2];

    if (n >= origSize && !found) {
      max = n;
      found = true;
    }
    return [max, origSize, found];
  }, [0, size, false]);

  console.log("Radius for ", size, pop);

  return popToRadius[pop[0]];
};

const circleIcon = radius => {
  return L.divIcon({
    iconSize: [radius, radius],
    iconAnchor: [10, 10],
    popupAnchor: [10, 0],
    shadowSize: [0, 0],
    className: "circle-icon"
  });
};

/* LocationPopup renders the list of affiliated people with a link to their
 * directory entries
 */
function LocationPopup({ locationName, people }) {
  const population = people.length;
  const recursers = population > 1 ? "Recursers" : "Recurser";

  return (
    <Popup key={locationName} maxHeight="200">
      <div className="location-popup">
        <p className="location_name">{locationName}</p>
        <p className="location_stats">{population + " " + recursers}</p>
        <PeopleData people={people} />
      </div>
    </Popup>
  );
}

function PeopleData({ people }) {
  return (
    <ul className="person_list">
      {people.map(p => (
        <Person key={p["person_id"]} person={p} />
      ))}
    </ul>
  );
}

function Person({ person }) {
  return (
    <li>
      <a
        href={"https://www.recurse.com/directory/" + person["person_id"]}
        target="_blank"
        rel="noopener noreferrer"
      >
        {[person["first_name"], person["last_name"]].join(" ")}
      </a>
    </li>
  );
}
