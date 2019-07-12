import React from "react";
import LeafletMap from "./map/LeafletMap";
import Search from "./search/Search";

import { getLocations, getLocationData } from "../api";

export default class App extends React.Component {
    // Centered on Yaounde, Cameroon
    DEFAULT_VIEWPORT = {
        center: [3.846042, 11.502213],
        zoom: 2.7
    };

    state = {
        locations: [],
        viewport: this.DEFAULT_VIEWPORT,
        targetLocation: "",
        selected: ""
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

            this.setState({
                locations: locationList,
                selected: "",
                viewport: {
                    center: [3.846042, 11.502213],
                    zoom: 2.7
                }
            });
        });
    };

    zoomToLocation = location => {
        getLocationData(location).then(result => {
            if (!result["location_id"]) {
                throw Error(
                    `Empty geolocation result returned for location ${
                        location["id"]
                    } ${location["name"]}`
                );
            } else {
                const newLocations = this.state.locations.slice();
                if (
                    !result["person_list"] ||
                    result["person_list"].length === 0
                ) {
                    newLocations.push(result);
                }
                this.setState({
                    locations: newLocations,
                    targetLocation: result["location_id"],
                    viewport: {
                        center: [result["lat"], result["lng"]],
                        zoom: 9
                    }
                });
            }
        });
    };

    setSelected = () => {
        this.setState({
            selected: this.state.targetLocation
        });
    };

    render() {
        return (
            <div className="App">
                <h1>World of Recursers</h1>
                <Search
                    searchCompletedFn={this.zoomToLocation}
                    resetFn={this.loadAllLocations}
                />
                <LeafletMap
                    onViewReset={this.setSelected}
                    locations={this.state.locations}
                    viewport={this.state.viewport}
                    selected={this.state.selected}
                />
            </div>
        );
    }
}
