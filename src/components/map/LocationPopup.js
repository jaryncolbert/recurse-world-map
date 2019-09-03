import React from "react";
import { Popup } from "react-leaflet";

import "../../css/popup.css";

/* LocationPopup renders the list of affiliated people with a link to their
 * directory entries
 */
export default function LocationPopup({ location }) {
  const locationName = location["location_name"];
  const people = location["person_list"] || [];

  return (
    <Popup key={location["location_id"]} maxHeight="200">
      <>
        <div className="location-popup">
          <p className="location-name">{locationName}</p>
        </div>

        {location["type"] === "country" ? (
          <Country
            totalPopulation={location["total_population"]}
            cityCount={location["city_count"]}
            people={people}
            locationName={locationName}
          />
        ) : (
          <City hasPeople={location["has_rc_people"]} people={people} />
        )}
      </>
    </Popup>
  );
}

function Country(props) {
  return props.totalPopulation > 0 ? (
    <>
      <CountryStats {...props} />
      <PeopleData people={props.people} />
    </>
  ) : (
    <NoPeople />
  );
}

function CountryStats({ totalPopulation, cityCount, people, locationName }) {
  const recursers = totalPopulation === 1 ? "Recurser" : "Recursers";
  let stats = [];
  let stat = `${totalPopulation} total ${recursers}`;

  if (cityCount === 1) {
    stat += ` in 1 city.`;
  } else if (cityCount > 0) {
    stat += ` across ${cityCount} cities.`;
  } else {
    stat += ` in ${locationName}.`;
  }

  stats.push(
    <a
      key="1"
      href={`https://www.recurse.com/directory?location=${locationName}`}
      target="_blank"
      rel="noopener noreferrer"
      className="rc-country-search">
      {stat}
    </a>
  );

  if (people.length > 0 && people.length !== totalPopulation) {
    stats.push(
      <div key="2">
        {`Of those, ${people.length} specifically set their location to ${locationName}.`}
      </div>
    );
  }

  return <div className="location-stats">{stats}</div>;
}

function City({ hasPeople, people }) {
  return hasPeople ? (
    <>
      <CityStats people={people} />
      <PeopleData people={people} />
    </>
  ) : (
    <NoPeople />
  );
}

function CityStats({ people }) {
  const population = people.length;
  const recursers = population === 1 ? "Recurser" : "Recursers";
  return <p className="location-stats">{population + " " + recursers}</p>;
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
  return (
    <>
      {people.map(p => (
        <Person key={p["person_id"]} person={p} />
      ))}
    </>
  );
}

function Person({ person }) {
  return (
    <a
      className="person-link"
      href={"https://www.recurse.com/directory/" + person["person_id"]}
      target="_blank"
      rel="noopener noreferrer">
      <Photo imageUrl={person["image_url"]} personName={person["name"]} />
      <div className="person-info">
        <span className="person-name">{person["name"]}</span>
        <StintInfo stints={person["stints"]} />
      </div>
    </a>
  );
}

function Photo({ imageUrl, personName }) {
  return imageUrl ? (
    <div className="profile-photo">
      <img src={imageUrl} alt={personName + " photo"} />
    </div>
  ) : null;
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
