import React from "react";
import LeafletMap from "./map/LeafletMap";
import Search from "./search/Search";

import { getLocations, getLocationData } from "../api";

export default class App extends React.Component {
    state = {
        locations: []
    };

    componentDidMount() {
        this.loadAllLocations();
    }

    loadAllLocations = () => {
        getLocations().then(result => {
            let locationList = [];
            let i;
            for (i in result) {
                locationList.push(result[i]);
            }

            this.setState({ locations: locationList });
        });
    };

    findLocationBounds = location => {
        getLocationData(location).then(result => {
            if (!result["location_id"]) {
                throw Error(
                    `Empty geolocation result returned for location ${
                        location["id"]
                    } ${location["name"]}`
                );
            }

            this.setState({ locations: [result] });
        });
    };

    render() {
        return (
            <div className="App">
                <Search onSearchCompleted={this.findLocationBounds} />
                <LeafletMap locations={this.state.locations} />
            </div>
        );
    }
}
