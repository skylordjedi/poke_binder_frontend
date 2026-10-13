import type { IdentifyResponse } from "../types/identify";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function identifyCard(image: File): Promise<IdentifyResponse> {
  const formData = new FormData();
  formData.append("image", image);
  const res = await fetch(`${API_URL}/api/identify`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Could not identify that card.");
  return res.json();
}