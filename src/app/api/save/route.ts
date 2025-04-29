import { IData } from "@/types/data";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const token = request.headers.get("authorization");
  const jsonBody: IData[] = await request.json();

  try {
    revalidateTag("list");

    const updatedData = JSON.stringify(jsonBody);

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
