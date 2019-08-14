import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter as Router } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

import { Login, Logout } from "./components/home/Authenticator";

import App from "./components/home/App";
import Navbar from "./components/home/Navbar";
import Footer from "./components/home/Footer";

// Bootstrap dependencies
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./css/index.css";

const router = (
    <Router basename="/">
        <Navbar />
        <Route exact path="/" component={App} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/logout" component={Logout} />
        <Footer />
    </Router>
);

ReactDOM.render(router, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
