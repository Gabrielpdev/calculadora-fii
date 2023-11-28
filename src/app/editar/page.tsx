"use client";
import { months } from "@/constants/months";
import { IData, IShowedData } from "@/types/data";
import { useEffect, useState, useRef } from "react";
import { v4 } from "uuid";
import Link from "next/link";
import { isBefore, isEqual } from "date-fns";
import { redirect } from "next/navigation";

export default function Editar() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [showDivider, setShowDivider] = useState(false);

  const [data, setData] = useState<IData[]>([]);
  const [showedData, setShowedData] = useState<IShowedData>({});

  const [dateOptions, setDateOptions] = useState<any>([]);
  const [dateSelected, setDateSelected] = useState<any>("Todos");

  const [productsOptions, setProductsOptions] = useState<any>([]);
  const [productsSelected, setProductsSelected] = useState<any>("Todos");

  const readJsonFile = async () => {
    try {
      const response = await fetch("/api/select");

      if (response.ok) {
        const data: IData[] = await response.json();
        setData(data);

        setDateOptionsOnSelect(data);
        setProductsOptionsOnSelect(data);

        const grouped = groupByMonths(data);
        setShowedData(grouped);
        // removeCreditDatas(data);
      } else {
        console.error("Failed to select JSON");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const setDateOptionsOnSelect = (data: IData[]) => {
    const uniqueMap = new Map();
    data.forEach((obj) => uniqueMap.set(obj["Data"], obj["Data"]));

    const uniqueArray = Array.from(uniqueMap.values());

    setDateOptions(uniqueArray);
  };

  const setProductsOptionsOnSelect = (data: IData[]) => {
    const uniqueMap = new Map();
    data.forEach((obj) => uniqueMap.set(obj["Produto"], obj["Produto"]));

    const uniqueArray = Array.from(uniqueMap.values());

    setProductsOptions(uniqueArray);
  };

  const groupByMonths = (data: IData[]) => {
    return data.reduce((acc, obj) => {
      const splinedDate = obj["Data"].split("/");

      const date = new Date(
        `${splinedDate[1]}-${splinedDate[0]}-${splinedDate[2]}`
      );

      const monthKey = `${months[date.getMonth()]}-${date.getFullYear()}`;

      acc[monthKey] = acc[monthKey] || [];
      acc[monthKey].push(obj);

      return acc;
    }, {} as IShowedData);
  };

  const execFilters = (dateSelected: any, productSelected: any) => {
    if (dateSelected === "Todos" && productSelected === "Todos") {
      const grouped = groupByMonths(data);
      setShowedData(grouped);

      return;
    }

    if (dateSelected !== "Todos" && productSelected === "Todos") {
      const dataToSelect = data.filter((item: any) => {
        const splinedDate = item["Data"].split("/");
        const splinedSelectedDate = dateSelected.split("/");

        const date = new Date(
          `${splinedDate[1]}-${splinedDate[0]}-${splinedDate[2]}`
        );
        const selectedDate = new Date(
          `${splinedSelectedDate[1]}-${splinedSelectedDate[0]}-${splinedSelectedDate[2]}`
        );

        return isEqual(date, selectedDate) || isBefore(date, selectedDate);
      });

      const grouped = groupByMonths(dataToSelect);
      setShowedData(grouped);

      return;
    }

    if (dateSelected === "Todos" && productSelected !== "Todos") {
      const dataToSelect = data.filter(
        (item: any) => item["Produto"].trim() === productSelected
      );

      const grouped = groupByMonths(dataToSelect);
      setShowedData(grouped);

      return;
    }

    const dataToSelect = data.filter((item: any) => {
      const splinedDate = item["Data"].split("/");
      const splinedSelectedDate = dateSelected.split("/");

      const date = new Date(
        `${splinedDate[1]}-${splinedDate[0]}-${splinedDate[2]}`
      );
      const selectedDate = new Date(
        `${splinedSelectedDate[1]}-${splinedSelectedDate[0]}-${splinedSelectedDate[2]}`
      );

      return (
        (isEqual(date, selectedDate) || isBefore(date, selectedDate)) &&
        item["Produto"].trim() === productSelected
      );
    });

    const grouped = groupByMonths(dataToSelect);
    setShowedData(grouped);
  };

  const handleUpdateFile = async () => {
    if (!inputRef.current?.value) {
      alert("Digite um valor para dividir");
      return;
    }

    if (productsSelected === "Todos") {
      alert("Selecione um produto");
      return;
    }

    try {
      const response = await fetch("/api/update", {
        method: "POST",
        body: JSON.stringify({
          date: dateSelected,
          product: productsSelected,
          divided: Number(inputRef.current?.value) || 1,
        }),
      });

      if (response.ok) {
        setProductsSelected("Todos");
        setDateSelected("Todos");

        const data: IData[] = await response.json();
        setData(data);
        // readJsonFile()

        const grouped = groupByMonths(data);
        setShowedData(grouped);
      } else {
        console.error("Failed to select JSON");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    execFilters(dateSelected, productsSelected);
  }, [productsSelected, dateSelected]);

  useEffect(() => {
    readJsonFile();
  }, []);

  useEffect(() => {
    const response = localStorage.getItem(
      process.env.NEXT_PUBLIC_LOCAL_KEY as string
    );

    if (!(response === "Success")) {
      return redirect("/");
    }
  }, []);

  return (
    <div>
      <div className="flex items-center gap-5 p-2 my-3 ">
        <Link
          className="m-2 rounded-full w-10 flex items-center justify-center font-bold bg-slate-100 text-black p-2 br-2"
          href="/"
        >
          {`<-`}
        </Link>

        <button
          className="w-36 rounded bg-blue-300 font-bold text-black p-2 br-2 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed "
          onClick={readJsonFile}
        >
          Atualizar
        </button>
        <button
          className="w-56 rounded font-bold bg-orange-300 text-black p-2 br-2 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed "
          onClick={() => setShowDivider(!showDivider)}
        >
          Aplicar Desdobramento
        </button>
      </div>

      <div className="flex items-end gap-5 px-2 my-3 ">
        <div className="flex flex-col">
          <label htmlFor="date">Data:</label>
          <select
            id="date"
            className="text-black"
            value={dateSelected}
            onChange={(e) => setDateSelected(e.target.value)}
          >
            <option className="text-black">Todos</option>
            {dateOptions?.map((item: any) => (
              <option className="text-black" key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="product">Produto:</label>
          <select
            id="product"
            className="text-black"
            value={productsSelected}
            onChange={(e) => setProductsSelected(e.target.value)}
          >
            <option className="text-black">Todos</option>
            {productsOptions?.map((item: any) => (
              <option className="text-black" key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {showDivider && (
          <>
            <div className="flex flex-col">
              <label htmlFor="desdobramento">Desdobramento: ( 1 : ?? )</label>
              <input
                id="desdobramento"
                className="text-black"
                ref={inputRef}
                type="number"
              />
            </div>

            <button
              className="rounded h-auto bg-green-200 font-bold text-black p-2 br-2 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed "
              onClick={handleUpdateFile}
            >
              Aplicar Desdobramento nos dados mostrados
            </button>
          </>
        )}
      </div>

      <div className="bg-slate-800 sticky top-0 left-0 right-0 border">
        <div className="grid grid-cols-9 text-center">
          <span className="flex items-center justify-center border-r-2">
            {" "}
            Entrada/Saída
          </span>
          <span className="flex items-center justify-center border-r-2">
            {" "}
            Data
          </span>
          <span className="flex items-center justify-center border-r-2 col-span-4">
            Produto
          </span>
          <span className="flex items-center justify-center border-r-2">
            {" "}
            Quantidade
          </span>
          <span className="flex items-center justify-center border-r-2">
            {" "}
            Preço unitário
          </span>
          <span className="flex items-center justify-center border-r-2">
            {" "}
            Valor da Operação
          </span>
        </div>
      </div>

      {Object.entries(showedData)?.map(([key, month]) => (
        <div key={v4()}>
          <hr />
          <div className="flex items-center justify-center">
            <h2 className="text-4xl text-center ">{key}</h2>
          </div>
          <hr />
          {month.map((item) => (
            <div
              className={`${
                item["Entrada/Saída"] === "Credito"
                  ? "text-green-300"
                  : "text-red-300"
              }
                grid grid-cols-9 text-center border-b border-dashed border-gray-700  last-of-type:border-solid last-of-type:border-b-2 last-of-type:border-white`}
              key={v4()}
            >
              <span className="border-r-2">{item["Entrada/Saída"]}</span>
              <span className="border-r-2">{item["Data"]}</span>
              <span className="col-span-4 text-left pl-1 border-white border-solid border-r-2">
                {item["Produto"]}
              </span>
              <span className="border-r-2">{item["Quantidade"]}</span>
              <span className="border-r-2">{item["Preço unitário"]}</span>
              <span className="border-r-2">{item["Valor da Operação"]}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
