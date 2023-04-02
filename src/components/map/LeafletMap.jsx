import React from "react";
import { Map, TileLayer } from "react-leaflet";

import LocationClusterGroup from "./LocationClusterGroup";
import Spinner from "../Spinner";

import "react-leaflet-markercluster/dist/styles.min.css";
import "../../css/map.css";

export default class LeafletMap extends React.Component {
    // Centered on Yaounde, Cameroon
    DEFAULT_VIEWPORT = {
        center: [3.846042, 11.502213],
        zoom: 2.5
    };

    DEFAULT_PADDING = { padding: [50, 50] };

    state = {
        fitBoundsTriggered: false
    };

    fitBounds = bounds => {
        const mapElem = this.refs.mapRef.leafletElement;

        mapElem.fitBounds(bounds, this.DEFAULT_PADDING);
        this.setState({
            fitBoundsTriggered: false
        });

        this.props.onFitBounds();
    };

    triggerFitBounds = () => {
        this.setState({
            fitBoundsTriggered: true
        });
    };

    componentDidUpdate(prevProps) {
        if (this.props.fitBoundsTriggered && !prevProps.fitBoundsTriggered) {
            this.triggerFitBounds();
        }
    }

    componentDidMount() {
        if (this.props.fitBoundsTriggered) {
            this.triggerFitBounds();
        }
    }

    render() {
        const { locations, selected, isLoading, ...otherProps } = this.props;
        const maxZoom = 11;

        return isLoading ? (
            <Spinner isLoading={isLoading} id="map-spinner" />
        ) : (
            <Map
                {...otherProps}
                ref="mapRef"
                viewport={this.DEFAULT_VIEWPORT}
                zoomSnap="0.2"
                maxZoom={maxZoom}>
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationClusterGroup
                    fitBoundsTriggered={this.state.fitBoundsTriggered}
                    fitBoundsFn={this.fitBounds}
                    maxZoom={maxZoom}
                    locations={locations}
                    selected={selected}
                    padding={this.DEFAULT_PADDING}
                />
            </Map>
        );
    }
}
