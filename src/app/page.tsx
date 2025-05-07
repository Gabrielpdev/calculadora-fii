"use client";
import { useEffect, useState, useRef, useContext, useCallback } from "react";

import { v4 } from "uuid";

import { months } from "@/constants/months";
import { IData, IShowedData } from "@/types/data";

import { UserContext } from "@/providers/firebase";
import { Loading } from "@/components/loading";
import { formatToDate } from "@/utils/formatToDate";
import { LOCAL_STORAGE_KEY } from "@/constants/keys";

const header = ["Data", "Estabelecimento", "Valor", "Parcela"];

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);

  const { user } = useContext(UserContext);

  const [file, setJson] = useState<any>(null);

  const [showFileInput, setShowFileInput] = useState(false);

  const [data, setData] = useState<IData[]>([]);
  const [showedData, setShowedData] = useState<IShowedData>({});
  const [dateOptions, setDateOptions] = useState<any>([]);

  const [loading, setLoading] = useState(true);

  const handleFileChange = useCallback((e: any) => {
    e.preventDefault();

    if (e.target.files) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const content = e?.target?.result as string;
          const json = csvJSON(content) as IData[];

          setJson(json);
          setData(json);
        };
        reader.readAsText(file);
      }
    }
  }, []);

  function csvJSON(csv?: string) {
    if (!csv) return console.error("CSV is empty");

    const isNu = csv.includes("Data,Valor,Identificador,Descrição");
    const lines = csv.split(isNu ? "\n" : "\r\n");

    const result = [];

    const headers = lines[0].split(isNu ? "," : ";");

    const formattedHeaders = headers.map((item) => {
      if (item === "Descrição") return "Estabelecimento";
      return item;
    });

    for (var i = 1; i < lines.length; i++) {
      var obj = {} as any;
      var currentLine = lines[i].split(isNu ? "," : ";");

      for (var j = 0; j < formattedHeaders.length; j++) {
        if (!isNu)
          obj[
            "Identificador"
          ] = `${currentLine[0]}-${currentLine[1]}-${currentLine[2]}-${currentLine[3]}-${currentLine[4]}`;

        obj[formattedHeaders[j]] = currentLine[j];
      }
      obj["Tipo"] = isNu ? "Nubank" : "Xp";

      result.push(obj);
    }

    return result;
  }

  const handleSaveJSON = async () => {
    setLoading(true);
    try {
      // const token = await user?.getIdToken();
      // if (!token) return;

      // const response = await fetch(`/api/save`, {
      //   method: "POST",
      //   body: JSON.stringify(file),
      //   headers: {
      //     Authorization: `${token}`,
      //   },
      //   credentials: "include",
      // });

      // const { data } = await response.json();

      // if (!data) return;

      const dataString = localStorage.getItem(LOCAL_STORAGE_KEY);
      const data = dataString ? JSON.parse(dataString) : [];

      const filteredData = file.filter((item: any) => {
        return !data.some(
          (obj: any) => obj["Identificador"] === item["Identificador"]
        );
      });

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify([...data, ...filteredData])
      );

      const newData = [...data, ...filteredData];

      setData(newData);
      removeCreditDatas(newData);
      setJson(null);
      setShowFileInput(false);
      fileRef.current!.value = "";
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJSON = async () => {
    const confirm = window.confirm("Deseja mesmo deletar todos os dados?");

    if (!confirm) return;

    setLoading(true);
    try {
      // const token = await user?.getIdToken();
      // if (!token) return;

      // const response = await fetch(`/api/delete`, {
      //   method: "DELETE",
      //   headers: {
      //     Authorization: `${token}`,
      //   },
      //   credentials: "include",
      // });

      // await response.json();
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      alert("Dados deletados com sucesso");

      setData([]);
      setShowedData({});
      setDateOptions([]);

      setJson(null);
      setShowFileInput(false);
      fileRef.current!.value = "";
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

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

      setData(data);
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

        console.log({ dateA, dateB, a, b });

        return dateB.getTime() - dateA.getTime();
      });

      const uniqueArray = Array.from(uniqueMap.values());

      setDateOptions(uniqueArray);

      const grouped = groupByMonths(data);

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
    const filteredData = data;

    if (e.target.value === "Todos") {
      const grouped = groupByMonths(filteredData);
      setShowedData(grouped);

      return;
    }

    const dataToSelect = filteredData.filter((item: any) => {
      const date = formatToDate(item);
      const monthKey = `${months[date.getMonth()]}-${date.getFullYear()}`;

      return monthKey === e.target.value;
    });

    const grouped = groupByMonths(dataToSelect);
    setShowedData(grouped);
  };

  const formatValue = (value: string, type: string, banco: string) => {
    if (!value) return value;

    if (type === "Estabelecimento") {
      if (value.includes("Transferência"))
        return value
          .replace(/^((?:[^-]*-){1}[^-]*)-.*$/, "$1")
          .replace(/^[^-]*recebida[^-]*-/, "PIX de") // Replace "recebida" with "PIX de"
          .replace(/^[^-]*enviada[^-]*-/i, "PIX para") // Replace "enviada" with "PIX para"
          .trim();

      if (value.includes("Pagamento de boleto"))
        return value.replace(/-.*$/, "").trim();
    }

    if (type === "Valor") {
      const valueNumber =
        banco === "Nubank"
          ? Number(value.replace("R$ ", ""))
          : Number(
              value.replace("R$ ", "").replace(".", "").replace(",", ".")
            ) * -1;

      return valueNumber.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }

    return value;
  };

  const getColor = (value: string, type: string, banco: string) => {
    if (type === "Valor") {
      const valueNumber =
        banco === "Nubank"
          ? Number(value.replace("R$ ", ""))
          : Number(value.replace("R$ ", "").replace(".", "").replace(",", "."));

      if (banco === "Nubank") {
        if (valueNumber > 0) return "text-green-500";
        if (valueNumber < 0) return "text-red-500";
      }

      if (valueNumber < 0) return "text-green-500";

      return "text-red-500";
    }
  };

  useEffect(() => {
    readJsonFile();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-5 p-2 my-3 ">
        <button
          className="w-36 rounded bg-slate-50 text-black p-2 br-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed "
          onClick={() => setShowFileInput(!showFileInput)}
        >
          {showFileInput ? "Fechar" : "Enviar Arquivo"}
        </button>

        {showFileInput && (
          <>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileRef}
            />
            <button
              disabled={!file}
              className="w-36 rounded bg-green-300 text-black p-2 br-2 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed "
              onClick={handleSaveJSON}
            >
              Enviar
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-5 p-2 my-3 max-md:flex-col">
        <div className="flex items-center gap-5 p-2 my-3 max-md:order-1">
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

        <div className="flex items-center gap-5 p-2 my-3 max-sm:flex-col">
          <button
            className="w-36 rounded bg-blue-300 text-black p-2 br-2 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed  max-sm:w-full"
            onClick={readJsonFile}
          >
            Atualizar
          </button>

          <button
            className="w-36 rounded bg-red-300 text-black p-2 br-2 hover:bg-red-300 max-sm:w-full"
            onClick={handleDeleteJSON}
          >
            Deletar
          </button>
        </div>
      </div>

      <div className="bg-slate-800 sticky top-0 left-0 right-0 border max-sm:hidden ">
        <div
          className={`grid grid-cols-5 text-center max-sm:grid-cols-5 max-sm:text-xs`}
        >
          {header.map((item) => (
            <span
              key={item}
              className="flex items-center justify-center border-r-2 max-sm:border"
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
            <div key={v4()}>
              <div className="flex items-center justify-center border-b-2 max-sm:sticky top-0 left-0 bg-black">
                <h2 className="text-4xl text-center max-sm:text-3xl max-sm:my-4">
                  {key}
                </h2>
              </div>

              {month.map((item) => {
                return (
                  <div
                    key={v4()}
                    className="grid grid-cols-5 text-center border-b border-dashed border-gray-700 
                    last-of-type:border-solid last-of-type:border-b-2 last-of-type:border-white
                    max-sm:grid-cols-6 max-sm:text-xs max-sm:border-white max-sm:border-solid max-sm:even:bg-zinc-500 max-sm:odd:bg-zinc-800 max-sm:border-y-2"
                  >
                    {header.map((headerItem) => (
                      <div
                        key={v4()}
                        className="flex items-center justify-between flex-col max-sm:col-span-1"
                      >
                        <span
                          className={`w-full flex items-center justify-center border-r-2 max-sm:border-r max-sm:border-dashed max-sm:border-gray-500 max-sm:h-14 ${getColor(
                            item[headerItem as keyof IData],
                            headerItem,
                            item["Tipo"]
                          )}`}
                        >
                          {formatValue(
                            item[headerItem as keyof IData],
                            headerItem,
                            item["Tipo"]
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
