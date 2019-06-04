import React from "react";
import { Map, TileLayer, type Viewport } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";

import { getLocations } from "./api";
import LocationMarker from "./LocationMarker";

import "react-leaflet-markercluster/dist/styles.min.css";
import "./map.css";

const DEFAULT_VIEWPORT = {
  center: [6.662966, 7.690188],
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

  onClickReset = () => {
    this.setState({ viewport: DEFAULT_VIEWPORT });
  };

  onViewportChanged = (viewport: Viewport) => {
    this.setState({ viewport });
  };

  render() {
    return (
      <Map
        onClick={this.onClickReset}
        onViewportChanged={this.onViewportChanged}
        viewport={this.state.viewport}
        zoomSnap="0.2"
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup>
          {this.state.locations.map(loc => (
            <LocationMarker location={loc} />
          ))}
        </MarkerClusterGroup>
      </Map>
    );
  }
}
