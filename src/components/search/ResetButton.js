import React from "react";

export default function ResetButton({ resetFn }) {
    return (
        <button className="btn btn-primary col-sm" onClick={resetFn}>
            Reset
        </button>
    );
}
