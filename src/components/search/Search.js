import React from "react";
import ResetButton from "./ResetButton";
import LocationInput from "./LocationInput";

import "../../css/search.css";

export default function Search({
    searchCompletedFn,
    onInputCleared,
    clearInput,
    resetFn
}) {
    return (
        <div className="location-search container float-left">
            <div className="row">
                <LocationInput
                    onSearchCompleted={searchCompletedFn}
                    onInputCleared={onInputCleared}
                    clearInput={clearInput}
                    resetFn={resetFn}
                />
                <ResetButton resetFn={resetFn} />
            </div>
        </div>
    );
}
