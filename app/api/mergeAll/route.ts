import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { videoSrcs } = await req.json();

    if (!Array.isArray(videoSrcs) || videoSrcs.length === 0) {
      return NextResponse.json({
        success: false,
        message: "A list of video sources (src) is required.",
      });
    }

    // Direktori tempat video disimpan
    const videoDir = path.resolve("./upload");
    // Direktori untuk output video
    const outputDir = path.resolve("./final");
    // Direktori sementara untuk proses merge
    const tempDir = path.resolve("./temp");

    // cek direktori output dan temp ada
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // inputan src req
    const videoPaths = videoSrcs.map((src) => {
      const videoPath = path.join(videoDir, path.basename(src));
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }
      return videoPath;
    });

    // output name
    const outputFileName = `merged_video_${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputFileName);

    // Gabungkan video
    await new Promise((resolve, reject) => {
      const ffmpegCommand = ffmpeg();
      videoPaths.forEach((video) => {
        ffmpegCommand.input(video);
      });
      ffmpegCommand
        .on("end", resolve)
        .on("error", reject)
        // Tambahkan direktori sementara
        .mergeToFile(outputPath, tempDir);
    });

    return NextResponse.json({
      success: true,
      message: `Videos merged successfully! Saved as ${outputFileName}`,
      fileName: outputFileName,
      filePath: outputPath,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      });
    }
  }
}
