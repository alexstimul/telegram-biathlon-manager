export type AppConfig = {
    botToken: string
    db: {
        host: string
        port: number
        database: string
        user: string
        password: string
        sslMode: "require" | "disable"
    }
    debugCommands: boolean
    defaultCountry: string
}

function must(name: string): string {
    const v = process.env[name]
    if (!v) {
        throw new Error(`Missing env: ${name}`)
    }
    return v
}

function getBool(name: string, def = false): boolean {
    const v = process.env[name]
    if (!v) return def
    return ["1", "true", "yes", "on"].includes(v.toLowerCase())
}

export const config: AppConfig = {
    botToken: must("BOT_TOKEN"),
    db: {
        host: must("PGHOST"),
        port: Number(must("PGPORT")),
        database: must("PGDATABASE"),
        user: must("PGUSER"),
        password: must("PGPASSWORD"),
        sslMode: (process.env.PGSSLMODE ?? "require") as "require" | "disable",
    },
    debugCommands: getBool("DEBUG_COMMANDS", true),
    defaultCountry: process.env.DEFAULT_COUNTRY ?? "RU",
}
