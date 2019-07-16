import React from "react";

export default function ResetButton({ resetFn }) {
    return (
        <button
            id="reset-button"
            className="btn btn-primary col-xs-2"
            onClick={resetFn}>
            Reset
        </button>
    );
}
