import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { spawn } from "child_process";

// Tipe untuk menangani file upload
export type MergeResponse = {
  success: boolean;
  message: string;
  fileName?: string;
  filePath?: string;
};

// Fungsi untuk menangani penggabungan audio & video dengan FFmpeg
const mergeAudioVideo = (
  videoPath: string,
  audioPath: string,
  outputPath: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const process = spawn("ffmpeg", [
      "-i",
      videoPath,
      "-i",
      audioPath,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      outputPath,
    ]);

    process.on("close", (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`FFmpeg exited with error code: ${code}`));
    });

    process.on("error", (err) => {
      reject(new Error(`FFmpeg failed: ${err.message}`));
    });
  });
};

export async function POST(req: Request): Promise<NextResponse<MergeResponse>> {
  try {
    const uploadDir = path.join(process.cwd(), "upload");

    // Pastikan folder upload ada
    await fs.mkdir(uploadDir, { recursive: true });

    // Parsing FormData dari request
    const formData = await req.formData();
    const videoFile = formData.get("video") as File;
    const audioFile = formData.get("audio") as File;

    if (!videoFile || !audioFile) {
      return NextResponse.json(
        { success: false, message: "Both video and audio files are required." },
        { status: 400 }
      );
    }

    // Simpan file ke dalam folder upload
    const videoPath = path.join(uploadDir, videoFile.name);
    const audioPath = path.join(uploadDir, audioFile.name);

    await Promise.all([
      fs.writeFile(videoPath, Buffer.from(await videoFile.arrayBuffer())),
      fs.writeFile(audioPath, Buffer.from(await audioFile.arrayBuffer())),
    ]);

    // Buat output file dengan nama unik
    const files = await fs.readdir(uploadDir);
    const videoCount = files.filter((file) => file.startsWith("video")).length;
    const outputFileName = `video${videoCount + 1}.mp4`;
    const outputPath = path.join(uploadDir, outputFileName);

    // Proses merge video + audio
    await mergeAudioVideo(videoPath, audioPath, outputPath);

    return NextResponse.json({
      success: true,
      message: `Video and audio merged successfully! Saved as ${outputFileName}`,
      fileName: outputFileName,
      filePath: outputPath,
    });
  } catch (error) {
    console.error("Unexpected server error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred on the server.",
      },
      { status: 500 }
    );
  }
}
