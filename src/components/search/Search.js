import React from "react";
import ResetButton from "./ResetButton";
import LocationInput from "./LocationInput";

import "../../css/search.css";

export default function Search({
    searchCompletedFn,
    onResetInputCompleted,
    resetInput,
    resetFn
}) {
    return (
        <div className="location-search container float-left">
            <div className="row">
                <LocationInput
                    onSearchCompleted={searchCompletedFn}
                    onResetInputCompleted={onResetInputCompleted}
                    resetInput={resetInput}
                    resetFn={resetFn}
                />
                <ResetButton resetFn={resetFn} />
            </div>
        </div>
    );
}
