"use client";
import { useState, createContext } from "react";

import { ICurrencyContext } from "@/types/data";

export const CurrencyContext = createContext({} as ICurrencyContext);

export default function CurrencyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [value, setValue] = useState({
    in: "",
    out: "",
  });

  return (
    <CurrencyContext.Provider
      value={{
        setValue,
        value,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
