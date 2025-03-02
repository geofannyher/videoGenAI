import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = "https://urbwugtngrqrfmtogdes.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyYnd1Z3RuZ3JxcmZtdG9nZGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NDIzMDEsImV4cCI6MjA1NjAxODMwMX0.ujqHOzNlCzJvRcr4Tda133Q6rD7RAKbhxyyzEakYZHU";

// Supabase client setup
const supabaseUrl = NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Get file from Supabase bucket
    const { data, error } = await supabase.storage
      .from("video")
      .download(`merged/${fileName}`);

    if (error || !data) {
      console.error("Supabase download error:", error);
      return NextResponse.json(
        { success: false, message: "File not found in storage." },
        { status: 404 }
      );
    }

    // Convert blob to buffer
    const buffer = await data.arrayBuffer();

    return new NextResponse(buffer, {
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
