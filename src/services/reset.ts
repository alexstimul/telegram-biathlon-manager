import type { PoolClient } from "pg"
import { pool } from "../db"

type ResetResult = {
    ok: boolean
    message: string
}

async function safeQuery(client: PoolClient, sql: string, params: unknown[] = []) {
    try {
        await client.query(sql, params)
    } catch (e: any) { // todo any убрать
        // undefined_table (например, если race_results ещё не создавали)
        if (e?.code === "42P01") {
            return
        }
        throw e
    }
}

export async function resetProfileByTelegramId(telegramId: number): Promise<ResetResult> {
    const client = await pool.connect()

    try {
        await client.query("begin")

        const found = await client.query<{
            user_id: string
            manager_id: string | null
        }>(
            `
            select
                u.id as user_id,
                m.id as manager_id
            from public.users u
            left join public.managers m on m.user_id = u.id
            where u.telegram_id = $1
            limit 1
            `,
            [telegramId],
        )

        const row = found.rows[0]
        if (!row) {
            await client.query("rollback")
            return { ok: false, message: "Профиль не найден" }
        }

        if (row.manager_id) {
            // если таблиц ещё нет — не упадём
            await safeQuery(
                client,
                "delete from public.race_results where manager_id = $1",
                [row.manager_id],
            )

            await client.query("delete from public.athletes where manager_id = $1", [row.manager_id])
            await client.query("delete from public.managers where id = $1", [row.manager_id])
        }

        await client.query("delete from public.users where id = $1", [row.user_id])

        await client.query("commit")
        return { ok: true, message: "Профиль удалён. Можешь заново пройти /start" }
    } catch (e) {
        await client.query("rollback")
        throw e
    } finally {
        client.release()
    }
}
