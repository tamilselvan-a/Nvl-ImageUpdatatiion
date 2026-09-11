import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { vrcAcko, zone = "live" } = await req.json();

    if (!vrcAcko) {
      return NextResponse.json({ success: false, message: "vrcAcko is required" }, { status: 400 });
    }

    const pool = await getPool(zone);
    const result = await pool
      .request()
      .input("vrcAcko", sql.VarChar(50), vrcAcko)
      .execute("Usp_CAMEO_GetTranCust");

    const data = result.recordset ?? [];

    return NextResponse.json({
      success: true,
      message: `Fetched ${data.length} record(s) for ${vrcAcko}`,
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
