export async function deleteData(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DATABASE_URL}/list.json?auth=${token}`,
      {
        method: "PUT",
        body: JSON.stringify({
          data: "[]",
        }),
      }
    );

    const { data } = await response.json();

    console.log(data);

    const parsedData = JSON.parse(data || "[]");

    console.log(parsedData);
    return parsedData;
  } catch (error) {
    console.error(error);
    return;
  }
}
