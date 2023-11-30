import { IData } from "@/types/data";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const token = request.headers.get("authorization");
  const jsonBody: IData[] = await request.json();

  try {
    revalidateTag("list");
    const formattedData = jsonBody.map((item) => ({
      ...item,
      "Média da compra": addAverageScore(jsonBody, item["Produto"]),
    }));

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
