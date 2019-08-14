import React from "react";

import {
    getPrivateRcLocations,
    getPublicRcLocations,
    getCurrentUser
} from "../../api";

export default function withLocations(WrappedComponent) {
    return class extends React.Component {
        state = {
            locations: [],
            locationsLoading: false,
            locationsLoaded: false
        };

        componentDidMount() {
            this.loadLocations();
        }

        componentDidUpdate(prevProps) {
            if (!prevProps.triggerReload && this.props.triggerReload) {
                this.loadLocations();
            }
        }

        setLocationsLoading = () => {
            this.setState({
                locationsLoading: true,
                locationsLoaded: false
            });
        };

        isAuthenticated = () => {
            const unauthenticatedMsg = "User is unauthenticated";

            getCurrentUser().then(result => {
                const isAuthenticated = !!result["id"];

                const authMsg = isAuthenticated
                    ? `Authenticated as user ${result["id"]} - ${
                          result["first_name"]
                      }`
                    : unauthenticatedMsg;
                console.log(authMsg);

                return isAuthenticated;
            });

            console.log(unauthenticatedMsg);
            return false;
        };

        loadLocations = () => {
            this.setLocationsLoading();

            const getLocations = this.isAuthenticated()
                ? getPrivateRcLocations
                : getPublicRcLocations;

            getLocations().then(result => {
                let locationList = [];
                let i;
                for (i in result) {
                    locationList.push(result[i]);
                }

                this.setState({
                    locations: locationList,
                    locationsLoading: false,
                    locationsLoaded: true
                });
            });
        };

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    locations={this.state.locations}
                    locationsLoading={this.state.locationsLoading}
                    locationsLoaded={this.state.locationsLoaded}
                />
            );
        }
    };
}
