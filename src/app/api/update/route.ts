import { IData, IUpdateData } from "@/types/data";
import { isBefore, isEqual } from "date-fns";
import { revalidateTag } from "next/cache";

export async function PUT(request: Request) {
  const token = request.headers.get("authorization");
  const jsonBody: IUpdateData = await request.json();

  const host = request.url.split("/api/update")[0];

  try {
    revalidateTag("list");
    const dataListRes = await fetch(`${host}/api/list`, {
      headers: {
        Authorization: `${token}`,
      },
    });

    const { data: dataList }: { data: IData[] } = await dataListRes.json();

    const formattedData = formatData(dataList, jsonBody);

    const updatedData = JSON.stringify(formattedData);

    const response = await fetch(
      `${process.env.DATABASE_URL}/list.json?auth=${token}`,
      {
        method: "PUT",
        body: JSON.stringify({
          data: updatedData,
        }),
      }
    );

    const { data } = await response.json();

    const parsedData = JSON.parse(data || "[]");

    return Response.json({
      data: parsedData,
    });
  } catch (error) {
    console.error(error);
    return;
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
