import React from "react";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import LocationMarker from "./LocationMarker";

export default class LocationClusterGroup extends React.Component {
    state = {
        triggerPopup: false
    };

    componentDidUpdate(prevProps) {
        let { locations, fitBoundsFn, fitBoundsTriggered } = this.props;

        if (
            locations &&
            locations.length > 0 &&
            (fitBoundsTriggered ||
                (!prevProps.locations || prevProps.locations.length === 0))
        ) {
            // Use underlying Leaflet getBounds() fn
            // to find bounds of Markers in FeatureGroup
            let groupBounds = this.refs.clusterGroupRef.leafletElement.getBounds();
            fitBoundsFn(groupBounds);
        }
    }

    render() {
        let { locations, selected, fitBoundsFn, ...otherProps } = this.props;
        return (
            <MarkerClusterGroup
                ref="clusterGroupRef"
                disableClusteringAtZoom={11}
                spiderfyOnMaxZoom={false}
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

    getPropsForSize = size => {
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

    clusterGroupIcon = cluster => {
        const markers = cluster.getAllChildMarkers();
        const totalPopulation = markers.reduce((sum, marker) => {
            if (marker.options.hasOwnProperty("population")) {
                sum += marker.options.population;
            }
            return sum;
        }, 0);

        const props = this.getPropsForSize(totalPopulation);
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
}
