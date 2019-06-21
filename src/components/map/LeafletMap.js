import React from "react";
import { Map, TileLayer } from "react-leaflet";

import { getLocations } from "../../api";
import LocationClusterGroup from "./LocationClusterGroup";

import "react-leaflet-markercluster/dist/styles.min.css";
import "../../css/map.css";

const DEFAULT_VIEWPORT = {
    center: [3.846042, 11.502213], //Yaounde, Cameroon
    zoom: 2.7
};

export default class LeafletMap extends React.Component {
    state = {
        viewport: DEFAULT_VIEWPORT,
        locations: []
    };

    componentDidMount() {
        getLocations().then(result => {
            let locationList = [];
            let i;
            for (i in result) {
                locationList.push(result[i]);
            }

            this.setState({ locations: locationList });
        });
    }

    onViewportChanged = viewport => {
        this.setState({ viewport });
    };

    render() {
        return (
            <Map
                onViewportChanged={this.onViewportChanged}
                viewport={this.state.viewport}
                zoomSnap="0.2">
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationClusterGroup
                    maxClusterRadius="45"
                    locations={this.state.locations}
                />
            </Map>
        );
    }
}
