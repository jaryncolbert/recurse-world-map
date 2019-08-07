import React from "react";
import { Map, TileLayer } from "react-leaflet";

import LocationClusterGroup from "./LocationClusterGroup";
import Spinner from "../Spinner";

import "react-leaflet-markercluster/dist/styles.min.css";
import "../../css/map.css";

export default class LeafletMap extends React.Component {
    state = {
        fitBoundsTriggered: false
    };

    fitBounds = bounds => {
        const { onFitBounds, padding } = this.props;

        const mapElem = this.refs.mapRef.leafletElement;

        mapElem.fitBounds(bounds, padding);
        this.setState({
            fitBoundsTriggered: false
        });

        onFitBounds();
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
        const {
            locations,
            selected,
            viewport,
            isLoading,
            padding,
            ...otherProps
        } = this.props;
        return isLoading ? (
            <Spinner isLoading={isLoading} id="map-spinner" />
        ) : (
            <Map
                {...otherProps}
                ref="mapRef"
                viewport={viewport}
                zoomSnap="0.2"
                maxZoom={11}>
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationClusterGroup
                    fitBoundsTriggered={this.state.fitBoundsTriggered}
                    fitBoundsFn={this.fitBounds}
                    maxClusterRadius="45"
                    locations={locations}
                    selected={selected}
                    padding={padding}
                />
            </Map>
        );
    }
}
