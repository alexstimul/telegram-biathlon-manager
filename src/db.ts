import { Pool } from "pg";

function must(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.error(`❌ ${name} is not set. Add it to .env`);
        process.exit(1);
    }

    return value;
}

export const pool = new Pool({
    host: must("PGHOST"),
    port: Number(must("PGPORT")),
    database: must("PGDATABASE"),
    user: must("PGUSER"),
    password: must("PGPASSWORD"),
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
});

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
