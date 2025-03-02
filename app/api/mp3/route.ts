import { NextResponse } from "next/server";
import { textToSpeech } from "./evelenlabs.service";
import axios from "axios";

export async function POST(req: Request) {
  const { text } = await req.json();

  const response = (await textToSpeech({
    text,
  })) as {
    data: string;
  };
  if (!response) {
    return NextResponse.json("gaada");
  }

  const mainBlob = new Blob([response?.data], {
    type: "audio/mpeg",
  });
  const formData = new FormData();
  formData.append("file", mainBlob);
  formData.append("upload_preset", "testGen");
  const responseCloud = await axios.post(
    `https://api.cloudinary.com/v1_1/dcd1jeldi/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  if (!response) {
    return NextResponse.json("gaada");
  }
  return NextResponse.json({ url: responseCloud?.data?.secure_url });
}
