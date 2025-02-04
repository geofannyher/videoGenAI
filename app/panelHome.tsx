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
    kategori: "Opening",
    script:
      "Halo teman-teman! Kamu lagi cari mukena yang nyaman, elegan, dan berkualitas? Yuk, lihat Mukena Dewasa Khadijah dengan bahan katun premium, yang pastinya bikin ibadahmu lebih khusyuk.",
  },
  {
    kategori: "Penjelasan",
    script:
      "Mukena ini hadir dengan bahan katun berkualitas tinggi yang lembut di kulit dan adem, jadi cocok banget untuk digunakan dalam waktu lama. Panjang atasan 120 cm di depan dan 130 cm di belakang, serta rok sepanjang 115 cm dengan lebar 70 cm. Bordir cantik langsung di kain renda menambah kesan mewah, lengkap dengan penutup dagu untuk kenyamanan maksimal. Untuk pilihan, ada kode A, C, dan D dengan bordir, dan kode B serta E tanpa bordir.",
  },
  // {
  //   kategori: "Unboxing",
  //   script:
  //     "Lihat nih, bordirannya langsung di kain renda, bikin tampilannya makin elegan! Bahan katunnya terasa adem di tangan, dan detail desainnya rapi banget. Tali kepala juga ikat, jadi fleksibel dan mudah dipakai. Sayangnya, mukena ini tidak dilengkapi pouch, tapi tetap super praktis untuk dibawa kemana-mana.",
  // },
  // {
  //   kategori: "Penutupan",
  //   script:
  //     "Jangan tunggu lama-lama, yuk pesan sekarang Mukena Dewasa Khadijah! Pesananmu akan dikirim dalam H+1 atau H+2, jadi pastikan kamu memesannya hari ini. Tingkatkan kenyamanan ibadahmu dengan mukena berkualitas ini. Klik tombol pesannya sekarang!",
  // },
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
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTypeVideo = async () => {
    try {
      const res = await fetch("/api/drive", {
        next: {
          revalidate: 600,
        },
      });
      const datas = await res.json();
      console.log("fetched", datas);
      return datas;
    } catch (error) {
      return error;
    }
  };

  const handleMerged = async () => {
    const checkTemp = mp3Urls.length > 1 ? mp3Urls : tempMp3;
    const videoDrive = await handleCheckTypeVideo();

    // cari video sesuai kategori
    const openings = videoDrive.filter(
      (video: IDataDrive) => video.kategori === "Opening"
    );
    const explanations = videoDrive.filter(
      (video: IDataDrive) => video.kategori === "Penjelasan"
    );

    // ambil video sesuai kategori
    const randomOpening = openings[Math.floor(Math.random() * openings.length)];
    const randomExplain =
      explanations[Math.floor(Math.random() * explanations.length)];

    // ambil audio sesuai kategori
    const expmp3 = checkTemp.filter(
      (item: IDataMp3) => item?.kategori == "Penjelasan"
    );
    const opmp3 = checkTemp.filter(
      (item: IDataMp3) => item?.kategori == "Opening"
    );

    // jadikan 1 array
    const tempOpening = [];
    const tempExplain = [];
    tempOpening.push({
      kategori: "opening",
      audioUrl: opmp3[0]?.url,
      // videoUrl: randomOpening?.url,
      videoUrl:
        "https://res.cloudinary.com/dcd1jeldi/video/upload/v1737597524/14385-256955049_tiny_ejfjc2.mp4",
    });
    tempExplain.push({
      kategori: "explain",
      audioUrl: expmp3[0]?.url,
      // videoUrl: randomExplain?.url,
      videoUrl:
        "https://res.cloudinary.com/dcd1jeldi/video/upload/v1737597524/14385-256955049_tiny_ejfjc2.mp4",
    });
    const combineData = [...tempOpening, ...tempExplain];
    const srcVideo = [];
    try {
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
      console.log(error);
    }
  };

  const handleMergeAll = async (videoSrcs: any) => {
    try {
      const res = await axios.post("/api/mergeAll", {
        videoSrcs,
      });
      setStatus(res?.data?.filePath);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <h1>Generate Audio from Scripts</h1>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Generate MP3"}
      </button>

      <div>
        <h2>Generated MP3 URLs:</h2>
        {mp3Urls.length > 0 ? (
          <ul>
            {mp3Urls.map((item, index) => (
              <li key={index}>
                <strong>{item.kategori}:</strong>{" "}
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No MP3 generated yet.</p>
        )}
      </div>

      <div className="pt-10">
        <h1>Temp data after generate mp3 </h1>
        {tempMp3 && (
          <>
            <ul className="space-y-2">
              {tempMp3.map((item: any, index: number) => (
                <li key={index}>
                  <h1 className="font-bold">{item.kategori}:</h1>{" "}
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                </li>
              ))}
            </ul>
            <button
              className="px-4 py-2 mt-4 rounded-lg border border-white hover:bg-gray-50 hover:text-black"
              onClick={handleMerged}
            >
              Merge it!
            </button>
          </>
        )}
      </div>
      {/* {status && (
        <div className="pt-10">
          <video src={""}></video>
        </div>
      )} */}
    </div>
  );
};

export default PanelHome;
