import React from "react";
import { Map, TileLayer } from "react-leaflet";

import LocationClusterGroup from "./LocationClusterGroup";

import "react-leaflet-markercluster/dist/styles.min.css";
import "../../css/map.css";

const DEFAULT_VIEWPORT = {
    center: [3.846042, 11.502213], //Yaounde, Cameroon
    zoom: 2.7
};

export default class LeafletMap extends React.Component {
    state = {
        viewport: DEFAULT_VIEWPORT
    };

    onViewportChanged = viewport => {
        this.setState({ viewport });
    };

    render() {
        const { locations, ...otherProps } = this.props;
        return (
            <Map
                {...otherProps}
                onViewportChanged={this.onViewportChanged}
                viewport={this.state.viewport}
                zoomSnap="0.2"
                maxZoom={11}>
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationClusterGroup
                    maxClusterRadius="45"
                    locations={locations}
                />
            </Map>
        );
    }
}
