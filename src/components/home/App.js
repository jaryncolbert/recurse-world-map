import React from "react";
import Map from "../map/Map";
import Search from "../search/Search";

import { getLocationData } from "../../api";

export default class App extends React.Component {
    state = {
        selected: "",
        triggerClearInput: false,
        triggerFitBounds: false,
        searchLoading: false
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
                <Map
                    fitBoundsTriggered={this.state.triggerFitBounds}
                    onFitBounds={this.onFitBounds}
                    selected={this.state.selected}
                    onClick={this.triggerClearInput}
                />
            </div>
        );
    }
}
