import { google } from "googleapis";
import { NextResponse } from "next/server";

// Handler API
export async function GET(req: Request) {
  const client_id =
    "148956138712-ajoslb9n944npvvovs4ul6t2gpcuv6ur.apps.googleusercontent.com";
  const redirecturl = "https://developers.google.com/oauthplayground";
  const client_secret = "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";
  const refreshToken =
    "1//04tT7Kt8N1LIiCgYIARAAGAQSNwF-L9Ir7JVFOnJArcbOEtbjGMgT5frZnbyybEItXADQ04kJK44AvbBWDy22UaBqv3uLE40UGWo";
  try {
    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirecturl
    );
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });
    // Folder ID Google Drive
    const folderOpening = "1wSCPvg5gNcVsLu0mtU1lMdG0TEIU1BGN";
    const folderExplain = "1cXczYQdsfVb7AQitQzv7pw1tP8K_Dwet";

    // Ambil daftar file dari folder
    const resOpening = await drive.files.list({
      q: `'${folderOpening}' in parents`,
      fields: "files(id, name)",
    });
    const resExplain = await drive.files.list({
      q: `'${folderExplain}' in parents`,
      fields: "files(id, name)",
    });

    if (resOpening?.data?.files && resExplain.data?.files) {
      // // Format file menjadi array dengan URL
      const fileOp = resExplain.data.files.map((file) => ({
        kategori: "Opening",
        id: file.id,
        name: file.name,
        url: `https://drive.google.com/uc?export=download&id=${file.id}`,
      }));
      const fileEx = resOpening.data.files.map((file) => ({
        kategori: "Penjelasan",
        id: file.id,
        name: file.name,
        url: `https://drive.google.com/uc?export=download&id=${file.id}`,
      }));
      const combinedFiles = [...fileOp, ...fileEx];

      return NextResponse.json(combinedFiles);
    } else {
      return NextResponse.json({ msg: "err" });
    }
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({
      status: 500,
      message: error,
    });
  }
}
