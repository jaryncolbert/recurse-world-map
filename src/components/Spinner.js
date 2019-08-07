import React from "react";

export default function Spinner({ isLoading, id }) {
    return isLoading ? (
        <div className="spinner-container" id={id + "-container"}>
            <div className="spinner-border text-info" 
                id={id}
                role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    ) : null;
}