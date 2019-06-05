import React from "react";
import { Marker, Popup } from "react-leaflet";

export default function LocationMarker({ location }) {
  return (
    <Marker
      position={[parseFloat(location["lat"]), parseFloat(location["lng"])]}
    >
      <LocationPopup key={location["location_id"]}
        locationName={location["location_name"]}
        people={location["person_list"]}
      />
    </Marker>
  );
}

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
        <ul className="resident_list">
          {people.map(p => <PersonData key={p["person_id"]} person={p} />)}
        </ul>
      </div>
    </Popup>
  );
}

function PersonData({ person }) {
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
