import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    const filename = "SCH-PRC-PRC-09939-R01  Procedure for Supplier Onboarding.pdf"
    const filePath = join(process.cwd(), "worker", "docs", filename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Procedure document not found" }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error serving supplier onboarding procedure:", error)
    return NextResponse.json({ error: "Failed to serve procedure document" }, { status: 500 })
  }
}
