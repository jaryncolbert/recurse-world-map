import React from "react";

export default function PersonPhoto({ imageUrl, personName }) {
    return imageUrl ? (
      <div className="profile-photo">
        <img src={imageUrl} alt={personName + " photo"} />
      </div>
    ) : null;
}