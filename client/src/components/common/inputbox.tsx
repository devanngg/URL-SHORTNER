import React from "react"
import { cn } from "@/lib/utils"

interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const InputBox = ({ className, ...props }: InputBoxProps) => {
  return (
    <div className="relative max-w-4xl max-w-3xl">
      <input
        className={cn(
        //   "w-full bg-white text-black border-5 border-black p-3 font-base outline-none shadow-shadow transition-all focus:translate-x-boxShadowX focus:translate-y-boxShadowY focus:shadow-none placeholder:text-gray-500",
          className,
        )}
        {...props}
      />
    </div>
  )
}

