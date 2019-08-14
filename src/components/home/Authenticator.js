import React from "react";
import { Redirect, withRouter } from "react-router-dom";

import { getCurrentUser, login, logout } from "../../api";

export default function withAuth(WrappedComponent) {
    return class Authenticator extends React.Component {
        currentUser = () => {
            getCurrentUser().then(result => {
                return result;
            });

            return {};
        };

        isAuthenticated = () => {
            const currUser = this.currentUser();
            const isAuthenticated = !!currUser["id"];

            const unauthenticatedMsg = "User is unauthenticated";
            const authMsg = isAuthenticated
                ? `Authenticated as user ${currUser["id"]} - ${
                      currUser["first_name"]
                  }`
                : unauthenticatedMsg;
            console.log(authMsg);

            return isAuthenticated;
        };

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    isAuthenticated={this.isAuthenticated()}
                    currUser={this.currentUser()}
                />
            );
        }
    };
}

function LoginAuthRequired() {
    login().then(result => {
        console.log("Login result ", result);
        return <Redirect to="/" />;
    });

    return null;
}

function LogoutAuthRequired() {
    logout().then(result => {
        console.log("Logout result ", result);
        return <Redirect to="/" />;
    });

    return null;
}

export const Login = withRouter(LoginAuthRequired);
export const Logout = withRouter(LogoutAuthRequired);
