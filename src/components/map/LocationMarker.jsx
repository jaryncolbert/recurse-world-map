import React from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";

import LocationPopup from "./LocationPopup";
import { populationToRadius, populationToSize } from "./RadiusUtil";

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
                position={[
                    parseFloat(location["lat"]),
                    parseFloat(location["lng"])
                ]}
                className="location-marker"
                population={population}
                icon={circleIcon(population)}>
                <LocationPopup
                    key={location["location_id"]}
                    location={location}
                />
            </Marker>
        );
    }
}

const circleIcon = population => {
    const radius = populationToRadius(population);
    const size = populationToSize(population);
    const html = population !== 0 ? population : "";

    return L.divIcon({
        html: `<div><span>${html}</span></div>`,
        iconSize: [radius, radius],
        iconAnchor: [radius / 2, radius / 2],
        popupAnchor: [0, 0],
        shadowSize: [0, 0],
        className: "circle-icon circle-icon-" + size
    });
};
