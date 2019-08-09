import React from "react";
import ReactDOM from "react-dom";
import { Route, Link, HashRouter as Router } from "react-router-dom";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";
import MapIcon from "./assets/map-icon-192x192.png";
import Footer from "./components/Footer";

// Bootstrap dependencies
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./css/index.css";

const router = (
    <Router basename="/">
        <nav className="navbar navbar-light navbar-expand-sm justify-content-sm-between">
            <Link to="/" className="navbar-brand">
                <img src={MapIcon} alt="RC Map Icon" />
                World of Recurse Map
            </Link>

            <div className="nav-separator">
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
                <div className="collapse navbar-collapse" id="navbar-top">
                    <ul className="navbar-nav mt-2 mt-lg-0">
                        <NavListItem path="/login" text="Login" />
                    </ul>
                </div>
            </div>
        </nav>

        <Route exact path="/" component={App} />

        <Footer />
    </Router>
);

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

ReactDOM.render(router, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
