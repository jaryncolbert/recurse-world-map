import React from "react";
import { Map, TileLayer } from "react-leaflet";

import LocationClusterGroup from "./LocationClusterGroup";

import "react-leaflet-markercluster/dist/styles.min.css";
import "../../css/map.css";

export default function LeafletMap({
    locations,
    selected,
    viewport,
    ...otherProps
}) {
    return (
        <Map {...otherProps} viewport={viewport} zoomSnap="0.2" maxZoom={11}>
            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationClusterGroup
                maxClusterRadius="45"
                locations={locations}
                selected={selected}
            />
        </Map>
    );
}
