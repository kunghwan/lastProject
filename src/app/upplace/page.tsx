"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PlaceCard from "../../components/upplace/PlaceCard";

interface Place {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
}

const UpPlace = () => {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await axios.get("/api/recommend");
        setPlaces(res.data);
      } catch (err) {
        console.error("추천 장소 불러오기 실패", err);
      }
    };

    fetchPlaces();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {places.map((place) => (
        <PlaceCard key={place.contentid} place={place} />
      ))}
    </div>
  );
};

export default UpPlace;
