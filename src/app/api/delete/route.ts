// pages/api/convertToJSON.js

import fsPromises from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "db/userData.json");

export async function DELETE() {
  try {
    await fsPromises.writeFile(dataFilePath, "");

    return Response.json({ message: "Todos dados delatados com sucesso" });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
