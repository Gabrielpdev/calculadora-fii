export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const jsonBody: { password: string } = await req.json();

    return Response.json({
      message:
        jsonBody.password === process.env.PASSWORD_KEY ? "Success" : "Fail",
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}
