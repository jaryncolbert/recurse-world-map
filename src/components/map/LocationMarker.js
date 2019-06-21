import React from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";

import LocationPopup from "./LocationPopup";

export default function LocationMarker({ location }) {
    const people = location["person_list"];
    const population = people.length;

    return (
        <Marker
            position={[
                parseFloat(location["lat"]),
                parseFloat(location["lng"])
            ]}
            className="location-marker"
            population={population}
            icon={circleIcon(population)}>
            <LocationPopup
                key={location["location_id"]}
                locationName={location["location_name"]}
                people={people}
            />
        </Marker>
    );
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
        100: { radius: 150, class: "xl" },
        200: { radius: 250, class: "xl" },
        400: { radius: 350, class: "xxl" },
        5000: { radius: 500, class: "xxl" }
    };
    // Find the first key that is greater than the original size
    const pop = Object.keys(popToRadius).filter(n => n >= size)[0];
    return popToRadius[pop];
};

const circleIcon = population => {
    const props = getProps(population);
    const radius = props["radius"];

    return L.divIcon({
        html: `<div><span>${population}</span></div>`,
        iconSize: [radius, radius],
        iconAnchor: [radius / 2, radius / 2],
        popupAnchor: [0, 0],
        shadowSize: [0, 0],
        className: "circle-icon circle-icon-" + props["class"]
    });
};
