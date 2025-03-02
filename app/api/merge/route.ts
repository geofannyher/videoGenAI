import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import os from "os";

const NEXT_PUBLIC_SUPABASE_URL = "https://urbwugtngrqrfmtogdes.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyYnd1Z3RuZ3JxcmZtdG9nZGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NDIzMDEsImV4cCI6MjA1NjAxODMwMX0.ujqHOzNlCzJvRcr4Tda133Q6rD7RAKbhxyyzEakYZHU";

// Supabase client setup
const supabaseUrl = NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Type for handling file upload
export type MergeResponse = {
  success: boolean;
  message: string;
  fileName?: string;
  filePath?: string;
};

// Function to merge audio & video with FFmpeg
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
    // Create temp directory for processing
    const tempDir = path.join(os.tmpdir(), "video-processing");
    await fs.mkdir(tempDir, { recursive: true });

    let videoBuffer, audioBuffer;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Handle JSON request with URLs
      const { videoUrl, audioUrl } = await req.json();

      if (!videoUrl || !audioUrl) {
        return NextResponse.json(
          {
            success: false,
            message: "Both video and audio URLs are required.",
          },
          { status: 400 }
        );
      }

      // Download files from URLs
      const videoResponse = await fetch(videoUrl);
      const audioResponse = await fetch(audioUrl);

      videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
      audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    } else if (contentType.includes("multipart/form-data")) {
      // Handle FormData request with file uploads
      const formData = await req.formData();
      const videoFile = formData.get("video") as File;
      const audioFile = formData.get("audio") as File;

      if (!videoFile || !audioFile) {
        return NextResponse.json(
          {
            success: false,
            message: "Both video and audio files are required.",
          },
          { status: 400 }
        );
      }

      // Convert uploaded files to buffers
      videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported content type. Use JSON or FormData.",
        },
        { status: 400 }
      );
    }

    // Write buffers to temp files
    const videoPath = path.join(tempDir, `video-${Date.now()}.mp4`);
    const audioPath = path.join(tempDir, `audio-${Date.now()}.mp3`);

    await Promise.all([
      fs.writeFile(videoPath, videoBuffer),
      fs.writeFile(audioPath, audioBuffer),
    ]);

    // Create unique output filename
    const outputFileName = `video-${uuidv4()}.mp4`;
    const outputPath = path.join(tempDir, outputFileName);

    // Merge video and audio
    await mergeAudioVideo(videoPath, audioPath, outputPath);

    // Upload to Supabase
    const fileBuffer = await fs.readFile(outputPath);
    const { error } = await supabase.storage
      .from("video")
      .upload(`merged/${outputFileName}`, fileBuffer, {
        contentType: "video/mp4",
        cacheControl: "3600",
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("video")
      .getPublicUrl(`merged/${outputFileName}`);

    // Clean up temp files
    await Promise.all([
      fs.unlink(videoPath),
      fs.unlink(audioPath),
      fs.unlink(outputPath),
    ]).catch((err) => console.error("Cleanup error:", err));

    return NextResponse.json({
      success: true,
      message: `Video and audio merged successfully!`,
      fileName: outputFileName,
      filePath: publicUrlData.publicUrl,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}
