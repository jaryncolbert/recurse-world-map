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
    isLoading
}) {
    return (
        <>
            <LocationInput
                onSearchCompleted={searchCompletedFn}
                onInputCleared={onInputCleared}
                clearInput={clearInput}
                resetFn={resetFn}
            />
            <ResetButton resetFn={resetFn} />
            <Spinner isLoading={isLoading} id="search-spinner" />
        </>
    );
}
