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

        componentDidMount() {
            console.log("Authenticator Mounted");
            this.authenticate();
        }

        componentDidUpdate() {
            console.log("Authenticator Updated");
            this.authenticate();
        }

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    isAuthenticated={this.state.isAuthenticated}
                    currUser={this.state.currentUser}
                />
            );
        }
    };
}

function LoginAuthRequired() {
    login().then(result => {
        if (result && result["id"]) {
            this.setState({
                isAuthenticated: true,
                currentUser: result
            });
        }

        return <Redirect to="/" />;
    });

    return null;
}

function LogoutAuthRequired() {
    logout().then(result => {
        this.setState({
            isAuthenticated: false,
            currentUser: {}
        });

        return <Redirect to="/" />;
    });

    return null;
}

export const Login = withRouter(LoginAuthRequired);
export const Logout = withRouter(LogoutAuthRequired);
