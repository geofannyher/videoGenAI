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

    // Pastikan direktori ada, jika tidak buat direktori
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Cari file yang sudah ada di direktori
    const files = fs.readdirSync(uploadDir);
    const videoCount = files.filter(
      (file) => file.startsWith("video") && file.endsWith(".mp4")
    ).length;

    // Tentukan nama file baru
    const outputFileName = `video${videoCount + 1}.mp4`;
    const outputPathWithSubtitle = path.join(uploadDir, outputFileName);

    // Fungsi untuk menjalankan ffmpeg sebagai Promise
    const mergeAudioVideo = () =>
      new Promise((resolve, reject) => {
        ffmpeg(videoUrl)
          .input(audioUrl)
          .output(outputPathWithSubtitle)
          .outputOptions("-c:v copy") // Salin codec video
          .outputOptions("-c:a aac") // Gunakan codec audio AAC
          .outputOptions("-map 0:v:0") // Map video dari input pertama
          .outputOptions("-map 1:a:0") // Map audio dari input kedua
          .on("end", () => resolve(outputPathWithSubtitle))
          .on("error", (err) => reject(err))
          .run();
      });

    // Tunggu proses ffmpeg selesai
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
