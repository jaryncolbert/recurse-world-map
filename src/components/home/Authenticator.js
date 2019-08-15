import React from "react";
import { Redirect, withRouter } from "react-router-dom";

import { getCurrentUser, login, logout } from "../../api";

export default function withAuth(WrappedComponent) {
    return class Authenticator extends React.Component {
        state = {
            isAuthenticated: false,
            currentUser: {}
        };

        authenticate = () => {
            getCurrentUser().then(result => {
                if (result && result["id"]) {
                    console.log(
                        `Authenticated as user ${result["id"]} - ${
                            result["first_name"]
                        }`
                    );

                    this.setState({
                        isAuthenticated: true,
                        currentUser: result
                    });
                }
            });
        };

        logout = () => {
            this.setState({
                isAuthenticated: false,
                currentUser: {}
            });
        };

        isAuthenticated = () => {
            this.authenticate();
            return this.state.isAuthenticated;
        };

        componentDidMount() {
            this.authenticate();
        }

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    checkAuthentication={this.authenticate}
                    logoutCallback={this.logout}
                    isAuthenticated={this.state.isAuthenticated}
                    currentUser={this.state.currentUser}
                />
            );
        }
    };
}

function LoginAuthRequired({ checkAuthentication }) {
    login().then(result => {
        checkAuthentication();
    });
    return <Redirect to="/" />;
}

function LogoutAuthRequired({ logoutCallback }) {
    logout().then(result => {
        logoutCallback();
    });

    return <Redirect to="/" />;
}

export const Login = withRouter(withAuth(LoginAuthRequired));
export const Logout = withRouter(withAuth(LogoutAuthRequired));
