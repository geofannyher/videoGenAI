"use server";

import { cookies } from "next/headers";
export interface IDataMp3 {
  kategori: string;
  url: string;
}
export async function saveMp3(data: IDataMp3[]) {
  const cookieStore = await cookies();
  const jsonData = JSON.stringify(data);
  cookieStore.set("dataMp3", jsonData);
}
