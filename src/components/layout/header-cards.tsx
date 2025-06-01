"use client";
import { useContext } from "react";
import Card from "../elements/cards";
import { useParams, usePathname, useRouter } from "next/navigation";
import { CurrencyContext } from "@/providers/currency";

export default function HeaderDescription() {
  const path = usePathname();
  const params = useParams();
  const { back } = useRouter();

  const { value } = useContext(CurrencyContext);

  if (path === "/")
    return (
      <div className="flex max-w-6xl w-full gap-11 mt-16">
        <Card title="Entradas" value={value.in} type="in" />
        <Card title="Saidas" value={value.out} type="out" />
      </div>
    );

  if (path === "/categorias")
    return (
      <h2 className="flex items-center justify-center gap-2 text-4xl mb-5 text-white font-extrabold capitalize">
        <button onClick={back}>{`<`}</button>
        {path.replace("/", "")}
      </h2>
    );

  if (path.includes(params.categoryName as string))
    return (
      <h2 className="flex items-center justify-center gap-2 text-4xl mb-5 text-white font-extrabold capitalize">
        <button onClick={back}>{`<`}</button>
        {params.categoryName}
      </h2>
    );
}
