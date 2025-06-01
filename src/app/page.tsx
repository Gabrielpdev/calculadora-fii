"use client";
import { useContext, useEffect, useState } from "react";

import { v4 } from "uuid";

import { months } from "@/constants/months";
import { IData, IShowedData } from "@/types/data";

import { Loading } from "@/components/loading";
import { formatToDate } from "@/utils/formatToDate";
import { LOCAL_STORAGE_KEY } from "@/constants/keys";
import { CurrencyContext } from "@/providers/currency";

const header = ["Estabelecimento", "Valor", "Categoria", "Data"];

export default function Home() {
  const [showedData, setShowedData] = useState<IShowedData>({});
  const [dateOptions, setDateOptions] = useState<any>([]);
  const [rawData, setRawData] = useState<IData[]>([]);

  const [loading, setLoading] = useState(true);

  const { setValue } = useContext(CurrencyContext);

  const readJsonFile = async () => {
    setLoading(true);
    try {
      // const token = await user?.getIdToken();
      // if (!token) return;

      // const response = await fetch(`/api/list`, {
      //   headers: {
      //     Authorization: `${token}`,
      //   },
      //   credentials: "include",
      // });

      // const { data } = await response.json();

      // if (!data) return;
      const dataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      const data = dataString ? JSON.parse(dataString) : [];

      setRawData(data);
      removeCreditDatas(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeCreditDatas = async (data: IData[]) => {
    try {
      const uniqueMap = new Map();
      data.forEach((obj) => {
        const date = formatToDate(obj);

        const monthKey = `${months[date.getMonth()]}-${date.getFullYear()}`;

        uniqueMap.set(monthKey, monthKey);
      });

      data.sort((a, b) => {
        const dateA = formatToDate(a);
        const dateB = formatToDate(b);

        return dateB.getTime() - dateA.getTime();
      });

      const uniqueArray = Array.from(uniqueMap.values());

      console.log(new Date(Date.parse("Abril" + " 1, 2025")));
      // const date = new Date();
      // console.log(new Date(Date.parse("Abril" + " 1, 2025")));

      // date.setMonth(new Date(Date.parse("Abril" + " 1, 2025")).getMonth());

      // console.log(date.toLocaleString("pt-BR", { month: "long" }));

      setDateOptions(uniqueArray);

      const grouped = groupByMonths(data);

      formatTotalValue(data);
      setShowedData(grouped);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const groupByMonths = (data: IData[]) => {
    return data.reduce((acc, obj) => {
      if (!obj["Data"]) return acc;

      const date = formatToDate(obj);

      const monthKey = `${months[date.getMonth()]}-${date.getFullYear()}`;

      acc[monthKey] = acc[monthKey] || [];
      acc[monthKey].push(obj);

      return acc;
    }, {} as IShowedData);
  };

  const onSelectChange = (e: any) => {
    const dataToSelect = rawData.filter((item: any) => {
      const date = formatToDate(item);
      const monthKey = `${months[date.getMonth()]}-${date.getFullYear()}`;

      if (e.target.value === "Todos") return true;

      return monthKey === e.target.value;
    });

    const grouped = groupByMonths(dataToSelect);

    formatTotalValue(dataToSelect);
    setShowedData(grouped);
  };

  const formatTotalValue = (dataToSelect: IData[]) => {
    let newValues = {
      in: 0,
      out: 0,
    };

    dataToSelect.forEach((item) => {
      if (typeof item?.["Valor"] === "number" && item?.["Valor"] > 0) {
        newValues.in += item?.["Valor"];
        return;
      }
      newValues.out += (item?.["Valor"] || 0) as number;
    });

    setValue({
      in: newValues.in.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      out: newValues.out.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    });
  };

  const formatValue = (value: number | string, type: keyof IData) => {
    if (!value) return value;

    if (type === "Valor") {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }

    return value;
  };

  const getColor = (
    value: string | number,
    type: keyof IData,
    banco: string
  ) => {
    if (type === "Valor" && typeof value === "number") {
      // if (value < 0) {
      // if (value > 0) return "text-green-600";
      if (value < 0) return "text-red-600";
      // }

      // if (value < 0) return "text-green-500";

      return "text-green-600";
    }
    return "text-blue-950";
  };

  useEffect(() => {
    readJsonFile();
  }, []);

  return (
    <div className="flex max-w-6xl w-full flex-col  mt-24 m-auto">
      <div className="flex items-center gap-5 p-2 max-md:order-1">
        <label htmlFor="data">Filtrar por data:</label>
        <select className="text-black" id="data" onChange={onSelectChange}>
          <option className="text-black">Todos</option>
          {dateOptions?.map((item: any) => (
            <option className="text-black" key={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="sticky top-0 left-0 right-0 border max-sm:hidden py-3  bg-neutral-200">
        <div
          className={`grid grid-cols-5 text-center max-sm:grid-cols-5 max-sm:text-xs`}
        >
          {header.map((item) => (
            <span
              key={item}
              className={`flex ${
                item === "Estabelecimento"
                  ? "col-span-2"
                  : "col-span-1 justify-center"
              } items-center border-r-2 max-sm:border text-zinc-400`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-full h-60 flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        Object.entries(showedData)?.map(([key, month]) => {
          return (
            <div key={v4()} className="gap-1 flex flex-col">
              <div className="flex items-center justify-center text-zinc-400 py-4">
                <h2 className="text-base text-center">{key}</h2>
              </div>

              {month.map((item) => {
                return (
                  <div
                    key={v4()}
                    className="grid grid-cols-5 text-center bg-white p-5 rounded-md "
                  >
                    {header.map((headerItem) => (
                      <div
                        key={v4()}
                        className={`flex items-center justify-between flex-col ${
                          headerItem === "Estabelecimento"
                            ? "col-span-2"
                            : "col-span-1"
                        }`}
                      >
                        <span
                          className={`w-full flex items-center capitalize ${
                            headerItem === "Estabelecimento"
                              ? ""
                              : "justify-center"
                          } border-r-2 ${getColor(
                            item[headerItem as keyof IData],
                            headerItem as keyof IData,
                            item["Tipo"]
                          )}`}
                        >
                          {formatValue(
                            item[headerItem as keyof IData],
                            headerItem as keyof IData
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
