import { Location } from "@/types/post";
import React, { useCallback, useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import AlertModal from "../AlertModal";
import { IoRefreshOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { useAlertModal } from "../AlertStore";

interface JusoProps {
  juso: Location;
  setJuso: (props: Location) => void;
  jusoRef: React.RefObject<HTMLInputElement | null>;
  titleRef?: React.RefObject<HTMLInputElement | null>;
  setIsTypingTag: React.Dispatch<React.SetStateAction<boolean>>;
  submitButtonRef: React.RefObject<HTMLButtonElement | null>;
}

//juso를 저장하기 위해 kakao api를 사용함
export const searchAddress = async (query: string) => {
  try {
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

    return data.documents;
  } catch (error: any) {
    console.log(error.message, "주소 가져오기 실패");
    //! React Query에서 catch된 오류를 사용할 수 있도록 throw(현재 함수의 실행을 중단하고, 이 에러를 호출한 쪽으로 전달)
    throw new Error("주소 검색에 실패했습니다. 다시 시도해주세요.");
  }
};

const JusoComponents = ({
  juso,
  setJuso,
  jusoRef,
  setIsTypingTag,
  titleRef,
  submitButtonRef,
}: JusoProps) => {
  const [isJusoShowing, setIsJusoShowing] = useState(false);
  const [isJusoUlShowing, setIsJusoUlShowing] = useState(false);
  const [address, setAddress] = useState("");
  const { openAlert } = useAlertModal();

  //Todo: refetch가 실행되면 데이터 요청시작
  const {
    data: searchResults = [],
    refetch,
    error,
  } = useQuery({
    queryKey: ["kakaoSearch", address], //! address를 넣는이유 => 만약 없으면 어떤 주소를 검색하든 다 같은 키로 간주하기때문(이전 검색어의 캐시가 재사용 될 위험)
    queryFn: () => searchAddress(address),
    enabled: false, // 수동으로 실행 //컴포넌트가 처음 렌더링될 때 자동으로 요청하지 않음 => refetch로 실행
    //! 자동으로 가져오면 address(사용자가 주소를 한글자씩입력시) 값이 바뀔 때마다 자동 재실행(queryFn실행)=>비효율
    staleTime: 1000 * 60 * 5, //데이터를 신선하다고 판단할 시간 (캐시 유지 시간,같은 주소로 다시 검색하면 5분 동안은 캐시된 데이터 사용)
  });

  if (error || !searchResults) {
    return <h1>Error: {error?.message}</h1>;
  }

  return (
    <div className="hsecol gap-2">
      <div className="flex gap-x-2 items-center">
        {juso.address.length > 0 && (
          <label className="mt-8 bg-white  dark:bg-[#9d9d9d] flex w-full border-2 gap-x-2  border-emerald-800 dark:border-emerald-700 p-2.5 rounded items-center  dark:text-white">
            <span>
              <IoLocationSharp className="text-2xl dark:text-white hover:text-primary dark:hover:text-emerald-700  " />
            </span>
            {juso.address}
          </label>
        )}

        {isJusoShowing && (
          <div>
            <button
              type="button"
              onClick={() => {
                const targetRefs = [jusoRef];
                openAlert(
                  "다시 검색하시겠습니까?",
                  [
                    {
                      text: "확인",
                      isGreen: true,
                      autoFocus: true,
                      onClick: () => {
                        setJuso({
                          latitude: 0,
                          longitude: 0,
                          address: "",
                        });
                        setIsJusoUlShowing(false);
                        return setIsJusoShowing(false);
                      },
                      target: 0,
                    },
                    {
                      text: "취소",
                      isGreen: false,
                      autoFocus: false,
                    },
                  ],

                  "알림",
                  targetRefs
                );
                return;

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
                " p-2.5 min-h-12 flex justify-center items-center rounded-xl min-w-14 bg-primary dark:bg-[#6d9288]  hover:shadow-md dark:text-white w-auto  cursor-pointer whitespace-nowrap",
                juso.address.length > 0 && "mt-8"
              )}
            >
              <IoRefreshOutline className="text-2xl font-bold" />
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
            장소
          </label>
          <div className="flex ">
            <input
              type="text"
              id="jusos"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={twMerge(
                "w-full upPostInput shadow-sm border-r-0 dark:text-white rounded-r-none darkTextInput [@media(max-width:375px)]:placeholder:text-[0.75rem]"
              )}
              ref={jusoRef}
              placeholder="장소를 입력후 엔터를 눌러주세요."
              onKeyDown={(e) => {
                const { key } = e;
                if (!e.nativeEvent.isComposing && key === "Enter") {
                  if (address.trim() === "" || address.length === 0) {
                    const targetRefs = [jusoRef];
                    setTimeout(() => {
                      openAlert(
                        "장소를 입력해주세요.",
                        [
                          {
                            text: "확인",
                            isGreen: true,
                            autoFocus: true,
                            target: 0,
                          },
                        ],
                        "알림",
                        targetRefs
                      );
                    }, 0);
                    return;
                    //React에서 setState는 비동기로 처리되기 때문에, 렌더링이 끝나기 전까지 <AlertModal /> 조건부 렌더링이 반응하지 않을 수 있음 =>setTimeout(() => ...)으로 defer 처리하면 렌더링 큐가 정리된 뒤 실행되어 modal이 보장됨
                    // setTimeout(() => {
                    //   setModal({ message: "주소를 입력해 주세요." });
                    //   setFocusTarget("juso");
                    // }, 0);
                    // return;
                  }
                  refetch();

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
                  const targetRefs = [jusoRef];
                  openAlert(
                    "장소를 입력해주세요.",
                    [
                      {
                        text: "확인",
                        isGreen: true,
                        autoFocus: true,
                        target: 0,
                      },
                    ],
                    "알림",
                    targetRefs
                  );
                  return;
                }
                //searchAddress를 호출하여 주소를 검색(address를 인자로 넘겨서 검색 ㄱㄱ)
                //  searchAddress(address);
                refetch();
                setIsJusoUlShowing(true);
                return setIsJusoShowing(true);
              }}
              className="hover:bg-[rgba(116,212,186,0.7)] border border-gray-400  hover:shadow-md flex justify-center items-center flex-1 rounded-l-none rounded-r-md bg-primary min-w-20 dark:bg-[rgba(116,212,186,0.5)] dark:text-white"
            >
              <IoIosSearch className="text-3xl font-bold" />
            </button>
          </div>
        </div>
      )}
      {isJusoUlShowing && (
        <ul className="mt-2 hsecol gap-y-2 bg-gray-200 dark:bg-[#666666] border border-gray-400  rounded p-2.5 max-h-40 overflow-y-auto  ">
          {searchResults.length === 0 ? (
            <li>
              <p className="font-bold flex justify-center">
                검색결과가 없습니다.
              </p>
            </li>
          ) : (
            searchResults.map((item: any) => (
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
                  setIsJusoShowing(true);
                  setIsJusoUlShowing(false);
                  // setAddress를 클릭한 주소로 변경 다시 검색하기 위해 주소를 저장함
                  setAddress(item.address_name);
                  return submitButtonRef.current?.focus();
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
