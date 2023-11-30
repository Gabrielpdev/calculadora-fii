import { revalidateTag } from "next/cache";

export async function DELETE(request: Request) {
  const token = request.headers.get("authorization");

  try {
    revalidateTag("list");
    const response = await fetch(
      `${process.env.DATABASE_URL}/list.json?auth=${token}`,
      {
        method: "PUT",
        body: JSON.stringify({
          data: "[]",
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
