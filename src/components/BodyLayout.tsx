"use client";

import Navbar from "@/components/features/navber/Navbar";
import Header from "./Header";
import { PropsWithChildren } from "react";

const BodyLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="w-full h-0.5 bg-teal-100 mx-auto" />

      <Header />
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default BodyLayout;
