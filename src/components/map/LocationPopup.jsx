import React from "react";
import { Popup } from "react-leaflet";
import MapPerson from "../person_info/MapPerson";

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
          <MapPerson key={p["person_id"]} person={p} />
        ))}
      </>
    );
  }
