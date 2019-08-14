import React from "react";
import LeafletMap from "../map/LeafletMap";
import Search from "../search/Search";

import { getRcLocations, getLocationData } from "../../api";

export default class App extends React.Component {
    state = {
        locations: [],
        selected: "",
        triggerClearInput: false,
        triggerFitBounds: false,
        searchLoading: false,
        mapLoading: false
    };

    componentDidMount() {
        this.loadAllLocations();
    }

    loadAllLocations = () => {
        this.setMapLoading();

        getRcLocations().then(result => {
            let locationList = [];
            let i;
            for (i in result) {
                locationList.push(result[i]);
            }

            this.setState({
                locations: locationList,
                selected: "",
                mapLoading: false,
                triggerFitBounds: true
            });
        });
    };

    setMapLoading = () => {
        this.setState({
            mapLoading: true
        });
    };

    setSearchLoading = () => {
        this.setState({
            searchLoading: true
        });
    };

    setSelectedLocation = location => {
        this.setSearchLoading();

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
                    selected: result["location_id"],
                    searchLoading: false
                });
            }
        });
    };

    resetSearch = () => {
        this.triggerClearInput();
        this.loadAllLocations();
        this.triggerFitBounds();
    };

    triggerClearInput = () => {
        this.setState({
            triggerClearInput: true
        });
    };

    onInputCleared = () => {
        this.setState({
            triggerClearInput: false,
            selected: ""
        });
    };

    triggerFitBounds = () => {
        this.setState({
            triggerFitBounds: true
        });
    };

    onFitBounds = () => {
        this.setState({
            triggerFitBounds: false
        });
    };

    render() {
        return (
            <div className="App">
                <Search
                    searchCompletedFn={this.setSelectedLocation}
                    clearInput={this.state.triggerClearInput}
                    onInputCleared={this.onInputCleared}
                    resetFn={this.resetSearch}
                    isLoading={this.state.searchLoading}
                />

                <div id="recurse-map">
                    <LeafletMap
                        fitBoundsTriggered={this.state.triggerFitBounds}
                        onFitBounds={this.onFitBounds}
                        locations={this.state.locations}
                        selected={this.state.selected}
                        onClick={this.triggerClearInput}
                        isLoading={this.state.mapLoading}
                    />
                </div>
            </div>
        );
    }
}
