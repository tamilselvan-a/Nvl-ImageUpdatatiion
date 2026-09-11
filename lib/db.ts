import sql from "mssql";

type Zone = "live" | "dev";

const configs: Record<Zone, sql.config> = {
  live: {
    server: process.env.LIVE_DB_SERVER!,
    database: process.env.LIVE_DB_NAME!,
    user: process.env.LIVE_DB_USER!,
    password: process.env.LIVE_DB_PASSWORD!,
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName: process.env.LIVE_DB_INSTANCE,
    },
  },
  dev: {
    server: process.env.DEV_DB_SERVER!,
    database: process.env.DEV_DB_NAME!,
    user: process.env.DEV_DB_USER!,
    password: process.env.DEV_DB_PASSWORD!,
    port: 1433,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      instanceName: process.env.DEV_DB_INSTANCE,
    },
  },
};

const pools: Partial<Record<Zone, sql.ConnectionPool>> = {};

export async function getPool(zone: Zone = "live"): Promise<sql.ConnectionPool> {
  if (!pools[zone]) {
    pools[zone] = await new sql.ConnectionPool(configs[zone]).connect();
  }
  return pools[zone]!;
}
