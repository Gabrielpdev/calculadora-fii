import { IData } from "@/types/data";

export async function getData(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATABASE_URL}/list.json?auth=${token}`
    );

    const { data } = await response.json();

    const parsedData: IData[] = JSON.parse(data || "[]");

    return parsedData;
  } catch (error) {
    console.error(error);
    return;
  }
}
