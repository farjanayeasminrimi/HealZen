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
  const backendResponse = await fetch(`${backendUrl}/confirmAppointments`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
  });

  return createProxyResponse(backendResponse);
}

export async function PATCH(request) {
  if (!backendUrl) {
    return new Response(JSON.stringify({ error: "Backend URL is not configured." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const appointmentId = pathSegments[pathSegments.length - 1];

  if (!appointmentId) {
    return new Response(JSON.stringify({ error: "Appointment ID is required." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await request.text();
  const backendResponse = await fetch(`${backendUrl}/confirmAppointments/${appointmentId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body,
  });

  return createProxyResponse(backendResponse);
}
