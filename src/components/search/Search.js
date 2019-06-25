import React from "react";
import ResetButton from "./ResetButton";
import LocationInput from "./LocationInput";

export default function Search({ searchCompletedFn, resetFn }) {
    return (
        <div className="location-search container-fluid">
            <div className="row">
                <LocationInput onSearchCompleted={searchCompletedFn} />
                <ResetButton resetFn={resetFn} />
            </div>
        </div>
    );
}
