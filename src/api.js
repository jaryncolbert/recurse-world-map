export function getLocations() {
  return fetch('/api/locations/all', {
      accept: 'application/json'
    }).then((response) => {
      return response.json();
    }).then((responseJson) => {
      if (responseJson.message === 'Access Denied') {
        console.log("Access denied!");
        window.location.pathname = "auth/recurse";
      } else {
        console.log("API Response: ", responseJson);
        return responseJson;
      }
    });
}
