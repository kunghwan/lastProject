"use client";

import Navbar from "@/components/features/navber/Navbar";
import Header from "./Header";
import { PropsWithChildren } from "react";

const BodyLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />

      <main
      // className="flex-1 overflow-y-auto"
      >
        <Navbar />
        {children}
      </main>
    </>
  );
};

export default BodyLayout;
