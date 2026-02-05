import type { PoolClient } from "pg"
import { pool } from "../db"

type RegistrationResult = {
    isNewUser: boolean
    userId: string
    managerId: string
    athleteId: string
}

function clamp(min: number, max: number, value: number): number {
    return Math.max(min, Math.min(value, max))
}

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateAthleteSeedStats() {
    // MVP: стартовые статы вокруг 50 с небольшим разбором, чтобы не было дизбаланса
    const base = 50
    const spread = 8

    const stat = () => clamp(35, 65, base + randInt(-spread, spread))

    return {
        age: randInt(18, 24),
        country: "RUS",
        ski_speed: stat(),
        endurance: stat(),
        recovery: stat(),
        accuracy_prone: stat(),
        accuracy_standing: stat(),
        shooting_speed: stat(),
        stress_resistance: stat(),
        focus: stat(),
        consistency: stat(),
        form: clamp(40, 60, 50 + randInt(-6, 6)),
        fatigue: 0,
        injury_level: 0
    }
}

async function ensureUser(
    client: PoolClient,
    telegramId: number,
    username: string | null
) {
    const res = await client.query<{
        id: string
        inserted: boolean
    }>(
        `
    insert into public.users (telegram_id, username)
    values ($1, $2)
    on conflict (telegram_id) do update
      set username = excluded.username
    returning id, (xmax = 0) as inserted
    `,
        [telegramId, username]
    )

    const row = res.rows[0]
    if (!row) throw new Error("Failed to upsert user")

    return { userId: row.id, isNewUser: row.inserted }
}

async function ensureManager(client: PoolClient, userId: string) {
    const res = await client.query<{ id: string }>(
        `
    insert into public.managers (user_id, level, rating, money)
    values ($1, 1, 0, 0)
    on conflict (user_id) do update
      set user_id = excluded.user_id
    returning id
    `,
        [userId]
    )

    const row = res.rows[0]
    if (!row) throw new Error("Failed to upsert manager")

    return { managerId: row.id }
}

async function ensureAthlete(client: PoolClient, managerId: string) {
    const seed = generateAthleteSeedStats()

    const res = await client.query<{ id: string }>(
        `
    insert into public.athletes (
      manager_id, age, country,
      ski_speed, endurance, recovery,
      accuracy_prone, accuracy_standing, shooting_speed, stress_resistance,
      focus, consistency,
      form, fatigue, injury_level
    )
    values (
      $1, $2, $3,
      $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12,
      $13, $14, $15
    )
    on conflict (manager_id) do update
      set manager_id = excluded.manager_id
    returning id
    `,
        [
            managerId,
            seed.age,
            seed.country,
            seed.ski_speed,
            seed.endurance,
            seed.recovery,
            seed.accuracy_prone,
            seed.accuracy_standing,
            seed.shooting_speed,
            seed.stress_resistance,
            seed.focus,
            seed.consistency,
            seed.form,
            seed.fatigue,
            seed.injury_level
        ]
    )

    const row = res.rows[0]
    if (!row) throw new Error("Failed to upsert athlete")

    return { athleteId: row.id }
}

export async function registerOnStart(params: {
    telegramId: number
    username: string | null
}): Promise<RegistrationResult> {
    const client = await pool.connect()

    try {
        await client.query("begin")

        const { userId, isNewUser } = await ensureUser(
            client,
            params.telegramId,
            params.username
        )

        const { managerId } = await ensureManager(client, userId)
        const { athleteId } = await ensureAthlete(client, managerId)

        await client.query("commit")

        return { isNewUser, userId, managerId, athleteId }
    } catch (e) {
        await client.query("rollback")
        throw e
    } finally {
        client.release()
    }
}
