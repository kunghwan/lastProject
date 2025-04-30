"use client";

import Header from "./Header";
import { PropsWithChildren } from "react";

const BodyLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <main className="pb-[10vh] overflow-hidden">{children}</main>
    </>
  );
};

export default BodyLayout;
