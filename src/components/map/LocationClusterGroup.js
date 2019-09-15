import React from "react";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import LocationMarker from "./LocationMarker";
import { populationToRadius, populationToSize } from "./RadiusUtil";

export default class LocationClusterGroup extends React.Component {
    state = {
        triggerPopup: false
    };

    componentDidMount() {
        if (this.props.fitBoundsTriggered) {
            this.fitBounds();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.fitBoundsTriggered && !prevProps.fitBoundsTriggered) {
            this.fitBounds();
        }
    }

    fitBounds = () => {
        // Use underlying Leaflet getBounds() fn
        // to find bounds of Markers in FeatureGroup
        let groupBounds = this.refs.clusterGroupRef.leafletElement.getBounds();
        this.props.fitBoundsFn(groupBounds);
    };

    render() {
        let {
            locations,
            selected,
            fitBoundsFn,
            padding,
            maxZoom,
            ...otherProps
        } = this.props;
        return (
            <MarkerClusterGroup
                ref="clusterGroupRef"
                maxClusterRadius="42"
                disableClusteringAtZoom={maxZoom}
                spiderfyOnMaxZoom={false}
                onClusterClick={cluster => cluster.zoomToBounds(padding)}
                {...otherProps}
                iconCreateFunction={this.clusterGroupIcon}>
                {locations.map(loc => {
                    return (
                        <LocationMarker
                            key={loc["location_id"]}
                            location={loc}
                            zoomToShowMarkerFn={this.zoomToMarker}
                            isSelected={selected === loc["location_id"]}
                            isVisible={this.state.triggerPopup}
                            onPopupDisplayedFn={this.onPopupDisplayed}
                        />
                    );
                })}
            </MarkerClusterGroup>
        );
    }

    zoomToMarker = marker => {
        this.refs.clusterGroupRef.leafletElement.zoomToShowLayer(
            marker,
            this.triggerPopup
        );
    };

    triggerPopup = () => {
        this.setState({
            triggerPopup: true
        });
    };

    onPopupDisplayed = () => {
        this.setState({
            triggerPopup: false
        });
    };

    clusterGroupIcon = cluster => {
        const markers = cluster.getAllChildMarkers();
        const totalPopulation = markers.reduce((sum, marker) => {
            if (marker.options.hasOwnProperty("population")) {
                sum += marker.options.population;
            }
            return sum;
        }, 0);

        const innerRadius = populationToRadius(totalPopulation);
        const outerRadius = innerRadius + 10;
        const size = populationToSize(totalPopulation);
        const html = totalPopulation !== 0 ? totalPopulation : "";

        return L.divIcon({
            html: `<div style="height: ${innerRadius}px; width: ${innerRadius}px;"><span>${html}</span></div>`,
            iconSize: [outerRadius, outerRadius],
            iconAnchor: [outerRadius / 2, outerRadius / 2],
            popupAnchor: [0, 0],
            shadowSize: [0, 0],
            className: "marker-cluster circle-cluster circle-cluster-" + size
        });
    };
}
