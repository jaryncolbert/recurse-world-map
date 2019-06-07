import React from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";

import LocationPopup from "./LocationPopup";

export default function LocationMarker({ location }) {
  const people = location["person_list"];
  const radius = getRadius(people.length);

  return (
    <Marker
      position={[parseFloat(location["lat"]), parseFloat(location["lng"])]}
      className="location-marker"
      icon={circleIcon(radius, people.length.toString())}
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
    1: 20,
    2: 30,
    5: 40,
    10: 50,
    20: 65,
    50: 80,
    100: 150,
    200: 250,
    400: 350,
    800: 500,
    1500: 800
  };
  // Find the first key that is greater than the original size
  const pop = Object.keys(popToRadius).filter(n => n >= size)[0];
  return popToRadius[pop].toString();
};

const circleIcon = (radius, text) => {
  return L.divIcon({
    html: (`<span>${text}</span>`),
    iconSize: [radius, radius],
    iconAnchor: [radius/2, radius/2],
    popupAnchor: [0, 0],
    shadowSize: [0, 0],
    className: "circle-icon",
  });
};
