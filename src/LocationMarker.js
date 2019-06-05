import React from "react";
import { Marker, Popup } from "react-leaflet";

export default function LocationMarker({ location }) {
  return (
    <Marker
      position={[parseFloat(location["lat"]), parseFloat(location["lng"])]}
    >
      <LocationPopup
        locationName={location["location_name"]}
        people={location["person_list"]}
      />
    </Marker>
  );
}

function LocationPopup({ locationName, people }) {
  return (
    <Popup key={locationName}>
      <div className="location-popup">
        <p className="location_name">{locationName}</p>
        <ul className="resident_list">
          {people.map(p => (
            <li key={p["person_id"]}>
              {[p["first_name"], p["last_name"]].join(" ")}
            </li>
          ))}
        </ul>
      </div>
    </Popup>
  );
}
