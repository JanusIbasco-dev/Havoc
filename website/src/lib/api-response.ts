import { NextResponse } from "next/server";

export function ok(data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...data });
}

export function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export function serverError(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
