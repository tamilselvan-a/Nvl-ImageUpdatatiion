export interface TranCustRequest {
  vrcAcko: string;
}

export interface TranCustResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>[];
}
