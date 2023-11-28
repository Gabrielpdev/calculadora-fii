"use client";
import { months } from "@/constants/months";
import { IData, IShowedData } from "@/types/data";
import { useEffect, useState, useRef } from "react";
import { read, utils } from "xlsx";
import { v4 } from "uuid";
import Link from "next/link";

export default function Home() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setJson] = useState<any>(null);

  const [passwordResponse, setPasswordResponse] = useState(false);

  const [showFileInput, setShowFileInput] = useState(false);

  const [data, setData] = useState<IData[]>([]);
  const [showedData, setShowedData] = useState<IShowedData>({});
  const [dateOptions, setDateOptions] = useState<any>([]);

  const handleFileChange = (e: any) => {
    e.preventDefault();

    if (e.target.files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = e.target.result;

        const workbook = read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const json = utils.sheet_to_json(worksheet);

        setJson(json);
      };
      reader.readAsArrayBuffer(e.target.files[0]);
    }
  };

  const handleSaveJSON = async () => {
    try {
      const response = await fetch("/api/insert", {
        method: "POST",
        body: JSON.stringify(file),
      });

      if (response.ok) {
        const data = await response.json();
        setData(data);
        removeCreditDatas(data);
        setJson(null);
        setShowFileInput(false);
        fileRef.current!.value = "";
      } else {
        console.error("Failed to convert to JSON");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteJSON = async () => {
    const confirm = window.confirm("Deseja mesmo deletar todos os dados?");

    if (!confirm) return;

    try {
      const response = await fetch("/api/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);

        setData([]);
        setShowedData({});
        setDateOptions([]);
      } else {
        console.error("Failed to convert to JSON");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const readJsonFile = async () => {
    try {
      const response = await fetch("/api/select");

      if (response.ok) {
        const data = await response.json();
        setData(data);
        removeCreditDatas(data);
      } else {
        console.error("Failed to select JSON");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const readDataFromLocal = async () => {
    const response = localStorage.getItem(
      process.env.NEXT_PUBLIC_LOCAL_KEY as string
    );

    setPasswordResponse(response === "Success");
  };

  const handleCheckPassword = async () => {
    try {
      const response = await fetch("/api/checkPassword", {
        method: "POST",
        body: JSON.stringify({ password: passwordRef.current?.value }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(
          process.env.NEXT_PUBLIC_LOCAL_KEY as string,
          data.message
        );

        readDataFromLocal();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const removeCreditDatas = async (data: IData[]) => {
    try {
      const filteredData = data.filter(
        (item: any) => item["Entrada/Saída"] !== "Credito"
      );

      const uniqueMap = new Map();
      filteredData.forEach((obj) => uniqueMap.set(obj["Data"], obj["Data"]));

      const uniqueArray = Array.from(uniqueMap.values());

      setDateOptions(uniqueArray);

      const grouped = groupByMonths(filteredData);
      setShowedData(grouped);
    } catch (error) {
      console.error("Error:", error);
    }
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

  const onSelectChange = (e: any) => {
    const filteredData = data.filter(
      (item: any) => item["Entrada/Saída"] !== "Credito"
    );

    if (e.target.value === "Todos") {
      const grouped = groupByMonths(filteredData);
      setShowedData(grouped);

      return;
    }

    const dataToSelect = filteredData.filter(
      (item: any) => item["Data"] === e.target.value
    );

    const grouped = groupByMonths(dataToSelect);
    setShowedData(grouped);
  };

  useEffect(() => {
    readDataFromLocal();
    readJsonFile();
  }, []);

  if (!passwordResponse) {
    return (
      <>
        <input className="text-black" ref={passwordRef} type="password" />
        <button type="button" onClick={handleCheckPassword}>
          Login
        </button>
      </>
    );
  }

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
              accept=".xlsx"
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
          <Link
            className="w-60 text-center rounded bg-orange-300 text-black p-2 br-2 hover:bg-orange-200 max-sm:w-full"
            href="/editar"
          >
            Visualizar todos os dados
          </Link>
        </div>
      </div>

      <div className="bg-slate-800 sticky top-0 left-0 right-0 border max-sm:hidden ">
        <div className="grid grid-cols-11 text-center max-sm:grid-cols-5 max-sm:text-xs">
          <span className="flex items-center justify-center border-r-2 max-sm:border">
            {" "}
            Entrada/Saída
          </span>
          <span className="flex items-center justify-center border-r-2 max-sm:border">
            {" "}
            Data
          </span>
          <span className="flex items-center justify-center border-r-2 col-span-4 max-sm:border max-sm:col-span-3">
            Produto
          </span>
          <span className="flex items-center justify-center border-r-2 max-sm:border">
            {" "}
            Quantidade
          </span>
          <span className="flex items-center justify-center border-r-2 max-sm:border">
            {" "}
            Preço unitário
          </span>
          <span className="flex items-center justify-center border-r-2 max-sm:border">
            {" "}
            Preço médio da compra
          </span>
          <span className="flex items-center justify-center border-r-2 max-sm:border">
            {" "}
            Lucro
          </span>
          <span className="flex items-center justify-center border-r-2 max-sm:border">
            {" "}
            Imposto (20%)
          </span>
        </div>
      </div>

      {Object.entries(showedData)?.map(([key, month]) => {
        const totalLucro = month.reduce((acc, item) => {
          const lucro =
            (item["Preço unitário"] - item["Média da compra"]) *
            item["Quantidade"];

          return acc + lucro;
        }, 0);

        return (
          <div key={v4()}>
            <div className="flex items-center justify-center border-b-2 max-sm:sticky top-0 left-0 bg-black">
              <h2 className="text-4xl text-center max-sm:text-3xl max-sm:my-4">
                {key}
              </h2>
              <div className="flex text-3xl text-center ml-2 max-sm:text-base">
                (
                <h3
                  className={`${
                    totalLucro < 0 ? "text-red-400" : "text-green-400"
                  } `}
                >
                  {totalLucro.toFixed(2)}
                </h3>
                )
              </div>
            </div>

            {month.map((item) => {
              const lucro =
                (item["Preço unitário"] - item["Média da compra"]) *
                item["Quantidade"];

              return (
                <div
                  className="grid grid-cols-11 text-center border-b border-dashed border-gray-700 last-of-type:border-solid last-of-type:border-b-2 last-of-type:border-white max-sm:grid-cols-5 max-sm:text-xs max-sm:border-white max-sm:border-solid max-sm:even:bg-zinc-500 max-sm:odd:bg-zinc-800 max-sm:border-y-2"
                  key={v4()}
                >
                  <div className="flex items-center justify-between flex-col ">
                    <span className="w-full hidden max-sm:flex max-sm:items-center max-sm:justify-center max-sm:border-b max-sm:border-r max-sm:border-t break-words p-1 max-sm:h-14 max-sm:bg-black/40">
                      Entrada / Saída
                    </span>
                    <span className="w-full flex items-center justify-center max-sm:border-r max-sm:border-dashed max-sm:border-gray-500 max-sm:p-5 max-sm:h-14">
                      {item["Entrada/Saída"]}
                    </span>
                  </div>

                  {/* ============================================================================================================================================================================================== */}

                  <div className="flex items-center justify-between flex-col">
                    <span className="w-full hidden max-sm:flex max-sm:border-b max-sm:border-r max-sm:border-t p-1 items-center justify-center max-sm:h-14 max-sm:bg-black/40">
                      Data
                    </span>
                    <span className="w-full flex items-center justify-center border-r-2 max-sm:border-r max-sm:border-dashed max-sm:border-gray-500 max-sm:h-14">
                      {item["Data"]}
                    </span>
                  </div>

                  {/* ============================================================================================================================================================================================== */}

                  <div className="flex items-center justify-between flex-col col-span-4  max-sm:col-span-3">
                    <span className="w-full hidden max-sm:flex max-sm:border-b max-sm:border-r max-sm:border-t items-center justify-center border-r-2 col-span-4 max-sm:col-span-3 max-sm:h-14 max-sm:bg-black/40">
                      Produto
                    </span>
                    <span className="w-full flex items-center justify-center col-span-4 text-left pl-1 border-white border-solid border-r-2 max-sm:col-span-3 max-sm:border-r max-sm:border-dashed max-sm:border-gray-500 max-sm:h-14">
                      {item["Produto"]}
                    </span>
                  </div>

                  {/* ============================================================================================================================================================================================== */}

                  <div className="flex items-center justify-between flex-col">
                    <span className="w-full hidden max-sm:flex max-sm:border-b max-sm:border-r max-sm:border-t p-1 items-center justify-center max-sm:h-14 max-sm:bg-black/40">
                      Quantidade
                    </span>
                    <span className="w-full flex items-center justify-center border-r-2 max-sm:border-r max-sm:border-dashed max-sm:border-gray-500 max-sm:h-14">
                      {item["Quantidade"]}
                    </span>
                  </div>

                  {/* ============================================================================================================================================================================================== */}

                  <div className="flex items-center justify-between flex-col">
                    <span className="w-full hidden max-sm:flex max-sm:border-b max-sm:border-r max-sm:border-t p-1 items-center justify-center max-sm:h-14 max-sm:bg-black/40">
                      Preço unitário
                    </span>
                    <span className="w-full flex items-center justify-center border-r-2 max-sm:border-r max-sm:border-dashed max-sm:border-gray-500 max-sm:h-14">
                      {item["Preço unitário"]}
                    </span>
                  </div>

                  {/* ============================================================================================================================================================================================== */}

                  <div className="flex items-center justify-between flex-col">
                    <span className="w-full hidden max-sm:flex max-sm:border-b max-sm:border-r max-sm:border-t p-1 items-center justify-center max-sm:h-14 max-sm:bg-black/40">
                      Preço médio da compra
                    </span>
                    <span className="w-full flex items-center justify-center border-r-2 max-sm:border-r max-sm:border-dashed max-sm:border-gray-500 max-sm:h-14">
                      {item["Média da compra"].toFixed(2)}
                    </span>
                  </div>

                  {/* ============================================================================================================================================================================================== */}

                  <div className="flex items-center justify-between flex-col">
                    <span className="w-full hidden max-sm:flex max-sm:border-b max-sm:border-r max-sm:border-t p-1 items-center justify-center max-sm:h-14 max-sm:bg-black/40">
                      Lucro
                    </span>
                    <span
                      className={`w-full border-r-2 flex items-center justify-center max-sm:border-r max-sm:border-dashed max-sm:border-gray-500 max-sm:h-14 ${
                        lucro < 0 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {lucro.toFixed(2)}
                    </span>
                  </div>

                  {/* ============================================================================================================================================================================================== */}

                  <div className="flex items-center justify-between flex-col border border-dashed border-gray-700">
                    <span className="w-full hidden max-sm:flex max-sm:border-b max-sm:border-r max-sm:border-t p-1 items-center justify-center max-sm:h-14 max-sm:bg-black/40">
                      Imposto (20%)
                    </span>
                    <span
                      className={`w-full flex items-center justify-center max-sm:border-r max-sm:border-dashed max-sm:border-gray-500 max-sm:h-14 ${
                        lucro < 0 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {(lucro * 0.2).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
