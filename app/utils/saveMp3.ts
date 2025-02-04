"use server";

import { cookies } from "next/headers";
import { IDataMp3 } from "../panelHome";

export async function saveMp3(data: IDataMp3[]) {
  const cookieStore = await cookies();
  const jsonData = JSON.stringify(data);
  cookieStore.set("dataMp3", jsonData);
}
