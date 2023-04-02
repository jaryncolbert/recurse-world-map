import React from "react";
import { Link } from "react-router-dom";

import MapIcon from "../../assets/map-icon-192x192.png";
import Search from "../search/Search";
import AuthenticatedPerson from "../person_info/AuthenticatedPerson";

export default function Navbar({ currentUser, ...props }) {
  return (
    <nav className="navbar navbar-light navbar-expand">
      <Link to="/" className="navbar-brand">
        <img src={MapIcon} alt="RC Map Icon" />
        <span className="text-collapsible d-none d-md-inline">
          World of Recurse
        </span>
      </Link>
      <Search {...props} />
      <AuthenticatedPerson person={currentUser} />
    </nav>
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
