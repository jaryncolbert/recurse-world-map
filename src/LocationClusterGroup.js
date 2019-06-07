import React from "react";
import MarkerClusterGroup from "react-leaflet-markercluster";
import LocationMarker from "./LocationMarker";

export default function LocationClusterGroup({ locations, ...otherProps }) {
  return (
    <MarkerClusterGroup {...otherProps}>
      {locations.map(loc => (
        <LocationMarker key={loc["location_id"]} location={loc} />
      ))}
    </MarkerClusterGroup>
  );
}
