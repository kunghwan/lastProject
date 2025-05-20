"use client";

import Header from "./Header";
import { PropsWithChildren } from "react";

const BodyLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="h-30 flex-none overflow-hidden ">
        <Header />
      </div>

      {/* Main 콘텐츠 영역: 남은 공간을 flex로 채우고, 세로 스크롤 가능, 가로 스크롤 숨김 */}
      <main
        className="flex-1 overflow-auto overflow-x-hidden pt-2
                     {/* 최대 화면 너비 1401px 이하일 때 적용되는 스타일 */}
                     max-[1401px]:max-h-[calc(100vh_-_120px_-_80px)] 
                     {/* 최대 화면 너비 1401px 이하일 때, 콘텐츠가 제한된 높이를 넘치면 세로 스크롤바 표시 */}
                     max-[1401px]:overflow-y-auto 
                     {/* 최대 화면 너비 1401px 이하일 때, 하단 패딩을 주어 스크롤바가 콘텐츠를 가리지 않도록 함 */}
                     max-[1401px]:pb-4"
      >
        <div className="max-w-300 mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default BodyLayout;
