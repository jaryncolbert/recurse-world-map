import React from "react";

export default function ResetButton({ resetFn }) {
    return (
        <button
            id="reset-button"
            className="btn btn-primary btn-sm"
            onClick={resetFn}>
            Reset
        </button>
    );
}
