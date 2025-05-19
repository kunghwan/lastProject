import { InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface LoginInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const LoginInput = forwardRef<HTMLInputElement, LoginInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={twMerge(
          "focus:border-primary focus:outline-none dark:bg-[#666666]rounded-lg min-h-14 px-2 py-2 bg-gray-50 w-90 placeholder:text-gray-500 lg:w-120 md:placeholder:text-sm dark:placeholder:text-white shadow-sm dark:text-white border border-gray-400",
          className
        )}
        {...props}
      />
    );
  }
);

LoginInput.displayName = "LoginInput";
export default LoginInput;
