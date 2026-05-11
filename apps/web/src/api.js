const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function scanMessage(text, files) {
  const response = await fetch(`${apiBaseUrl}/scan/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text, files })
  });

  if (!response.ok) {
    throw new Error("Unable to scan message content");
  }

  return response.json();
}

export async function fetchScanHistory() {
  const response = await fetch(`${apiBaseUrl}/scan/history?limit=5`);

  if (!response.ok) {
    throw new Error("Unable to load scan history");
  }

  const payload = await response.json();
  return payload.records;
}
