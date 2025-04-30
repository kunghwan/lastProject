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
        className={`flex bg-white rounded-full shadow-md p-2 border border-gray-300 ${className}`}
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className={`p-1 text-sm focus:outline-none placeholder:text-gray-500 ${inputClassName}`}
        />
        <button
          type="submit"
          className={`text-xl px-2 cursor-pointer ${buttonClassName}`}
        >
          <IoSearch />
        </button>
      </form>
    </>
  );
};

export default SearchForm;
