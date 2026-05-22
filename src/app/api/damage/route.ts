import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const equipmentId = parseInt(formData.get("equipmentId") as string);
    const reportedById = parseInt(formData.get("reportedById") as string);
    const description = formData.get("description") as string;
    const severity = formData.get("severity") as string;
    const photoFile = formData.get("photo") as File | null;

    if (!equipmentId || !reportedById || !description || !severity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let photoPath: string | null = null;
    if (photoFile && photoFile.size > 0) {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = photoFile.name.split(".").pop() ?? "jpg";
      const filename = `damage-${Date.now()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "damage");
      await writeFile(path.join(uploadDir, filename), buffer);
      photoPath = `/uploads/damage/${filename}`;
    }

    const report = await prisma.damageReport.create({
      data: {
        equipmentId,
        reportedById,
        description,
        severity,
        photo: photoPath,
        resolved: false,
      },
    });

    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { status: "damaged" },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
