// pages/api/convertToJSON.js

import { IData } from "@/types/data";
import { readFileSync, writeFile } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "db/userData.json");

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const bufferDataString = readFileSync(dataFilePath, { encoding: "utf8" });

    const objectData = JSON.parse(bufferDataString || "[]");

    const jsonBody: IData[] = await req.json();

    const formattedData = jsonBody.map((item) => ({
      ...item,
      "Média da compra": addAverageScore(jsonBody, item["Produto"]),
    }));

    const newData = [...objectData, ...formattedData];

    const updatedData = JSON.stringify(newData);

    const data = new Uint8Array(Buffer.from(updatedData));

    writeFile(dataFilePath, data, "utf8", (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });

    return new Response(updatedData);
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}

const addAverageScore = (data: IData[], targetTitle: string) => {
  // Filter the array to include only objects with the target title
  const filteredData = data.filter(
    (item) =>
      item["Produto"] === targetTitle && item["Entrada/Saída"] !== "Debito"
  );

  // Check if there are elements with the target title
  if (filteredData.length === 0) {
    return 0; // or any default value if there are no elements with the target title
  }

  // Calculate the sum of values
  const sum = filteredData.reduce(
    (acc, item) => acc + item["Preço unitário"],
    0
  );

  // Calculate the average
  const average = sum / filteredData.length;

  return average;
};
