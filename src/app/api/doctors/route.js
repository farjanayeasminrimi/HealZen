const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

const createProxyResponse = async (backendResponse) => {
  const text = await backendResponse.text();
  return new Response(text, {
    status: backendResponse.status,
    headers: {
      "content-type": backendResponse.headers.get("content-type") || "application/json",
    },
  });
};

export async function GET() {
  if (!backendUrl) {
    return new Response(JSON.stringify({ error: "Backend URL is not configured." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const backendResponse = await fetch(`${backendUrl}/doctors`, {
    method: "GET",
  });

  return createProxyResponse(backendResponse);
}
