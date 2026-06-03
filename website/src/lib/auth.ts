import { NextRequest } from "next/server";

export function isAuthorized(request: NextRequest) {
  const configuredKey = process.env.MINECRAFT_API_KEY?.trim();
  if (!configuredKey || configuredKey === "change-me") {
    return false;
  }

  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${configuredKey}`;
}
