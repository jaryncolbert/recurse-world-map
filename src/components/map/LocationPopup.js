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
        href={"https://www.recurse.com/directory/" + person["person_id"]}
        target="_blank"
        rel="noopener noreferrer">
        {person["name"]}
      </a>

      <StintInfo stints={person["stints"]} />
    </li>
  );
}

function StintInfo({ stints }) {
  let stint_info = new Set(stints.map(s => stintToString(s)));

  if (stint_info) {
    stint_info = ` (${stintListToString([...stint_info])})`;
  }

  return <span className="stint-info">{stint_info}</span>;
}

/* For a list with at least two elements, return comma-separated
 * head elements with ampersand separating last two elements,
 * e.g. 1: 'A', 2: 'A & B', 3: 'A, B & C', 4: 'A, B, C & D', etc.
 */
const stintListToString = list => {
  if (!list || list.length === 0) return "";

  if (list.length === 1) return list[0];

  let result = "";
  for (let i = 0; i < list.length; i++) {
    if (i === list.length - 1) {
      result += " & ";
    }

    result += list[i];

    if (i < list.length - 2) {
      result += ", ";
    }
  }

  return result;
};

const stintToString = stint => {
  let type = stint["stint_type"];

  if (!type) {
    return "";
  }

  switch (type) {
    case "retreat":
      return stint["batch_name"];
    case "residency":
      type = "Resident";
      break;
    case "employment":
      type = stint["rc_title"] || "Staff";
      break;
    case "experimental":
      type = "Exp. Batch";
      break;
    case "research_fellowship":
      type = "Fellow";
      break;
    case "facilitatorship":
      type = "Facilitator";
      break;
    default:
      type = type.charAt(0).toUpperCase() + type.slice(1);
  }

  return type;
};
