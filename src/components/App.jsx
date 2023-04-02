import React, { useEffect, useState } from "react";
import LeafletMap from "./map/LeafletMap";
import Navbar from "./header/Navbar";

import { getRcLocations, getLocationData, getLocationSuggestions, getCurrentUser } from "../api";

export default function App() {
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [triggerClearInput, setTriggerClearInput] = useState(false);
    const [triggerFitBounds, setTriggerFitBounds] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState({});

    const loadAllLocations = () => {
        setMapLoading(true);

        getRcLocations().then(result => {
            setLocations(result);
            setSelectedLocation("");
            setMapLoading(false);
            setTriggerFitBounds(true);
        });
    };

    const loadCurrentUserData = () => {
        getCurrentUser().then(result => {
            setCurrentUser({
                imageUrl: result["image_url"],
                personName: result["name"],
                currentLocation: result["current_location"]
            });
        });
    };

    useEffect(() => {
        loadAllLocations();
        loadCurrentUserData();
    }, []);

    const onSetSelectedLocation = (location) => {
        setSearchLoading(true);

        getLocationData(location).then(result => {
            if (!result["location_id"]) {
                throw Error(
                    `Empty geolocation result returned for location ${
                        location["id"]
                    } ${location["name"]}`
                );
            } else {
                const newLocations = locations.slice();
                if (
                    !result["person_list"] ||
                    result["person_list"].length === 0
                ) {
                    newLocations.push(result);
                }

                setLocations(newLocations);
                setSelectedLocation(result["location_id"]);
                setSearchLoading(false);
            }
        });
    };

    const resetSearch = () => {
        setTriggerClearInput(true);
        loadAllLocations();
        setTriggerFitBounds(true);
    };

    const onTriggerClearInput = () => {
        setTriggerClearInput(true);
    }

    const onInputCleared = () => {
        setTriggerClearInput(false);
        setSelectedLocation("");
    };

    const onFitBounds = () => {
        setTriggerFitBounds(false);
    };
    
    return (
        <div className="App">
            <Navbar
                searchCompletedFn={onSetSelectedLocation}
                clearInput={triggerClearInput}
                onInputCleared={onInputCleared}
                resetFn={resetSearch}
                isLoading={searchLoading}
                getRecurserInfo={getCurrentUser}
                getLocationSuggestions={getLocationSuggestions}
                currentUser={currentUser}
            />

            <div id="recurse-map">
                <LeafletMap
                    fitBoundsTriggered={triggerFitBounds}
                    onFitBounds={onFitBounds}
                    locations={locations}
                    selected={selectedLocation}
                    onClick={onTriggerClearInput}
                    isLoading={mapLoading}
                />
            </div>
        </div>
    );
}