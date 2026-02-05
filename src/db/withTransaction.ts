import type { PoolClient } from "pg"
import { pool } from "../db"

export async function withTransaction<T>(
    fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
    const client = await pool.connect()

    try {
        await client.query("begin")
        const res = await fn(client)
        await client.query("commit")
        return res
    } catch (e) {
        await client.query("rollback")
        throw e
    } finally {
        client.release()
    }
}
