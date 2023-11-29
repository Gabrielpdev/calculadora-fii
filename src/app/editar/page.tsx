"use client";
import { months } from "@/constants/months";
import { IData, IShowedData } from "@/types/data";
import { useEffect, useState, useRef, useContext } from "react";
import { v4 } from "uuid";
import Link from "next/link";
import { isBefore, isEqual } from "date-fns";
import { getData } from "@/service/getData";
import { UserContext } from "@/providers/firebase";
import { updateData } from "@/service/updateData";
import { Loading } from "@/components/loading";

export default function Editar() {
  const { user } = useContext(UserContext);

  const inputRef = useRef<HTMLInputElement>(null);

  const [showDivider, setShowDivider] = useState(false);

  const [data, setData] = useState<IData[]>([]);
  const [showedData, setShowedData] = useState<IShowedData>({});

  const [dateOptions, setDateOptions] = useState<any>([]);
  const [dateSelected, setDateSelected] = useState<any>("Todos");

  const [productsOptions, setProductsOptions] = useState<any>([]);
  const [productsSelected, setProductsSelected] = useState<any>("Todos");

  const [loading, setLoading] = useState(true);

  const readJsonFile = async () => {
    setLoading(true);
    try {
      const token = await user?.getIdToken(true);

      if (!token) return;

      const data = await getData(token);

      if (!data) return;

      setData(data);

      setDateOptionsOnSelect(data);
      setProductsOptionsOnSelect(data);

      const grouped = groupByMonths(data);
      setShowedData(grouped);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
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

    setLoading(true);

    if (productsSelected === "Todos") {
      alert("Selecione um produto");
      return;
    }

    try {
      const token = await user?.getIdToken(true);

      if (!token) return;

      const data = await updateData(
        {
          date: dateSelected,
          product: productsSelected,
          divided: Number(inputRef.current?.value) || 1,
        },
        token
      );

      setProductsSelected("Todos");
      setDateSelected("Todos");

      setData(data);

      const grouped = groupByMonths(data);
      setShowedData(grouped);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execFilters(dateSelected, productsSelected);
  }, [productsSelected, dateSelected]);

  useEffect(() => {
    readJsonFile();
  }, []);

  return (
    <div>
      <div className="flex items-center gap-5 p-2 my-3 flex-wrap ">
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
          className="w-56 rounded font-bold bg-orange-300 text-black p-2 br-2 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed max-sm:w-full"
          onClick={() => setShowDivider(!showDivider)}
        >
          Aplicar Desdobramento
        </button>
      </div>

      <div className="flex items-end gap-5 px-2 my-3 flex-wrap ">
        <div className="flex flex-col max-sm:w-full">
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

        <div className="flex flex-col max-sm:w-full">
          <label htmlFor="product">Produto:</label>
          <select
            id="product"
            className="text-black"
            value={productsSelected}
            onChange={(e) => setProductsSelected(e.target.value)}
          >
            <option className="text-black max-sm:w-full">Todos</option>
            {productsOptions?.map((item: any) => (
              <option className="text-black max-sm:w-full" key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {showDivider && (
          <>
            <div className="flex flex-col max-sm:w-full">
              <label htmlFor="desdobramento">Desdobramento: ( 1 : ?? )</label>
              <input
                id="desdobramento"
                className="text-black"
                ref={inputRef}
                type="number"
              />
            </div>

            <button
              className="max-sm:w-full rounded h-auto bg-green-200 font-bold text-black p-2 br-2 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed "
              onClick={handleUpdateFile}
            >
              Aplicar Desdobramento nos dados mostrados
            </button>
          </>
        )}
      </div>

      <div className="bg-slate-800 sticky top-0 left-0 right-0 border max-sm:hidden">
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

      {loading ? (
        <div className="w-full h-60 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        Object.entries(showedData)?.map(([key, month]) => (
          <div key={v4()}>
            <div className="flex items-center justify-center bg-black border-b max-sm:pb-1 max-sm:sticky max-sm:top-0 max-sm:left-0">
              <h2 className="text-4xl text-center ">{key}</h2>
            </div>
            {month.map((item) => (
              <div
                className={`
                  grid grid-cols-9 text-center border-b border-dashed border-gray-700
                  max-sm:grid-cols-6 max-sm:text-sm max-sm:border-solid max-sm:even:bg-zinc-600 max-sm:odd:bg-zinc-800
                  last-of-type:border-solid last-of-type:border-b-2 last-of-type:border-white`}
                key={v4()}
              >
                <div className="max-sm:col-span-2 max-sm:border-r flex item-center justify-between flex-col">
                  <span className="hidden border-b items-center justify-center max-sm:flex">
                    {" "}
                    Entrada/Saída
                  </span>
                  <span
                    className={`border-r-2 max-sm:border-b max-sm:border-r-0 ${
                      item["Entrada/Saída"] === "Credito"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item["Entrada/Saída"]}
                  </span>
                </div>

                <div className="max-sm:col-span-2 max-sm:border-r flex item-center justify-between flex-col">
                  <span className="hidden max-sm:flex items-center justify-center border-b">
                    {" "}
                    Data
                  </span>
                  <span
                    className={`border-r-2 max-sm:border-b max-sm:border-r-0 ${
                      item["Entrada/Saída"] === "Credito"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item["Data"]}
                  </span>
                </div>

                <div className="max-sm:col-span-6 max-sm:-order-1 flex item-center justify-between flex-col col-span-4">
                  <span className="hidden items-center justify-center border-t col-span-4 max-sm:flex">
                    Produto
                  </span>
                  <span
                    className={`text-left pl-1 border-white border-solid border-r-2 max-sm:border-r-0 max-sm:border-y max-sm:text-center ${
                      item["Entrada/Saída"] === "Credito"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item["Produto"]}
                  </span>
                </div>

                <div className="max-sm:col-span-2 flex item-center justify-between flex-col">
                  <span className="hidden max-sm:flex items-center justify-center border-b">
                    Quantidade
                  </span>
                  <span
                    className={`border-r-2 max-sm:border-b  max-sm:border-r-0 ${
                      item["Entrada/Saída"] === "Credito"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item["Quantidade"]}
                  </span>
                </div>

                <div className="max-sm:col-span-3 max-sm:border-r flex item-center justify-between flex-col">
                  <span className="hidden max-sm:flex items-center justify-center border-b">
                    Preço unitário
                  </span>
                  <span
                    className={`border-r-2 max-sm:border-solid max-sm:border-r-0 ${
                      item["Entrada/Saída"] === "Credito"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item["Preço unitário"]}
                  </span>
                </div>

                <div className="max-sm:col-span-3 flex item-center justify-between flex-col">
                  <span className="hidden max-sm:flex items-center justify-center border-b">
                    Valor da Operação
                  </span>
                  <span
                    className={`border-r-2 max-sm:border-b max-sm:border-dashed max-sm:border-gray-700 max-sm:border-r-0 ${
                      item["Entrada/Saída"] === "Credito"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item["Valor da Operação"]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
