import React from "react";
import { Redirect, withRouter } from "react-router-dom";

import { getCurrentUser, login, logout } from "../../api";

export default function withAuth(WrappedComponent) {
    return class Authenticator extends React.Component {
        currentUser = () => {
            let user = {};

            getCurrentUser().then(result => {
                user = result;
            });

            console.log(
                "Current user: ",
                user,
                " Authenticated: ",
                !!user["first_name"]
            );
            return user;
        };

        isAuthenticated = () => {
            const currUser = this.currentUser();
            const isAuthenticated = !!currUser["first_name"];

            const authMsg = isAuthenticated
                ? `Authenticated as user ${currUser["id"]} - ${
                      currUser["first_name"]
                  }`
                : "User is unauthenticated";
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
