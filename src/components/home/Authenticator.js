import React from "react";

import { getCurrentUser } from "../../api";

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
