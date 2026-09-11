import axios from "axios";
import { TranCustRequest, TranCustResponse } from "@/types/tran-cust";

export const getTranCust = async (vrcAcko: string, zone: "live" | "dev"): Promise<TranCustResponse> => {
  const payload: TranCustRequest & { zone: string } = { vrcAcko, zone };
  const { data } = await axios.post<TranCustResponse>(
    "/api/cameo/get-tran-cust",
    payload
  );
  return data;
};
