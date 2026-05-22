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

export async function POST(request) {
  if (!backendUrl) {
    return new Response(JSON.stringify({ error: "Backend URL is not configured." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await request.text();
  const backendResponse = await fetch(`${backendUrl}/appointments`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
  });

  return createProxyResponse(backendResponse);
}

export async function GET(request) {
  if (!backendUrl) {
    return new Response(JSON.stringify({ error: "Backend URL is not configured." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const query = url.search;
  const backendResponse = await fetch(`${backendUrl}/appointments${query}`, {
    method: "GET",
  });

  return createProxyResponse(backendResponse);
}
