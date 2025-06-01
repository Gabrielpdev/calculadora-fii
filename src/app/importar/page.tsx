"use client";
import { useState, useRef, useContext, useCallback, useEffect } from "react";

import { ICategory, IData } from "@/types/data";

import { UserContext } from "@/providers/firebase";
import { LOCAL_STORAGE_KEY } from "@/constants/keys";
import { useRouter } from "next/navigation";

export default function Import() {
  const { push } = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const { user } = useContext(UserContext);

  const [file, setJson] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const handleFileChange = (e: any) => {
    e.preventDefault();

    if (e.target.files) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const content = e?.target?.result as string;
          const json = csvJSON(content) as IData[];

          setJson(json);
          // setData(json);
        };
        reader.readAsText(file);
      }
    }
  };

  const csvJSON = (csv?: string) => {
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
        if (!isNu) {
          obj[
            "Identificador"
          ] = `${currentLine[0]}-${currentLine[1]}-${currentLine[2]}-${currentLine[3]}-${currentLine[4]}`;
        }

        formatValues({
          json: obj,
          type: formattedHeaders[j],
          value: currentLine[j],
          banco: isNu ? "Nubank" : "Xp",
        });
      }
      obj["Tipo"] = isNu ? "Nubank" : "Xp";

      result.push(obj);
    }

    console.log(result);

    return result;
  };

  const formatValues = ({
    json,
    type,
    value,
    banco,
  }: {
    json: Record<string, any>;
    type: string;
    value: string;
    banco: string;
  }) => {
    if (type === "Estabelecimento" && value) {
      const fined = categories.find((category) =>
        category.list.some((item) => item === value)
      );

      json["Categoria"] = fined ? fined.name : "Outros";

      if (value.includes("Transferência")) {
        json[type] = value
          .replace(/^((?:[^-]*-){1}[^-]*)-.*$/, "$1")
          .replace(/^[^-]*recebida[^-]*-/, "PIX de") // Replace "recebida" with "PIX de"
          .replace(/^[^-]*enviada[^-]*-/i, "PIX para") // Replace "enviada" with "PIX para"
          .trim()
          .toLocaleLowerCase();

        return;
      }

      if (value.includes("Pagamento de boleto")) {
        json[type] = value.replace(/-.*$/, "").trim();
        return;
      }
    }

    if (type === "Valor" && value) {
      const valueNumber =
        banco === "Nubank"
          ? Number(value.replace("R$ ", ""))
          : Number(
              value.replace("R$ ", "").replace(".", "").replace(",", ".")
            ) * -1;
      json[type] = valueNumber;
      return;
    }

    json[type] = value;
  };

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

      const filteredData = file?.filter((item: any) => {
        const local = item["Estabelecimento"];

        return (
          !!local &&
          !local.includes("RDB") &&
          local !== "Pagamentos Validos Normais" &&
          !data.some(
            (obj: any) => obj["Identificador"] === item["Identificador"]
          )
        );
      });

      console.log(filteredData);

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify([...data, ...filteredData])
      );

      setJson(null);
      fileRef.current!.value = "";
      push("/");
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

      setJson(null);
      fileRef.current!.value = "";
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const categoriesString = localStorage.getItem(
      `${LOCAL_STORAGE_KEY}_categories`
    );
    const categories = categoriesString ? JSON.parse(categoriesString) : [];

    setCategories(categories);
  }, []);

  return (
    <div className="flex max-w-6xl w-full flex-col m-auto">
      <div className="flex w-full flex-col gap-5 p-2 mt-20">
        <label className="w-full border border-green-500 border-dashed h-32 relative ">
          <p className="w-full h-full absolute flex items-center justify-center ">
            {fileRef.current?.files?.[0]?.name
              ? fileRef.current.files[0].name
              : "Selecione ou arraste o arquivo aqui"}
          </p>
          <input
            className="w-full h-full absolute z-10 opacity-0"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileRef}
          />
        </label>
      </div>

      <div className="flex items-center justify-between w-full p-2 my-3 ">
        <div className="text-gray-400 flex gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 text-green-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          Permitido apenas arquivos CSV
        </div>
        <button
          className="w-36 rounded bg-green-600 text-white p-2 br-2 hover:bg-green-700 "
          onClick={handleSaveJSON}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
