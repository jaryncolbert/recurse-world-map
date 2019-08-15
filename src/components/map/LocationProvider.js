import React from "react";

import { getPrivateRcLocations, getPublicRcLocations } from "../../api";
import withAuth from "../home/Authenticator";

function withLocationsAuthRequired(WrappedComponent) {
    return class LocationProvider extends React.Component {
        state = {
            locations: [],
            locationsHash: {},
            locationsLoading: false,
            locationsLoaded: false
        };

        componentDidMount() {
            this.loadLocations();
        }

        componentDidUpdate(prevProps) {
            if (
                (!prevProps.triggerReload && this.props.triggerReload) ||
                prevProps.isAuthenticated !== this.props.isAuthenticated
            ) {
                this.loadLocations();
            }

            const selectedLocation = this.props.selectedLocation;
            if (!prevProps.selectedLocation && selectedLocation) {
                const id = selectedLocation["location_id"].toString();
                if (!this.state.locationsHash[id]) {
                    let newLocations = this.state.locations.slice();
                    newLocations.unshift(selectedLocation);

                    const newHash = Object.assign(this.state.locationsHash, {
                        [id]: selectedLocation
                    });

                    this.setState({
                        locations: newLocations,
                        locationsHash: newHash
                    });
                }
            }
        }

        setLocationsLoading = () => {
            this.setState({
                locationsHash: {},
                locations: [],
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
                let locationsHash = {};

                for (let i in result) {
                    const locationId = result[i]["location_id"].toString();
                    locationsHash[locationId] = result[i];
                    locationList.push(result[i]);
                }

                this.setState({
                    locations: locationList,
                    locationsHash: locationsHash,
                    locationsLoading: false,
                    locationsLoaded: true
                });
            });
        };

        render() {
            const { selectedLocation, ...otherProps } = this.props;
            const selected = selectedLocation
                ? selectedLocation["location_id"]
                : "";

            return (
                <WrappedComponent
                    {...otherProps}
                    selected={selected}
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
