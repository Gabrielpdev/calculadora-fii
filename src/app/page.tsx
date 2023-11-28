"use client";
import { months } from "@/constants/months";
import { IData, IShowedData } from "@/types/data";
import { useEffect, useState, useRef } from "react";
import { read, utils } from "xlsx";
import { v4 } from "uuid";
import Link from "next/link";

export default function Home() {
  const passwordRef = useRef<HTMLInputElement>(null);

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
        console.log({ data });
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
            <input type="file" accept=".xlsx" onChange={handleFileChange} />
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

      <div className="flex items-center justify-between gap-5 p-2 my-3 ">
        <div className="flex items-center gap-5 p-2 my-3 ">
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

        <div className="flex items-center gap-5 p-2 my-3 ">
          <button
            className="w-36 rounded bg-blue-300 text-black p-2 br-2 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed "
            onClick={readJsonFile}
          >
            Atualizar
          </button>

          <button
            className="w-36 rounded bg-red-300 text-black p-2 br-2 hover:bg-red-300"
            onClick={handleDeleteJSON}
          >
            Deletar
          </button>
          <Link
            className="w-60 text-center rounded bg-orange-300 text-black p-2 br-2 hover:bg-orange-200"
            href="/editar"
          >
            Visualizar todos os dados
          </Link>
        </div>
      </div>

      <div className="bg-slate-800 sticky top-0 left-0 right-0 border">
        <div className="grid grid-cols-11 text-center">
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
            Preço médio da compra
          </span>
          <span className="flex items-center justify-center border-r-2">
            {" "}
            Lucro
          </span>
          <span className="flex items-center justify-center border-r-2">
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
            <div className="flex items-center justify-center">
              <h2 className="text-4xl text-center ">{key}</h2>
              <div className="flex text-3xl text-center ml-2 ">
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
            <hr />
            {month.map((item) => {
              const lucro =
                (item["Preço unitário"] - item["Média da compra"]) *
                item["Quantidade"];

              return (
                <div
                  className="grid grid-cols-11 text-center border-b border-dashed border-gray-700  last-of-type:border-solid last-of-type:border-b-2 last-of-type:border-white"
                  key={v4()}
                >
                  <span className="border-r-2">{item["Entrada/Saída"]}</span>
                  <span className="border-r-2">{item["Data"]}</span>
                  <span className="col-span-4 text-left pl-1 border-white border-solid border-r-2">
                    {item["Produto"]}
                  </span>
                  <span className="border-r-2">{item["Quantidade"]}</span>
                  <span className="border-r-2">{item["Preço unitário"]}</span>
                  <span className="border-r-2">
                    {item["Média da compra"].toFixed(2)}
                  </span>
                  <span
                    className={`border-r-2  ${
                      lucro < 0 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {lucro.toFixed(2)}
                  </span>
                  <span
                    className={lucro < 0 ? "text-red-400" : "text-green-400"}
                  >
                    {(lucro * 0.2).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
