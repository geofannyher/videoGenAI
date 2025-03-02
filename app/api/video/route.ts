import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface videos {
  kategori: string;
  url: string;
  name: string;
}
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json(
      { error: "Type parameter is required" },
      { status: 400 }
    );
  }

  const videoPath = path.join(process.cwd(), "public", "videos", type);
  const videos: videos[] = [];

  try {
    // Read category folders (opening, penjelasan, etc.)
    const categories = fs.readdirSync(videoPath);

    for (const category of categories) {
      const categoryPath = path.join(videoPath, category);

      if (fs.statSync(categoryPath).isDirectory()) {
        const files = fs.readdirSync(categoryPath);

        // Add each video file to the list
        files.forEach((file) => {
          if (file.match(/\.(mp4|mov|avi)$/i)) {
            videos.push({
              kategori: category.charAt(0).toUpperCase() + category.slice(1),
              url: `/videos/${type}/${category}/${file}`,
              name: file,
            });
          }
        });
      }
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error reading video directory:", error);
    return NextResponse.json(
      { error: "Failed to read videos" },
      { status: 500 }
    );
  }
}
