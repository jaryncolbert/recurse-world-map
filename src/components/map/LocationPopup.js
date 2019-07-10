import React from "react";
import { Popup } from "react-leaflet";

import "../../css/popup.css";

/* LocationPopup renders the list of affiliated people with a link to their
 * directory entries
 */
export default function LocationPopup({ locationName, people, hasPeople }) {
    return (
        <Popup key={locationName} maxHeight="200">
            <div className="location-popup">
                <p className="location-name">{locationName}</p>

                {hasPeople ? <PeopleData people={people} /> : <NoPeople />}
            </div>
        </Popup>
    );
}

function PeopleData({ people }) {
    return (
        <div className="person-data">
            {people ? <People people={people} /> : <UnspecifiedPeople />}
        </div>
    );
}

function NoPeople() {
    return (
        <span className="empty-person-list">
            There are currently no RCers at this location.
        </span>
    );
}

function UnspecifiedPeople() {
    return (
        <span className="unspecified-people">
            There are RCers at this location. Login for more information!
        </span>
    );
}

function People({ people }) {
    const population = people.length;
    const recursers = population === 1 ? "Recurser" : "Recursers";

    return (
        <>
            <p className="location-stats">{population + " " + recursers}</p>
            <ul className="person-list">
                {people.map(p => (
                    <Person key={p["person_id"]} person={p} />
                ))}
            </ul>
        </>
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
