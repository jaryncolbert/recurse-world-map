import React from "react";
import LeafletMap from "./map/LeafletMap";
import Search from "./search/Search";

function App() {
    return (
        <div className="App">
            <Search />
            <LeafletMap />
        </div>
    );
}

export default App;
