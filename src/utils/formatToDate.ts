import { IData } from "@/types/data";

export function formatToDate(date: IData): Date {
  const splinedDate = date["Data"].split("/");
  return new Date(`${splinedDate[1]}-${splinedDate[0]}-${splinedDate[2]}`);
}
