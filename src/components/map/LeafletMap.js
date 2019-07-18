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
                    attribution='Map tiles by © <a href= "http://cartodb.com/attributions#basemaps">Carto</a>, under CC BY 3.0. Data by © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, under ODbL.'
                    url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
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
