import React from "react";
import ResetButton from "./ResetButton";
import LocationInput from "./LocationInput";
import Spinner from "../Spinner";

import "../../css/search.css";

export default function Search({
    searchCompletedFn,
    onInputCleared,
    clearInput,
    resetFn,
    isLoading,
    getLocationSuggestions
}) {
    return (
        <div className="search-container input-group">
            <LocationInput
                onSearchCompleted={searchCompletedFn}
                onInputCleared={onInputCleared}
                clearInput={clearInput}
                resetFn={resetFn}
                getLocationSuggestions={getLocationSuggestions}
            />
            <ResetButton resetFn={resetFn} />
            <Spinner isLoading={isLoading} id="search-spinner" />
        </div>
    );
}
