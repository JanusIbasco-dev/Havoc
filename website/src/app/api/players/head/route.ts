import { inflateSync } from "node:zlib";
import { NextResponse } from "next/server";

type Rgba = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type PngImage = {
  width: number;
  height: number;
  pixels: Uint8Array;
};

const fallbackSkin = "https://mc-heads.net/skin/MHF_Steve";
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = safeImageSource(searchParams.get("src")) || fallbackSkin;
  const size = clampSize(Number(searchParams.get("size") || "96"));
  const skin = await loadMinecraftSkin(source);

  if (!skin) {
    return NextResponse.json({ error: "Unable to load raw Minecraft skin PNG." }, { status: 502 });
  }

  const face = renderFacePixels(skin);
  const svg = renderFaceSvg(face, size);

  return new NextResponse(svg, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "image/svg+xml"
    }
  });
}

function renderFacePixels(skin: PngImage) {
  const baseFace = cropFace(skin, 8, 8);
  const overlayFace = cropFace(skin, 40, 8);

  return baseFace.map((base, index) => blend(base, overlayFace[index]));
}

function cropFace(skin: PngImage, startX: number, startY: number) {
  const pixels: Rgba[] = [];

  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      pixels.push(readPixel(skin, startX + x, startY + y));
    }
  }

  return pixels;
}

function readPixel(skin: PngImage, x: number, y: number): Rgba {
  if (x < 0 || y < 0 || x >= skin.width || y >= skin.height) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  const index = (y * skin.width + x) * 4;
  return {
    r: skin.pixels[index],
    g: skin.pixels[index + 1],
    b: skin.pixels[index + 2],
    a: skin.pixels[index + 3]
  };
}

function blend(base: Rgba, overlay: Rgba): Rgba {
  if (overlay.a === 0) {
    return base;
  }

  if (overlay.a === 255) {
    return overlay;
  }

  const alpha = overlay.a / 255;
  const inverse = 1 - alpha;

  return {
    r: Math.round(overlay.r * alpha + base.r * inverse),
    g: Math.round(overlay.g * alpha + base.g * inverse),
    b: Math.round(overlay.b * alpha + base.b * inverse),
    a: Math.max(base.a, overlay.a)
  };
}

function renderFaceSvg(face: Rgba[], size: number) {
  const rects = face
    .map((pixel, index) => {
      const x = index % 8;
      const y = Math.floor(index / 8);
      const opacity = pixel.a < 255 ? ` fill-opacity="${roundOpacity(pixel.a / 255)}"` : "";
      return `<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${pixel.r},${pixel.g},${pixel.b})"${opacity}/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 8 8" shape-rendering="crispEdges">${rects}</svg>`;
}

async function loadPngSkin(source: string) {
  const bytes = source.startsWith("data:image/") ? bytesFromDataUrl(source) : await fetchImageBytes(source);
  if (!bytes) {
    return null;
  }

  try {
    return decodePng(bytes);
  } catch {
    return null;
  }
}

async function loadMinecraftSkin(source: string) {
  const skin = await loadPngSkin(source);
  if (skin && isMinecraftSkinSize(skin)) {
    return skin;
  }

  const fallback = source === fallbackSkin ? null : await loadPngSkin(fallbackSkin);
  return fallback && isMinecraftSkinSize(fallback) ? fallback : null;
}

function isMinecraftSkinSize(skin: PngImage) {
  return skin.width === 64 && (skin.height === 64 || skin.height === 32);
}

async function fetchImageBytes(source: string) {
  try {
    const response = await fetch(source, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/png";
    if (!contentType.includes("png") && !contentType.startsWith("image/")) {
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

function decodePng(bytes: Buffer): PngImage {
  if (!bytes.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error("Invalid PNG signature.");
  }

  let offset = pngSignature.length;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let palette: Uint8Array | null = null;
  let transparency: Uint8Array | null = null;
  const idatChunks: Buffer[] = [];

  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "PLTE") {
      palette = new Uint8Array(data);
    } else if (type === "tRNS") {
      transparency = new Uint8Array(data);
    } else if (type === "IDAT") {
      idatChunks.push(Buffer.from(data));
    } else if (type === "IEND") {
      break;
    }
  }

  if (!width || !height || bitDepth !== 8) {
    throw new Error("Unsupported PNG format.");
  }

  const channels = channelsForColorType(colorType);
  const scanlineLength = width * channels;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const raw = unfilterPng(inflated, width, height, channels, scanlineLength);
  const pixels = rgbaPixels(raw, width, height, colorType, palette, transparency);

  return { width, height, pixels };
}

function unfilterPng(data: Buffer, width: number, height: number, channels: number, scanlineLength: number) {
  const raw = new Uint8Array(width * height * channels);
  let input = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = data[input];
    input += 1;
    const rowStart = y * scanlineLength;
    const prevRowStart = rowStart - scanlineLength;

    for (let x = 0; x < scanlineLength; x += 1) {
      const left = x >= channels ? raw[rowStart + x - channels] : 0;
      const up = y > 0 ? raw[prevRowStart + x] : 0;
      const upLeft = y > 0 && x >= channels ? raw[prevRowStart + x - channels] : 0;
      const value = data[input];
      input += 1;

      raw[rowStart + x] = (value + pngFilterValue(filter, left, up, upLeft)) & 0xff;
    }
  }

  return raw;
}

function pngFilterValue(filter: number, left: number, up: number, upLeft: number) {
  if (filter === 0) {
    return 0;
  }

  if (filter === 1) {
    return left;
  }

  if (filter === 2) {
    return up;
  }

  if (filter === 3) {
    return Math.floor((left + up) / 2);
  }

  if (filter === 4) {
    return paeth(left, up, upLeft);
  }

  throw new Error("Unsupported PNG filter.");
}

function rgbaPixels(raw: Uint8Array, width: number, height: number, colorType: number, palette: Uint8Array | null, transparency: Uint8Array | null) {
  const pixels = new Uint8Array(width * height * 4);

  for (let input = 0, output = 0; output < pixels.length; output += 4) {
    if (colorType === 6) {
      pixels[output] = raw[input];
      pixels[output + 1] = raw[input + 1];
      pixels[output + 2] = raw[input + 2];
      pixels[output + 3] = raw[input + 3];
      input += 4;
    } else if (colorType === 2) {
      pixels[output] = raw[input];
      pixels[output + 1] = raw[input + 1];
      pixels[output + 2] = raw[input + 2];
      pixels[output + 3] = 255;
      input += 3;
    } else if (colorType === 3 && palette) {
      const paletteIndex = raw[input];
      const paletteOffset = paletteIndex * 3;
      pixels[output] = palette[paletteOffset] || 0;
      pixels[output + 1] = palette[paletteOffset + 1] || 0;
      pixels[output + 2] = palette[paletteOffset + 2] || 0;
      pixels[output + 3] = transparency?.[paletteIndex] ?? 255;
      input += 1;
    } else {
      throw new Error("Unsupported PNG color type.");
    }
  }

  return pixels;
}

function channelsForColorType(colorType: number) {
  if (colorType === 6) {
    return 4;
  }

  if (colorType === 2) {
    return 3;
  }

  if (colorType === 3) {
    return 1;
  }

  throw new Error("Unsupported PNG color type.");
}

function paeth(left: number, up: number, upLeft: number) {
  const p = left + up - upLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upLeft);

  if (pa <= pb && pa <= pc) {
    return left;
  }

  return pb <= pc ? up : upLeft;
}

function bytesFromDataUrl(value: string) {
  const match = value.match(/^data:image\/png;base64,(.+)$/);
  return match ? Buffer.from(match[1], "base64") : null;
}

function safeImageSource(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    return value.startsWith("data:image/png;base64,") ? value : null;
  }

  return null;
}

function clampSize(value: number) {
  return Math.min(600, Math.max(32, Number.isFinite(value) ? Math.round(value) : 96));
}

function roundOpacity(value: number) {
  return Math.round(value * 1000) / 1000;
}
