import { pool } from "../db"

export type ProfileView = {
    manager: {
        level: number
        rating: number
        money: number
    }
    athlete: {
        age: number | null
        country: string | null
        ski_speed: number
        endurance: number
        recovery: number
        accuracy_prone: number
        accuracy_standing: number
        shooting_speed: number
        stress_resistance: number
        focus: number
        consistency: number
        form: number
        fatigue: number
        injury_level: number
    }
}

export async function getProfileByTelegramId(telegramId: number): Promise<ProfileView> {
    const res = await pool.query<{
        level: number
        rating: number
        money: number
        age: number | null
        country: string | null
        ski_speed: number
        endurance: number
        recovery: number
        accuracy_prone: number
        accuracy_standing: number
        shooting_speed: number
        stress_resistance: number
        focus: number
        consistency: number
        form: number
        fatigue: number
        injury_level: number
    }>(
        `
    select
      m.level,
      m.rating,
      m.money,
      a.age,
      a.country,
      a.ski_speed,
      a.endurance,
      a.recovery,
      a.accuracy_prone,
      a.accuracy_standing,
      a.shooting_speed,
      a.stress_resistance,
      a.focus,
      a.consistency,
      a.form,
      a.fatigue,
      a.injury_level
    from public.users u
    join public.managers m on m.user_id = u.id
    join public.athletes a on a.manager_id = m.id
    where u.telegram_id = $1
    limit 1
    `,
        [telegramId]
    )

    const row = res.rows[0]
    if (!row) {
        throw new Error("Profile not found for this telegramId")
    }

    return {
        manager: {
            level: row.level,
            rating: row.rating,
            money: row.money
        },
        athlete: {
            age: row.age,
            country: row.country,
            ski_speed: row.ski_speed,
            endurance: row.endurance,
            recovery: row.recovery,
            accuracy_prone: row.accuracy_prone,
            accuracy_standing: row.accuracy_standing,
            shooting_speed: row.shooting_speed,
            stress_resistance: row.stress_resistance,
            focus: row.focus,
            consistency: row.consistency,
            form: row.form,
            fatigue: row.fatigue,
            injury_level: row.injury_level
        }
    }
}
