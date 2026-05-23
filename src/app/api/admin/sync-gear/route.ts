import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Parse a CSV line, handling quoted values that may contain commas
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside quoted field — output a single "
        current += '"';
        i++; // skip the second quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId || sheetId === "your-sheet-id-here") {
    return NextResponse.json(
      { error: "GOOGLE_SHEET_ID is not configured in .env" },
      { status: 503 }
    );
  }

  // Fetch public Sheet as CSV — no API key needed
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `Could not fetch sheet: ${res.status} ${res.statusText}` },
      { status: 502 }
    );
  }

  const csv = await res.text();
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return NextResponse.json({ error: "Sheet appears to be empty" }, { status: 400 });
  }

  // First row = headers → normalise to lowercase, trim spaces
  const headers = parseCsvLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/\s+/g, "_")
  );

  // Helper: get value by header name (tries multiple aliases)
  function col(row: string[], ...names: string[]): string {
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx !== -1 && row[idx]) return row[idx].trim();
    }
    return "";
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row.every((v) => !v)) continue; // skip blank rows

    const name         = col(row, "name");
    const brand        = col(row, "brand");
    const model        = col(row, "model");
    const category     = col(row, "category");
    const serialNumber = col(row, "serial_number", "serial", "sn");
    const status       = col(row, "status") || "available";
    const notesVal     = col(row, "notes") || null;
    const valueStr     = col(row, "value");
    const valueNum     = valueStr ? parseFloat(valueStr.replace(/[^0-9.]/g, "")) : null;

    if (!name || !brand || !model || !category) {
      skipped++;
      continue;
    }

    // Try to find existing equipment: serial number first, then name+brand+model
    let existing = null;
    if (serialNumber) {
      existing = await prisma.equipment.findFirst({ where: { serialNumber } });
    }
    if (!existing) {
      existing = await prisma.equipment.findFirst({ where: { name, brand, model } });
    }

    // Validate status against known values; default to "available" for new items
    const validStatuses = ["available", "booked", "damaged", "retired"];
    const safeStatus = validStatuses.includes(status) ? status : "available";

    if (existing) {
      // Never overwrite an operational status — the booking system owns that field
      const liveStatus = ["booked", "damaged"].includes(existing.status)
        ? existing.status
        : safeStatus;
      await prisma.equipment.update({
        where: { id: existing.id },
        data: {
          name, brand, model, category,
          status: liveStatus,
          serialNumber: serialNumber || null,
          notes: notesVal,
          value: isNaN(valueNum as number) ? null : valueNum,
        },
      });
      updated++;
    } else {
      await prisma.equipment.create({
        data: {
          name, brand, model, category,
          status: safeStatus,
          serialNumber: serialNumber || null,
          notes: notesVal,
          value: isNaN(valueNum as number) ? null : valueNum,
        },
      });
      created++;
    }
  }

  return NextResponse.json({
    success: true,
    created,
    updated,
    skipped,
    message: `Synced ${created + updated} items (${created} new, ${updated} updated, ${skipped} skipped)`,
  });
}
