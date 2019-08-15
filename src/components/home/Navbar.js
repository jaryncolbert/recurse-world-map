import React from "react";
import { Link } from "react-router-dom";

import withAuth from "./Authenticator";

import MapIcon from "../../assets/map-icon-192x192.png";

export default function Navbar() {
    return (
        <nav className="navbar navbar-light navbar-expand-sm justify-content-sm-between">
            <NavBrand />
            <CollapsedNavButton />
            <CollapsedNav />
        </nav>
    );
}

function CollapsedNav() {
    return (
        <div className="nav-separator">
            <div className="collapse navbar-collapse" id="navbar-top">
                <NavList />
            </div>
        </div>
    );
}

function NavList() {
    return (
        <div className="nav-separator">
            <div className="collapse navbar-collapse" id="navbar-top">
                <ul className="navbar-nav mt-2 mt-lg-0">
                    <AuthButton />
                </ul>
            </div>
        </div>
    );
}

function NavListItem({ path, text }) {
    return (
        <li
            className="nav-item"
            data-toggle="collapse"
            data-target=".navbar-collapse.show">
            <Link to={path} className="nav-link">
                {text}
            </Link>
        </li>
    );
}

function CollapsedNavButton() {
    return (
        <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbar-top"
            aria-controls="navbar-top"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
        </button>
    );
}

function NavBrand() {
    return (
        <Link to="/" className="navbar-brand">
            <img src={MapIcon} alt="RC Map Icon" />
            World of Recurse Map
        </Link>
    );
}

function AuthButtonAuthRequired({ isAuthenticated, currentUser }) {
    const greeting =
        currentUser && currentUser["first_name"]
            ? `Hi, ${currentUser["first_name"]}`
            : "";
    const text = isAuthenticated ? `${greeting} Logout` : "Login";
    const path = isAuthenticated ? "/logout" : "/login";

    return <NavListItem path={path} text={text} />;
}

const AuthButton = withAuth(AuthButtonAuthRequired);
