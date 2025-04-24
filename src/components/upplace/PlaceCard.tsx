// components/PlaceCard.tsx

import React from "react";

interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
}

const PlaceCard: React.FC<{ place: Place }> = ({ place }) => {
  return (
    <div className="border p-4 rounded-lg shadow">
      <img
        src={place.firstimage || "/placeholder.jpg"}
        alt={place.title}
        className="w-full h-48 object-cover rounded"
      />
      <h2 className="text-lg font-bold mt-2">{place.title}</h2>
      <p className="text-sm text-gray-600">{place.addr1}</p>
    </div>
  );
};

export default PlaceCard;
