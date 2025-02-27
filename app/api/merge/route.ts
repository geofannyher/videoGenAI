import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { videoUrl, audioUrl } = await req.json();

    if (!videoUrl || !audioUrl) {
      return NextResponse.json({
        success: false,
        message: "Both video and audio URLs are required.",
      });
    }

    const uploadDir = `./upload`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Convert relative path to absolute path for video
    const absoluteVideoPath = path.join(process.cwd(), 'public', videoUrl);
    
    // Verify video file exists
    if (!fs.existsSync(absoluteVideoPath)) {
      return NextResponse.json({
        success: false,
        message: `Video file not found at: ${absoluteVideoPath}`,
      });
    }

    const files = fs.readdirSync(uploadDir);
    const videoCount = files.filter(
      (file) => file.startsWith("video") && file.endsWith(".mp4")
    ).length;

    const outputFileName = `video${videoCount + 1}.mp4`;
    const outputPathWithSubtitle = path.join(uploadDir, outputFileName);

    const mergeAudioVideo = () =>
      new Promise((resolve, reject) => {
        ffmpeg(absoluteVideoPath) // Use absolute path here
          .input(audioUrl)
          .output(outputPathWithSubtitle)
          .outputOptions("-c:v copy")
          .outputOptions("-c:a aac")
          .outputOptions("-map 0:v:0")
          .outputOptions("-map 1:a:0")
          .on("end", () => resolve(outputPathWithSubtitle))
          .on("error", (err) => reject(err))
          .run();
      });

    await mergeAudioVideo();

    return NextResponse.json({
      success: true,
      message: `Video and audio merged successfully! Saved as ${outputFileName}`,
      fileName: outputFileName,
      filePath: outputPathWithSubtitle,
    });
  } catch (error: any) {
    console.error("Error processing request:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred.",
    });
  }
}
