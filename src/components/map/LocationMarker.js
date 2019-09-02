import React from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";

import LocationPopup from "./LocationPopup";

export default class LocationMarker extends React.Component {
  componentDidMount() {
    let { isSelected, zoomToShowMarkerFn } = this.props;

    const markerRef = this.refs.markerRef;

    if (isSelected && markerRef) {
      const leafletMarker = markerRef.leafletElement;
      zoomToShowMarkerFn(leafletMarker);
    }
  }

  componentDidUpdate(prevProps) {
    let {
      isSelected,
      zoomToShowMarkerFn,
      isVisible,
      onPopupDisplayedFn
    } = this.props;

    const markerRef = this.refs.markerRef;

    if (markerRef) {
      const leafletMarker = markerRef.leafletElement;

      if (isSelected && !prevProps.isSelected) {
        // Call function to zoom to the boundaries of the selected marker
        // then open its popup
        zoomToShowMarkerFn(leafletMarker);
      }

      if (isSelected && !prevProps.isVisible && isVisible) {
        leafletMarker.openPopup();
        onPopupDisplayedFn();
      }

      if (!isSelected) {
        leafletMarker.closePopup();
      }
    }
  }

  render() {
    const { location, isSelected } = this.props;

    const people = location["person_list"];
    const population = people ? people.length : 0;
    const hasPeople = !!location["has_rc_people"];

    if (population === 0 && !isSelected && !hasPeople) {
      return null;
    }

    return (
      <Marker
        ref="markerRef"
        position={[parseFloat(location["lat"]), parseFloat(location["lng"])]}
        className="location-marker"
        population={population}
        icon={circleIcon(population)}>
        <LocationPopup key={location["location_id"]} location={location} />
      </Marker>
    );
  }
}

/* Use approx fibonacci seq to scale sizes of markers */
const getProps = size => {
  const popToRadius = {
    1: { radius: 20, class: "sm" },
    2: { radius: 30, class: "sm" },
    5: { radius: 35, class: "sm" },
    10: { radius: 50, class: "sm" },
    20: { radius: 65, class: "lg" },
    50: { radius: 80, class: "lg" },
    100: { radius: 90, class: "xl" },
    200: { radius: 100, class: "xl" },
    400: { radius: 150, class: "xxl" },
    5000: { radius: 500, class: "xxl" }
  };
  // Find the first key that is greater than the original size
  const pop = Object.keys(popToRadius).filter(n => n >= size)[0];
  return popToRadius[pop];
};

const circleIcon = population => {
  const props = getProps(population);
  const radius = props["radius"];
  const html = population !== 0 ? population : "";

  return L.divIcon({
    html: `<div><span>${html}</span></div>`,
    iconSize: [radius, radius],
    iconAnchor: [radius / 2, radius / 2],
    popupAnchor: [0, 0],
    shadowSize: [0, 0],
    className: "circle-icon circle-icon-" + props["class"]
  });
};
