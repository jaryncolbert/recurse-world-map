import React from "react";
import { Marker, Popup } from "react-leaflet";

export default function LocationMarker({ location }) {
  return (
    <Marker
      key={location["location_id"]}
      position={[parseFloat(location["lat"]), parseFloat(location["lng"])]}
    >
      <Popup>
        <span>{location["name"]}</span>
      </Popup>
    </Marker>
  );
}
