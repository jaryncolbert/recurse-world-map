import React from "react";
import ResetButton from "./ResetButton";
import LocationInput from "./LocationInput";

import "../../css/search.css";

export default function Search({ searchCompletedFn, resetFn }) {
    return (
        <div className="location-search container float-left">
            <div className="row">
                <LocationInput onSearchCompleted={searchCompletedFn} />
                <ResetButton resetFn={resetFn} />
            </div>
        </div>
    );
}
