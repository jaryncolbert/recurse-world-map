import React from "react";
import LeafletMap from "./map/LeafletMap";
import Search from "./search/Search";

import { getRcLocations, getLocationData } from "../api";

export default class App extends React.Component {
    // Centered on Yaounde, Cameroon
    DEFAULT_VIEWPORT = {
        center: [3.846042, 11.502213],
        zoom: 2.5
    };

    state = {
        locations: [],
        viewport: this.DEFAULT_VIEWPORT,
        selected: "",
        resetInput: false
    };

    componentDidMount() {
        this.loadAllLocations();
    }

    loadAllLocations = () => {
        getRcLocations().then(result => {
            let locationList = [];
            let i;
            for (i in result) {
                locationList.push(result[i]);
            }

            this.setState({
                locations: locationList,
                selected: ""
            });
        });
    };

    setSelectedLocation = location => {
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
                    selected: result["location_id"]
                });
            }
        });
    };

    resetSearch = () => {
        this.setState({
            resetInput: true
        });

        this.loadAllLocations();
    };

    onResetInputCompleted = () => {
        this.setState({
            resetInput: false
        });
    };

    render() {
        return (
            <div className="App">
                <div className="header-search">
                    <h1>World of Recursers</h1>
                    <Search
                        searchCompletedFn={this.setSelectedLocation}
                        resetInput={this.state.resetInput}
                        onResetInputCompleted={this.onResetInputCompleted}
                        resetFn={this.resetSearch}
                    />
                </div>

                <div id="recurse-map">
                    <LeafletMap
                        fitBoundsTriggered={this.state.resetInput}
                        locations={this.state.locations}
                        viewport={this.state.viewport}
                        selected={this.state.selected}
                    />
                </div>
            </div>
        );
    }
}
