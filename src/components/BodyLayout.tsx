"use client";

import Navbar from "./features/navber/Navbar";
import Header from "./Header";
import { PropsWithChildren } from "react";

const BodyLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="h-[13vh] flex-none overflow-hidden">
        <Header />
      </div>

      <main className="flex-1 overflow-auto overflow-x-hidden max-[1401px]:max-h-[calc(100vh_-_13vh_-_9vh)] max-[1401px]:overflow-y-auto max-[1401px]:pb-4">
        <div className="max-w-300 mx-auto">{children}</div>
      </main>

      <Navbar />
    </div>
  );
};

export default BodyLayout;
