"use client";
import { useState, useEffect, useRef, RefObject } from "react";
import * as Icons from "react-icons/pi";

import { LOCAL_STORAGE_KEY } from "@/constants/keys";
import { Loading } from "@/components/loading";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import { ICategory } from "@/types/data";

interface CategoryProps {
  isEditing: string;
  category: ICategory;
  inputNameRef: RefObject<HTMLInputElement>;
  inputIconRef: RefObject<HTMLInputElement>;
  className?: string;
}

export default function ListItem({
  isEditing,
  category,
  inputIconRef,
  inputNameRef,
  className,
}: CategoryProps) {
  const { push } = useRouter();

  // const inputNameRef = useRef<HTMLInputElement>(null);
  // const inputIconRef = useRef<HTMLInputElement>(null);

  const handleSelectCategory = (category: string) => {
    push(`/categorias/${category.toLocaleLowerCase()}`);
  };

  if (isEditing === category.id) {
    return (
      <div
        className={`grid grid-cols-10 text-center bg-white p-5 rounded-md w-full ${className}`}
      >
        <input
          ref={inputNameRef}
          defaultValue={category.name}
          className={`w-full flex capitalize col-span-9 border-r-2 text-blue-950`}
        />
        <input
          ref={inputIconRef}
          defaultValue={category.icon}
          className={`w-full flex items-center capitalize justify-center border-r-2 text-blue-950`}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => handleSelectCategory(category.name)}
      className={`grid grid-cols-10 text-center bg-white p-5 rounded-md w-full ${className}`}
    >
      <span
        className={`w-full flex capitalize col-span-9 border-r-2 text-blue-950`}
      >
        {category.name}
      </span>
      <span
        className={`w-full flex items-center capitalize justify-center border-r-2 text-blue-950`}
      >
        {(() => {
          const IconComponent = Icons[category.icon as keyof typeof Icons];
          return IconComponent ? <IconComponent /> : null;
        })()}
      </span>
    </button>
  );
}
