import React from "react";
import Map from "../map/Map";
import Search from "../search/Search";

import { getLocationData } from "../../api";

export default class App extends React.Component {
    state = {
        triggerClearInput: false,
        triggerFitBounds: false,
        searchLoading: false
    };

    setSearchLoading = () => {
        this.setState({
            searchLoading: true,
            selected: null
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
                this.setState({
                    selected: result,
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
            selected: null
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
                    selectedLocation={this.state.selected}
                    onClick={this.triggerClearInput}
                />
            </div>
        );
    }
}
