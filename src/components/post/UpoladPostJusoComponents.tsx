import { Location } from "@/types/post";
import React, { useCallback, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

interface JusoProps {
  juso: Location;
  setJuso: (props: Location) => void;
  jusoRef: React.RefObject<HTMLInputElement | null>;
}

const JusoComponents = ({ juso, setJuso, jusoRef }: JusoProps) => {
  const [isJusoShowing, setIsJusoShowing] = useState(false);
  const [isJusoUlShowing, setIsJusoUlShowing] = useState(false);
  const [address, setAddress] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchAddress = useCallback(
    async (query: string) => {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
          },
        }
      );
      const data = await res.json();
      console.log(data, 79);
      setSearchResults(data.documents);
    },
    [searchResults]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-x-2 items-center">
        {juso.address.length > 0 && (
          <label className=" flex w-full border bg-emerald-100 p-2.5 rounded items-center  border-gray-400 dark:text-gray-900">
            <span>
              <IoLocationSharp className="text-2xl" />
            </span>
            {juso.address}
          </label>
        )}

        {isJusoShowing && (
          <div>
            <button
              type="button"
              onClick={() => {
                if (confirm("다시 검색하시겠습니까?")) {
                  setJuso({
                    latitude: 0,
                    longitude: 0,
                    address: "",
                  });
                  setSearchResults([]);
                  setAddress("");
                  return setIsJusoShowing(false);
                } else {
                  return alert("취소되었습니다.");
                }
              }}
              className={twMerge(
                "border border-gray-400 p-2.5 rounded bg-gray-100 flex-1 min-w-20 cursor-pointer"
              )}
            >
              다시검색
            </button>
          </div>
        )}
      </div>
      {!isJusoShowing && (
        <div>
          <div className="flex gap-x-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={twMerge("w-full ", input)}
              ref={jusoRef}
              placeholder="주소를 입력후 검색버튼을 눌러주세요."
            />
            <button
              type="button"
              onClick={() => {
                searchAddress(address);
                setIsJusoUlShowing(true);
                return setIsJusoShowing(true);
              }}
              className="flex justify-center items-center flex-1 rounded bg-[rgba(116,212,186)] min-w-20"
            >
              <IoIosSearch className="text-3xl font-bold" />
            </button>
          </div>
        </div>
      )}
      {isJusoUlShowing && (
        <ul className="mt-2 flex flex-col gap-y-2 bg-gray-50 border border-gray-400  rounded p-2.5 max-h-50 overflow-y-auto">
          {searchResults.map((item) => (
            <li
              key={item.id}
              className="cursor-pointer bg-white rounded gap-y-2.5 hover:underline border p-1.5 hover:text-green-800 "
              onClick={() => {
                setJuso({
                  address: item.address_name,
                  latitude: Number(item.y),
                  longitude: Number(item.x),
                });
                setSearchResults([]);
                setIsJusoUlShowing(false);
                return setAddress(item.address_name);
              }}
            >
              {item.address_name}
              {item.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JusoComponents;
const input = "bg-white border rounded px-2 py-2 border-gray-400";
