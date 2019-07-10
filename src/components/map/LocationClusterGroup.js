import React from "react";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import LocationMarker from "./LocationMarker";

export default function LocationClusterGroup({
    locations,
    selected,
    ...otherProps
}) {
    return (
        <MarkerClusterGroup {...otherProps} iconCreateFunction={clusterGroup}>
            {locations.map(loc => {
                return (
                    <LocationMarker
                        key={loc["location_id"]}
                        location={loc}
                        isSelected={selected === loc["location_id"]}
                    />
                );
            })}
        </MarkerClusterGroup>
    );
}

const getPropsForSize = size => {
    const numToRadius = {
        10: {
            radius: 40,
            class: "sm"
        },
        20: {
            radius: 50,
            class: "md"
        },
        100: {
            radius: 70,
            class: "lg"
        },
        300: {
            radius: 90,
            class: "xl"
        },
        5000: {
            radius: 110,
            class: "xxl"
        }
    };
    // Find the first key that is greater than the original size
    const pop = Object.keys(numToRadius).filter(n => n > size)[0];
    return numToRadius[pop];
};

const clusterGroup = cluster => {
    const markers = cluster.getAllChildMarkers();
    const totalPopulation = markers.reduce((sum, marker) => {
        if (marker.options.hasOwnProperty("population")) {
            sum += marker.options.population;
        }
        return sum;
    }, 0);

    const props = getPropsForSize(totalPopulation);
    const html = totalPopulation !== 0 ? totalPopulation : "";

    return L.divIcon({
        html: `<div><span>${html}</span></div>`,
        iconSize: [props["radius"], props["radius"]],
        iconAnchor: [props["radius"] / 2, props["radius"] / 2],
        popupAnchor: [0, 0],
        shadowSize: [0, 0],
        className:
            "marker-cluster circle-cluster circle-cluster-" + props["class"]
    });
};
