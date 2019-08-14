import React from "react";

import LeafletMap from "./LeafletMap";
import withLocations from "./LocationProvider";

function MapContainer({ ...props }) {
    return (
        <div id="recurse-map">
            <LeafletMap {...props} />
        </div>
    );
}

const Map = withLocations(MapContainer);
export default Map;
