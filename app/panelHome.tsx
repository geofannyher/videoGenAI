"use client";

import axios from "axios";
import { useState } from "react";
import { saveMp3 } from "./utils/saveMp3";
export interface IDataMp3 {
  kategori: string;
  url: string;
}

export interface IDataDrive {
  kategori: string;
  id: string;
  name: string;
  url: string;
}

const output = [
  {
    tipe: "mukena",
    kategori: "demo",
    script:
      "Halo teman-teman! Kamu lagi cari mukena yang nyaman, elegan, dan berkualitas? Yuk, lihat Mukena Dewasa Khadijah dengan bahan katun premium, yang pastinya bikin ibadahmu lebih khusyuk.",
  },
  {
    tipe: "mukena",
    kategori: "penjelasan",
    script:
      "Mukena ini hadir dengan bahan katun berkualitas tinggi yang lembut di kulit dan adem, jadi cocok banget untuk digunakan dalam waktu lama. Panjang atasan 120 cm di depan dan 130 cm di belakang, serta rok sepanjang 115 cm dengan lebar 70 cm. Bordir cantik langsung di kain renda menambah kesan mewah, lengkap dengan penutup dagu untuk kenyamanan maksimal. Untuk pilihan, ada kode A, C, dan D dengan bordir, dan kode B serta E tanpa bordir.",
  },
  {
    tipe: "mukena",
    kategori: "opening",
    script:
      "Mukena ini hadir dengan bahan katun berkualitas tinggi yang lembut di kulit dan adem, jadi cocok banget untuk digunakan dalam waktu lama. Panjang atasan 120 cm di depan dan 130 cm di belakang, serta rok se",
  },
  {
    tipe: "mukena",
    kategori: "penutup",
    script:
      "Mukena ini hadir dengan bahan katun berkualitas tinggi yang lembut di kulit dan adem, jadi cocok banget untuk digunakan dalam waktu lama. Panjang atasan 120 cm di depan dan 130 cm di belakang, serta rok se",
  },
];
const PanelHome = (props?: { dataMp3: IDataMp3 }) => {
  const tempMp3: any = props?.dataMp3;
  const [mp3Urls, setMp3Urls] = useState<IDataMp3[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    const urls = [];

    try {
      for (const item of output) {
        const resmp3 = await axios.post("/api/mp3", {
          text: item?.script,
        });
        if (resmp3) {
          urls.push({
            kategori: item.kategori,
            url: resmp3?.data?.url as string,
          });
        }
      }
      saveMp3(urls);
      setMp3Urls(urls);
    } catch (err) {
      console.error("Error processing scripts:", err);
    }
    setLoading(false);
  };
  const handleCheckTypeVideo = async (tipe: string) => {
    try {
      const res = await fetch(`/api/video?type=${tipe}`, {
        next: {
          revalidate: 600,
        },
      });
      const datas = await res.json();
      return datas;
    } catch (error) {
      return error;
    }
  };
  // const handleCheckTypeVideo = async () => {
  //   try {
  //     const res = await fetch("/api/drive", {
  //       next: {
  //         revalidate: 600,
  //       },
  //     });
  //     const datas = await res.json();
  //     console.log("fetched", datas);
  //     return datas;
  //   } catch (error) {
  //     return error;
  //   }
  // };

  // const handleMerged = async () => {
  //   setLoading(true);
  //   const checkTemp = mp3Urls.length > 1 ? mp3Urls : tempMp3;
  //   // const videoDrive = await handleCheckTypeVideo();
  //   // if (videoDrive?.status === 500) {
  //   //   console.log(videoDrive?.message?.response?.data?.error_description);
  //   //   setLoading(false);
  //   // }
  //   // cari video sesuai kategori
  //   // const openings = videoDrive.filter(
  //   //   (video: IDataDrive) => video.kategori === "Opening"
  //   // );
  //   // const explanations = videoDrive.filter(
  //   //   (video: IDataDrive) => video.kategori === "Penjelasan"
  //   // );

  //   // ambil video sesuai kategori
  //   // const randomOpening = openings[Math.floor(Math.random() * openings.length)];
  //   // const randomExplain =
  //   //   explanations[Math.floor(Math.random() * explanations.length)];

  //   // ambil audio sesuai kategori
  //   const expmp3 = checkTemp.filter(
  //     (item: IDataMp3) => item?.kategori == "Penjelasan"
  //   );
  //   const opmp3 = checkTemp.filter(
  //     (item: IDataMp3) => item?.kategori == "Opening"
  //   );

  //   // jadikan 1 array
  //   const tempOpening = [];
  //   const tempExplain = [];
  //   tempOpening.push({
  //     kategori: "opening",
  //     audioUrl: opmp3[0]?.url,
  //     // videoUrl: randomOpening?.url,
  //     videoUrl:
  //       "https://res.cloudinary.com/dcd1jeldi/video/upload/v1737597524/14385-256955049_tiny_ejfjc2.mp4",
  //   });
  //   tempExplain.push({
  //     kategori: "explain",
  //     audioUrl: expmp3[0]?.url,
  //     // videoUrl: randomExplain?.url,
  //     videoUrl:
  //       "https://res.cloudinary.com/dcd1jeldi/video/upload/v1737597524/14385-256955049_tiny_ejfjc2.mp4",
  //   });
  //   const combineData = [...tempOpening, ...tempExplain];
  //   const srcVideo = [];
  //   try {
  //     for (const item of combineData) {
  //       const res = await axios.post("/api/merge", {
  //         audioUrl: item?.audioUrl,
  //         videoUrl: item?.videoUrl,
  //       });
  //       srcVideo.push(res?.data?.filePath);
  //     }
  //     console.log(srcVideo);
  //     handleMergeAll(srcVideo);
  //   } catch (error) {
  //     setLoading(false);

  //     console.log(error);
  //   }
  // };

  const handleMerged = async () => {
    setLoading(true);
    const checkTemp = mp3Urls.length > 1 ? mp3Urls : tempMp3;

    try {
      const videoPaths = await handleCheckTypeVideo(output[0].tipe);
      // Filter videos by each category
      const openings = videoPaths.filter(
        (video: any) => video.kategori === "Opening"
      );
      const demos = videoPaths.filter(
        (video: any) => video.kategori === "Demo"
      );
      const explanations = videoPaths.filter(
        (video: any) => video.kategori === "Penjelasan"
      );
      const closings = videoPaths.filter(
        (video: any) => video.kategori === "Penutup"
      );

      // Get audio files for each category
      const openingMp3 = checkTemp.filter(
        (item: IDataMp3) => item?.kategori === "opening"
      );
      const demoMp3 = checkTemp.filter(
        (item: IDataMp3) => item?.kategori === "demo"
      );
      const explanationMp3 = checkTemp.filter(
        (item: IDataMp3) => item?.kategori === "penjelasan"
      );
      const closingMp3 = checkTemp.filter(
        (item: IDataMp3) => item?.kategori === "penutup"
      );

      // Arrays for each category
      const tempOpening = [];
      const tempDemo = [];
      const tempExplanation = [];
      const tempClosing = [];

      // Random video selection for each category
      const randomOpening =
        openings[Math.floor(Math.random() * openings.length)];
      const randomDemo = demos[Math.floor(Math.random() * demos.length)];
      const randomExplanation =
        explanations[Math.floor(Math.random() * explanations.length)];
      const randomClosing =
        closings[Math.floor(Math.random() * closings.length)];

      // Push video and audio pairs for each category
      tempOpening.push({
        kategori: "opening",
        audioUrl: openingMp3[0]?.url,
        videoUrl: randomOpening?.url,
      });

      tempDemo.push({
        kategori: "demo",
        audioUrl: demoMp3[0]?.url,
        videoUrl: randomDemo?.url,
      });

      tempExplanation.push({
        kategori: "penjelasan",
        audioUrl: explanationMp3[0]?.url,
        videoUrl: randomExplanation?.url,
      });

      tempClosing.push({
        kategori: "penutup",
        audioUrl: closingMp3[0]?.url,
        videoUrl: randomClosing?.url,
      });

      // Combine all videos in sequence
      const combineData = [
        ...tempOpening,
        ...tempDemo,
        ...tempExplanation,
        ...tempClosing,
      ];
      const srcVideo = [];
      for (const item of combineData) {
        const res = await axios.post("/api/merge", {
          audioUrl: item?.audioUrl,
          videoUrl: item?.videoUrl,
        });
        srcVideo.push(res?.data?.filePath);
      }

      console.log(srcVideo);
      handleMergeAll(srcVideo);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  const handleMergeAll = async (videoSrcs: any) => {
    try {
      const res = await axios.post("/api/mergeAll", {
        videoSrcs,
      });
      setStatus(res?.data?.filePath);
      setLoading(false);
    } catch (error) {
      setLoading(false);

      console.log(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Generate Audio from Scripts</h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-xs hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Generate MP3"}
        </button>

        <div className="mt-6">
          <h2 className="text-sm font-semibold mb-3">Generated MP3 URLs:</h2>
          {mp3Urls.length > 0 ? (
            <ul className="space-y-3">
              {mp3Urls.map((item, index) => (
                <li key={index} className="bg-gray-700 p-4 rounded-lg">
                  <strong className="text-blue-400">{item.kategori}:</strong>{" "}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 break-all"
                  >
                    {item.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-xs">No MP3 generated yet.</p>
          )}
        </div>
      </div>

      {tempMp3 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Generated MP3 Files</h1>
          <ul className="space-y-3">
            {tempMp3.map((item: any, index: number) => (
              <li key={index} className="bg-gray-700 p-4 rounded-lg">
                <h1 className="text-blue-400 text-sm font-semibold mb-2">
                  {item.kategori}:
                </h1>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-xs hover:text-blue-300 break-all"
                >
                  {item.url}
                </a>
              </li>
            ))}
          </ul>
          <button
            className="mt-6 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleMerged}
            disabled={loading}
          >
            {loading ? "Processing..." : "Merge Files"}
          </button>
        </div>
      )}

      {status && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Final Video</h2>
          <video controls className="w-full rounded-lg" src={status} />
        </div>
      )}
    </div>
  );
};

export default PanelHome;
