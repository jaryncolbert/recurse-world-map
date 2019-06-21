export function getLocations() {
    console.log("API: Get all geolocation data");

    return fetch("/api/locations/all", {
        accept: "application/json"
    })
        .then(response => {
            return response.json();
        })
        .then(responseJson => {
            if (responseJson.message === "Access Denied") {
                console.log("Access denied!");
                window.location.pathname = "auth/recurse";
            } else {
                console.log("Geolocation Data: ", responseJson);
                return responseJson;
            }
        });
}

export function getLocationSuggestions(query) {
    console.log("API: Location query = ", query);

    return fetch("/api/locations/search?query=" + query, {
        accept: "application/json"
    })
        .then(response => {
            return response.json();
        })
        .then(responseJson => {
            if (responseJson.message === "Access Denied") {
                console.log("Access denied!");
                window.location.pathname = "auth/recurse";
            } else {
                console.log("Location Suggestions ", responseJson);
                return responseJson;
            }
        });
}
