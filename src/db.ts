import { Pool } from "pg";
import { config } from "./config";

export const pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    ssl: config.db.sslMode === "require" ? { rejectUnauthorized: false } : undefined,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
})

async function tableExist(tableName: string): Promise<boolean> {
    const res = await pool.query<{ reg: string | null }>(
        "select to_regclass($1) as reg",
        [`public.${tableName}`],
    );

    return res.rows[0]?.reg !== null;
}

export async function initDb(): Promise<void> {
    await pool.query("select 1 as ok");

    const requiredTables = ["users", "managers", "athletes"];

    const missing: string[] = [];
    for (const tableName of requiredTables) {
        const exists = await tableExist(tableName);
        if (!exists) {
            missing.push(tableName);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required table: ${missing.join(", ")}. Create them in Supabase Table Editor (public schema)`,
        );
    }
}

export async function closeDb(): Promise<void> {
    await pool.end();
}
