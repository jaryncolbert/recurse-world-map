import React from "react";
import { Popup } from "react-leaflet";

/* LocationPopup renders the list of affiliated people with a link to their
 * directory entries
 */
export default function LocationPopup({ locationName, people }) {
    const population = people.length;
    const recursers = population > 1 ? "Recursers" : "Recurser";

    return (
        <Popup key={locationName} maxHeight="200">
            <div className="location-popup">
                <p className="location_name">{locationName}</p>
                <p className="location_stats">{population + " " + recursers}</p>
                <PeopleData people={people} />
            </div>
        </Popup>
    );
}

function PeopleData({ people }) {
    return (
        <ul className="person_list">
            {people.map(p => (
                <Person key={p["person_id"]} person={p} />
            ))}
        </ul>
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
