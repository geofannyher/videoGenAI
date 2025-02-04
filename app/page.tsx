import { cookies } from "next/headers";
import PanelHome, { IDataMp3 } from "./panelHome";
import axios from "axios";

const Home = async () => {
  const cookieStore = await cookies();
  // const data = await fetch("http://localhost:3000/api/drive", {
  //   method: "GET",
  // });
  // console.log(data);
  const mp3 = cookieStore.get("dataMp3");
  if (!mp3?.value) {
    console.log("gaada");
    return;
  }

  const res = await axios.get(
    "https://a3df-103-134-246-102.ngrok-free.app/payment-gateway/getavailablepaymentmethod/all"
  );
  console.log(res?.data);
  const datas = JSON.parse(mp3!.value);
  return <PanelHome dataMp3={datas} />;
};

export default Home;
