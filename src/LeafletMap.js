import React, { Component } from 'react';
import { Map, TileLayer, Marker, type Viewport } from 'react-leaflet'
import './map.css';

const DEFAULT_VIEWPORT = {
  center: [6.662966, 7.690188],
  zoom: 2.7
}

export default class LeafletMap extends Component<{}, { viewport: Viewport }> {
  state = {
    viewport: DEFAULT_VIEWPORT,
  }

  onClickReset = () => {
    this.setState({ viewport: DEFAULT_VIEWPORT })
  }

  onViewportChanged = (viewport: Viewport) => {
    this.setState({ viewport })
  }

  render() {
    return (
      <Map
        onClick={this.onClickReset}
        onViewportChanged={this.onViewportChanged}
        viewport={this.state.viewport}
        zoomSnap="0.1">
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
          <Marker position={[49.8397, 24.0297]} />
          <Marker position={[52.2297, 21.0122]} />
          <Marker position={[51.5074, -0.0901]} />
      </Map>
    )
  }
}
