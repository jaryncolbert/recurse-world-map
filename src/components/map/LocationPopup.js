import React from "react";
import { Popup } from "react-leaflet";

import "../../css/popup.css";

/* LocationPopup renders the list of affiliated people with a link to their
 * directory entries
 */
export default function LocationPopup({ locationName, people }) {
    const population = people.length;
    const recursers = population === 1 ? "Recurser" : "Recursers";

    return (
        <Popup key={locationName} maxHeight="200">
            <div className="location-popup">
                <p className="location-name">{locationName}</p>
                <p className="location-stats">{population + " " + recursers}</p>

                {population === 0 ? (
                    <NoPeople />
                ) : (
                    <PeopleData people={people} />
                )}
            </div>
        </Popup>
    );
}

function PeopleData({ people }) {
    return (
        <div className="person-data">
            <ul className="person-list">
                {people.map(p => (
                    <Person key={p["person_id"]} person={p} />
                ))}
            </ul>
        </div>
    );
}

function NoPeople() {
    return (
        <span className="empty-person-list">
            No RCers are currently in this location.
        </span>
    );
}

function Person({ person }) {
    return (
        <li>
            <a
                href={
                    "https://www.recurse.com/directory/" + person["person_id"]
                }
                target="_blank"
                rel="noopener noreferrer">
                {[person["first_name"], person["last_name"]].join(" ")}
            </a>
        </li>
    );
}
