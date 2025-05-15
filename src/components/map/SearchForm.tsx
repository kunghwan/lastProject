"use client";

import React from "react";
import { IoSearch } from "react-icons/io5";

type SearchFormProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSearch: () => void;
  placeholder?: string;
};

const SearchForm = ({
  inputValue,
  setInputValue,
  handleSearch,
  placeholder = "원하는 장소를 입력하세요.",
}: SearchFormProps) => {
  return (
    <>
      <form
        className="group flex dark:text-white dark:bg-[#4B4B4B] bg-white rounded-full shadow-md p-2 outline-none border border-gray-300 focus-within:bg-primary "
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="p-1 text-sm focus:outline-none dark:placeholder:text-gray-200 placeholder:text-gray-500 w-55 focus:text-white focus:placeholder:text-white"
        />
        <button className="text-xl px-2">
          <IoSearch className="group-focus-within:text-white hover:scale-125 transition-transform duration-200" />
        </button>
      </form>
    </>
  );
};

export default SearchForm;
