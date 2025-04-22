"use client";

import { useState } from "react";

interface User {
  uid: string;
  email: string;
  password: string;
  name: string;
  tel: string; //
  birth: string; //
  agreeLocation: boolean;
}

const InfoAccount = [
  { label: "이름", name: "name", type: "text" },
  { label: "이메일", name: "email", type: "email" },
  { label: "비밀번호", name: "password", type: "password" },
  { label: "생년월일", name: "birth", type: "text" },
  { label: "전화번호", name: "tel", type: "text" },
  { label: "위치정보 동의", name: "agreeLocation", type: "checkbox" },
];

const Signup = () => {
  const [user, setUser] = useState<User>({
    name: "유경환",
    email: "ysw03031@naver.com",
    password: "123123",
    uid: "",
    birth: "20010923",
    tel: "01058772136",
    agreeLocation: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="rounded-2xl h-screen flex flex-col justify-center items-center px-4 min-h-screen">
      <div className="border w-full border-teal-300 rounded-lg max-w-md bg-white divide-y">
        {InfoAccount.map((info, index) => (
          <div key={index} className="flex items-center p-4 border-teal-300">
            <label htmlFor={info.name} className="w-32 text-gray-700">
              {info.label}
            </label>
            <input
              id={info.name}
              name={info.name}
              type={info.type}
              value={
                info.type === "checkbox"
                  ? undefined
                  : (user[info.name as keyof User] as string)
              }
              checked={
                info.type === "checkbox" ? user.agreeLocation : undefined
              }
              onChange={handleChange}
              className=" p-2 flex-1 rounded"
            />
          </div>
        ))}
      </div>
      <button className="mt-10 bg-green-500 w-110 p-5 text-white font-bold rounded">
        가입
      </button>
    </div>
  );
};

export default Signup;
