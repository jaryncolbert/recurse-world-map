import React from "react";

import { getPrivateRcLocations, getPublicRcLocations } from "../../api";
import withAuth from "../home/Authenticator";

function withLocationsAuthRequired(WrappedComponent) {
    return class LocationProvider extends React.Component {
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

        loadLocations = () => {
            this.setLocationsLoading();

            const getLocations = this.props.isAuthenticated
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

const withLocations = Component =>
    withAuth(withLocationsAuthRequired(Component));

export default withLocations;
