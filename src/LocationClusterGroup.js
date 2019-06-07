import React from "react";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import LocationMarker from "./LocationMarker";

export default function LocationClusterGroup({ locations, ...otherProps }) {
  return (
    <MarkerClusterGroup {...otherProps} iconCreateFunction={clusterGroup}>
      {locations.map(loc => (
        <LocationMarker key={loc["location_id"]} location={loc} />
      ))}
    </MarkerClusterGroup>
  );
}

const getPropsForSize = size => {
  const numToRadius = {
    10: {
      radius: 30,
      class: "small"
    },
    20: {
      radius: 50,
      class: "medium"
    },
    5000: {
      radius: 70,
      class: "large"
    }
  };
  // Find the first key that is greater than the original size
  const pop = Object.keys(numToRadius).filter(n => n > size)[0];
  return numToRadius[pop];
};

const clusterGroup = cluster => {
  const count = cluster.getChildCount();
  const props = getPropsForSize(count);

  return L.divIcon({
    html: `<div><span>${count}</span></div>`,
    iconSize: [props["radius"], props["radius"]],
    iconAnchor: [props["radius"] / 2, props["radius"] / 2],
    popupAnchor: [0, 0],
    shadowSize: [0, 0],
    className: "marker-cluster circle-cluster circle-cluster-" + props["class"]
  });
};
