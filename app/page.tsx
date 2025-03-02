import { cookies } from "next/headers";

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
  const datas = JSON.parse(mp3!.value);
  console.log(datas);
  // return <PanelHome dataMp3={datas} />;
  return <>Hallo</>;
};

export default Home;
