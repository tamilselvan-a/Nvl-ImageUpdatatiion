import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { getPool } from "@/lib/db";

const CREATE_SP = `
CREATE PROCEDURE [dbo].[Usp_CAMEO_GetTranCust]
  @vrcAcko VARCHAR(50) = NULL
AS
BEGIN
  DECLARE @m_FinalErr VARCHAR(1000)
  DECLARE @Module CHAR(1)
  SET @Module = SUBSTRING(@vrcAcko, 1, 1)
  SET NOCOUNT ON;

  BEGIN TRY
    BEGIN TRANSACTION

    CREATE TABLE #getcodes (code VARCHAR(30), Status VARCHAR(100))

    IF (@Module = 'T')
    BEGIN
      INSERT INTO #getcodes (code, Status)
      SELECT custcode, 'First Applicant' FROM idep_applnentry WITH (NOLOCK) WHERE trno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.Code, 'First Applicant Guardian'
      FROM idep_applnentry a WITH (NOLOCK)
      JOIN Igen_CustGuardianDetails b WITH (NOLOCK) ON a.cust_fk = b.MinorCust_FK
      WHERE trno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.Jholder_ID, 'Joint Applicant' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM idep_applnentry a WITH (NOLOCK)
      JOIN idep_joinholder b WITH (NOLOCK) ON a.pk_id = b.appn_fk
      WHERE trno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.JHGuardian_ID, 'Joint Applicant Guardian' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM idep_applnentry a WITH (NOLOCK)
      JOIN idep_joinholder b WITH (NOLOCK) ON a.pk_id = b.appn_fk
      WHERE trno = @vrcAcko AND ISNULL(b.JHGuardian_ID, '') <> '' AND ISNULL(b.Jholder_ID, '') <> ''

      INSERT INTO #getcodes (code, Status)
      SELECT KartaID, 'Karta Customer'
      FROM idep_applnentry a WITH (NOLOCK)
      JOIN igen_custinfo_h b WITH (NOLOCK) ON a.custcode = b.code
      WHERE trno = @vrcAcko AND ISNULL(b.KartaID, '') <> ''

      INSERT INTO #getcodes (code, Status)
      SELECT POA_Custid, 'POA Applicant' FROM idep_applnentry WITH (NOLOCK)
      WHERE trno = @vrcAcko AND ISNULL(POA_Custid, '') <> ''

      INSERT INTO #getcodes (code, Status)
      SELECT LOA_Custid, 'LOA Applicant' FROM idep_applnentry WITH (NOLOCK)
      WHERE trno = @vrcAcko AND ISNULL(LOA_Custid, '') <> ''

      INSERT INTO #getcodes (code, Status)
      SELECT B.Code, 'BO Customer' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM idep_applnentry a WITH (NOLOCK)
      JOIN igen_bodetails b WITH (NOLOCK) ON a.cust_fk = b.NI_Cust_FK
      WHERE trno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.Code, 'AS Customer' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM idep_applnentry a WITH (NOLOCK)
      JOIN igen_asdetails b WITH (NOLOCK) ON a.cust_fk = b.NI_Cust_FK
      WHERE trno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.Code, 'Sole Customer' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM idep_applnentry a WITH (NOLOCK)
      JOIN IGen_CustSolePropDtls b WITH (NOLOCK) ON a.cust_fk = b.NI_Cust_FK
      WHERE trno = @vrcAcko
    END

    IF (@Module = 'F')
    BEGIN
      INSERT INTO #getcodes (code, Status)
      SELECT custcode, 'First Applicant' FROM ifip_applnentry WITH (NOLOCK) WHERE ackno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.Code, 'First Applicant Guardian'
      FROM ifip_applnentry a WITH (NOLOCK)
      JOIN Igen_CustGuardianDetails b WITH (NOLOCK) ON a.cust_fk = b.MinorCust_FK
      WHERE ackno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.Jholder_ID, 'Joint Applicant' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM IFIP_ApplnEntry a WITH (NOLOCK)
      JOIN IFIP_JoinHolder b WITH (NOLOCK) ON a.pk_id = b.appn_fk
      WHERE ackno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.JHGuardian_ID, 'Joint Applicant Guardian' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM IFIP_ApplnEntry a WITH (NOLOCK)
      JOIN IFIP_JoinHolder b WITH (NOLOCK) ON a.pk_id = b.appn_fk
      WHERE ackno = @vrcAcko AND ISNULL(b.JHGuardian_ID, '') <> '' AND ISNULL(b.Jholder_ID, '') <> ''

      INSERT INTO #getcodes (code, Status)
      SELECT KartaID, 'Karta Customer'
      FROM ifip_applnentry a WITH (NOLOCK)
      JOIN igen_custinfo_h b WITH (NOLOCK) ON a.custcode = b.code
      WHERE ackno = @vrcAcko AND ISNULL(b.KartaID, '') <> ''

      INSERT INTO #getcodes (code, Status)
      SELECT POA_Custid, 'POA Applicant' FROM ifip_applnentry WITH (NOLOCK)
      WHERE ackno = @vrcAcko AND ISNULL(POA_Custid, '') <> ''

      INSERT INTO #getcodes (code, Status)
      SELECT LOA_Custid, 'LOA Applicant' FROM ifip_applnentry WITH (NOLOCK)
      WHERE ackno = @vrcAcko AND ISNULL(LOA_Custid, '') <> ''

      INSERT INTO #getcodes (code, Status)
      SELECT B.Code, 'BO Customer' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM ifip_applnentry a WITH (NOLOCK)
      JOIN igen_bodetails b WITH (NOLOCK) ON a.cust_fk = b.NI_Cust_FK
      WHERE ackno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.Code, 'AS Customer' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM ifip_applnentry a WITH (NOLOCK)
      JOIN igen_asdetails b WITH (NOLOCK) ON a.cust_fk = b.NI_Cust_FK
      WHERE ackno = @vrcAcko

      INSERT INTO #getcodes (code, Status)
      SELECT B.Code, 'Sole Customer' + CAST(ROW_NUMBER() OVER (PARTITION BY A.pk_id ORDER BY B.pk_id DESC) AS VARCHAR(10))
      FROM ifip_applnentry a WITH (NOLOCK)
      JOIN IGen_CustSolePropDtls b WITH (NOLOCK) ON a.cust_fk = b.NI_Cust_FK
      WHERE ackno = @vrcAcko
    END

    SELECT DISTINCT code INTO #imgup FROM #getcodes

    UPDATE CAMEO_FileSave
    SET FolderPath = 'Cameoimages_1\TP1900000225_Old certificate_0'
    WHERE DOC_Hdr_Fk IN (
      SELECT PK_ID FROM CAMEO_DocumentDetails WITH (NOLOCK)
      WHERE custcode IN (SELECT code FROM #imgup)
    ) AND ISNULL(FolderPath, '') <> ''

    UPDATE IGen_CustInfo_h
    SET CorrEMail = 'unodevpinv@novactech.in', CorrMobile = '9999999999'
    WHERE Code IN (SELECT code FROM #imgup)

    SELECT * FROM #getcodes

    COMMIT TRANSACTION
  END TRY
  BEGIN CATCH
    SELECT @m_FinalErr = ERROR_MESSAGE()
    RAISERROR(@m_FinalErr, 16, 1)
    ROLLBACK TRANSACTION
    RETURN -1
  END CATCH

  SET NOCOUNT OFF;
END
`;

async function ensureSP(pool: sql.ConnectionPool) {
  const check = await pool
    .request()
    .query(`SELECT 1 FROM sys.objects WHERE type = 'P' AND name = 'Usp_CAMEO_GetTranCust'`);

  if (check.recordset.length === 0) {
    await pool.request().batch(CREATE_SP);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { vrcAcko, zone = "live" } = await req.json();

    if (!vrcAcko) {
      return NextResponse.json({ success: false, message: "vrcAcko is required" }, { status: 400 });
    }

    const pool = await getPool(zone);
    await ensureSP(pool);

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
