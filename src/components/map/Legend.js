import React from "react";

export function Legend() {
    return (
        <div className="map-legend">
            <span className="circle-icon">pop</span>
            <span>
                : Single City with <i>{"${pop}"}</i> RCers
            </span>
            <span className="circle-cluster">pop</span>
            <span>
                : Cluster of Cities <i>{"${pop}"}</i> RCers (Click to Expand
                Cluster)
            </span>
        </div>
    );
}
