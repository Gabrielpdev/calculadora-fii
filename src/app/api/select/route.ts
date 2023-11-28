import { readFileSync } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "db/userData.json");

export async function GET() {
  try {
    const bufferDataString = readFileSync(dataFilePath, { encoding: "utf8" });

    return new Response(bufferDataString || "[]");
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
