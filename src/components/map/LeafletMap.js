import React from "react";
import { Map, TileLayer } from "react-leaflet";

import LocationClusterGroup from "./LocationClusterGroup";

import "react-leaflet-markercluster/dist/styles.min.css";
import "../../css/map.css";

export default class LeafletMap extends React.Component {
    state = {
        fitBoundsTriggered: false
    };

    fitBounds = bounds => {
        const fitBoundsOptions = {
            padding: [40, 40]
        };
        const mapElem = this.refs.mapRef.leafletElement;

        mapElem.fitBounds(bounds, fitBoundsOptions);
        this.setState({
            fitBoundsTriggered: false
        });
    };

    triggerFitBounds = () => {
        this.setState({
            fitBoundsTriggered: true
        });
    };

    componentDidUpdate(prevProps) {
        const { fitBoundsTriggered } = this.props;

        if (fitBoundsTriggered && !prevProps.fitBoundsTriggered) {
            this.triggerFitBounds();
        }
    }

    render() {
        const { locations, selected, viewport, ...otherProps } = this.props;
        return (
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
                />
            </Map>
        );
    }
}
