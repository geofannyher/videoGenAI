import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { video: string } }
): Promise<NextResponse> {
  try {
    const fileName = params.video;

    if (!fileName) {
      return NextResponse.json(
        { success: false, message: "File name is required." },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "upload", fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "File not found." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching video file:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
