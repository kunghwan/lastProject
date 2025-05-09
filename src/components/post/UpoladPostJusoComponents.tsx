import { Location } from "@/types/post";
import React, { useCallback, useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import AlertModal from "../AlertModal";

interface JusoProps {
  juso: Location;
  setJuso: (props: Location) => void;
  jusoRef: React.RefObject<HTMLInputElement | null>;
  titleRef: React.RefObject<HTMLInputElement | null>;
  setIsTypingTag: React.Dispatch<React.SetStateAction<boolean>>;
}

const JusoComponents = ({
  juso,
  setJuso,
  jusoRef,
  setIsTypingTag,
  titleRef,
}: JusoProps) => {
  const [isJusoShowing, setIsJusoShowing] = useState(false);
  const [isJusoUlShowing, setIsJusoUlShowing] = useState(false);
  const [address, setAddress] = useState("");

  const [focusTarget, setFocusTarget] = useState<"juso" | null>(null);
  //주소를 검색하기 위해서 주소를 저장하는 state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  //juso를 저장하기 위해 kakao api를 사용함
  const searchAddress = useCallback(async (query: string) => {
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
    // 검색 결과를 state에 저장함

    setSearchResults(data.documents);
  }, []);

  // 알림 모달 상태
  const [modal, setModal] = useState<{
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  useEffect(() => {
    if (!modal?.message && focusTarget === "juso") {
      setTimeout(() => {
        jusoRef.current?.focus(); //  포커스 부여
        setFocusTarget(null); // 포커스 완료 후 초기화
      }, 0);
    }
  }, [modal?.message, focusTarget]);

  return (
    <div className="hsecol gap-2">
      {modal && (
        <AlertModal
          message={modal.message}
          onClose={() => {
            setModal(null);
            return setFocusTarget("juso");
          }}
          onConfirm={() => {
            modal.onConfirm?.();
            setModal(null);
          }}
          showCancel={true}
        />
      )}
      <div className="flex gap-x-2 items-center">
        {juso.address.length > 0 && (
          <label className="mt-8 border-gray-200 flex w-full border bg-emerald-100 p-2.5 rounded items-center  dark:text-gray-900">
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
                //다시 juso를  검색하기 위해서 초기화및 인풋창 다시 보여주기
                setModal({
                  message: "다시 검색하겠습니까?",
                  onConfirm() {
                    setJuso({
                      latitude: 0,
                      longitude: 0,
                      address: "",
                    });
                    setSearchResults([]);
                    setIsJusoUlShowing(false);
                    setIsJusoShowing(false);
                    return jusoRef.current?.focus();
                  },
                });

                // if (confirm("다시 검색하시겠습니까?")) {
                //   setJuso({
                //     latitude: 0,
                //     longitude: 0,
                //     address: "",
                //   });
                //   setSearchResults([]);
                //   setIsJusoUlShowing(false);
                //   setIsJusoShowing(false);
                //   return jusoRef.current?.focus();
                // }
              }}
              className={twMerge(
                "  p-2.5 rounded bg-[#a4d9cb] dark:bg-[#6d9288]  hover:shadow-md dark:text-white w-auto min-w-20 cursor-pointer whitespace-nowrap",
                juso.address.length > 0 && "mt-8"
              )}
            >
              다시검색
            </button>
          </div>
        )}
      </div>
      {!isJusoShowing && (
        <div>
          <label
            htmlFor="jusos"
            className="font-bold text-md text-gray-500 dark:text-white"
          >
            주소
          </label>
          <div className="flex gap-x-2">
            <input
              type="text"
              id="jusos"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={twMerge("w-full upPostInput ")}
              ref={jusoRef}
              placeholder="주소를 입력후 검색버튼을 눌러주세요."
              onKeyDown={(e) => {
                const { key } = e;
                if (!e.nativeEvent.isComposing && key === "Enter") {
                  if (address.trim() === "" || address.length === 0) {
                    //React에서 setState는 비동기로 처리되기 때문에, 렌더링이 끝나기 전까지 <AlertModal /> 조건부 렌더링이 반응하지 않을 수 있음 =>setTimeout(() => ...)으로 defer 처리하면 렌더링 큐가 정리된 뒤 실행되어 modal이 보장됨
                    setTimeout(() => {
                      setModal({ message: "주소를 입력해 주세요." });
                      setFocusTarget("juso");
                    }, 0);
                    return;
                  }
                  searchAddress(address);
                  setIsJusoUlShowing(true);
                  setIsJusoShowing(true);
                }
              }}
              onFocus={() => setIsTypingTag(true)}
              onBlur={() => setIsTypingTag(false)}
            />
            <button
              type="button"
              onClick={() => {
                if (address.length === 0 || address.trim() === "") {
                  return setModal({ message: "주소를 입력해 주세요." });
                }
                //searchAddress를 호출하여 주소를 검색(address를 인자로 넘겨서 검색 ㄱㄱ)
                searchAddress(address);
                setIsJusoUlShowing(true);
                return setIsJusoShowing(true);
              }}
              className="  hover:shadow-md flex justify-center items-center flex-1 rounded bg-[rgba(116,212,186)] min-w-20 dark:bg-[rgba(116,212,186,0.5)] dark:text-white"
            >
              <IoIosSearch className="text-3xl font-bold" />
            </button>
          </div>
        </div>
      )}
      {isJusoUlShowing && (
        <ul className="mt-2 hsecol gap-y-2 bg-green-50 dark:bg-green-50/80 border border-gray-400  rounded p-2.5 max-h-50 overflow-y-auto">
          {searchResults.length === 0 ? (
            <li>
              <p className="font-bold flex justify-center">
                검색결과가 없습니다.
              </p>
            </li>
          ) : (
            searchResults.map((item) => (
              <li
                key={item.id}
                className="cursor-pointer bg-white rounded gap-y-2.5 hover:underline border p-1.5 hover:text-green-800 "
                onMouseDown={() => setIsTypingTag(false)} // 추가
                onClick={() => {
                  //주소를 클릭시 address를 juso에 저장하고 latitude와 longitude를 number로 변환하여 저장
                  setJuso({
                    address: item.address_name,
                    latitude: Number(item.y),
                    longitude: Number(item.x),
                  });
                  setIsTypingTag(false); //추가로 포커싱 해제
                  //주소를 클릭시 검색결과를 초기화
                  setSearchResults([]);
                  setIsJusoUlShowing(false);
                  // setAddress를 클릭한 주소로 변경 다시 검색하기 위해 주소를 저장함
                  setAddress(item.address_name);
                  return titleRef.current?.focus();
                }}
              >
                {item.address_name}
                {item.place_name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default JusoComponents;
