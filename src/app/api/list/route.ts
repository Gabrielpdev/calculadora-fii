import { IData } from "@/types/data";

export async function GET(request: Request) {
  const token = request.headers.get("authorization");

  try {
    const response = await fetch(
      `${process.env.DATABASE_URL}/list.json?auth=${token}`,
      {
        next: { revalidate: Infinity, tags: ["list"] },
      }
    );

    const { data } = await response.json();

    const parsedData: IData[] = JSON.parse(data || "[]");

    return Response.json({
      data: parsedData,
    });
  } catch (error) {
    console.error(error);
    return;
  }
}
