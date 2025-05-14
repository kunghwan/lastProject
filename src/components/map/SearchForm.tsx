"use client";

import React from "react";
import { IoSearch } from "react-icons/io5";

type SearchFormProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSearch: () => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
};

const SearchForm = ({
  inputValue,
  setInputValue,
  handleSearch,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  placeholder = "원하는 장소를 입력하세요.",
}: SearchFormProps) => {
  return (
    <>
      <form
        className={`flex  bg-white rounded-full shadow-md p-2 outline-none border border-gray-300 focus-within:border-green-500 transition${className}`}
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className={`p-1 text-sm focus:outline-none dark:placeholder:text-gray-200 placeholder:text-gray-500  ${inputClassName}`}
        />
        <button
          type="submit"
          className={`text-xl px-2 cursor-pointer hover:text-green-500 ${buttonClassName}`}
        >
          <IoSearch />
        </button>
      </form>
    </>
  );
};

export default SearchForm;
