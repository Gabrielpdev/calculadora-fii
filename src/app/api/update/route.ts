// pages/api/convertToJSON.js

import { IData, IUpdateData } from "@/types/data";
import { isBefore, isEqual } from "date-fns";
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

    const jsonBody: IUpdateData = await req.json();

    const formattedData = formatData(objectData, jsonBody);

    const updatedData = JSON.stringify(formattedData);

    const data = new Uint8Array(Buffer.from(updatedData));

    writeFile(dataFilePath, data, "utf8", (err) => {
      if (err) throw err;
      console.log("The file has been updated!");
    });

    return new Response(updatedData);
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}

const formatData = (data: IData[], updateData: IUpdateData) => {
  return data.map((item) => {
    const splinedDate = item["Data"].split("/");
    const splinedSelectedDate = updateData.date.split("/");

    const date = new Date(
      `${splinedDate[1]}-${splinedDate[0]}-${splinedDate[2]}`
    );
    const selectedDate = new Date(
      `${splinedSelectedDate[1]}-${splinedSelectedDate[0]}-${splinedSelectedDate[2]}`
    );

    if (
      updateData.date === "Todos" &&
      item["Produto"].trim() === updateData.product.trim()
    ) {
      return {
        ...item,
        ["Quantidade"]: item["Quantidade"] * updateData.divided,
        ["Preço unitário"]: item["Preço unitário"] / updateData.divided,
        ["Valor da Operação"]:
          item["Quantidade"] *
          updateData.divided *
          (item["Preço unitário"] / updateData.divided),
      };
    }

    if (
      (isEqual(date, selectedDate) || isBefore(date, selectedDate)) &&
      item["Produto"].trim() === updateData.product.trim()
    ) {
      return {
        ...item,
        ["Quantidade"]: item["Quantidade"] * updateData.divided,
        ["Preço unitário"]: item["Preço unitário"] / updateData.divided,
        ["Valor da Operação"]:
          item["Quantidade"] *
          updateData.divided *
          (item["Preço unitário"] / updateData.divided),
      };
    }

    return item;
  });
};
