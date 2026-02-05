import "dotenv/config"
import { Bot } from "grammy"
import { closeDb, initDb } from "./db"
import { config } from "./config"
import { registerOnStart } from "./services/registration"
import { registerAllRoutes } from "./bot"
import { persistentKeyboard } from "./bot/replyKeyboard"
import { COMMANDS, REPLY_BUTTONS } from "./bot/commands"

const bot = new Bot(config.botToken)

registerAllRoutes(bot)

bot.command(COMMANDS.START, async (ctx) => {
    const telegramId = ctx.from?.id
    if (!telegramId) return

    const username = ctx.from?.username ?? null
    const firstName = ctx.from?.first_name ?? "друг"

    try {
        const reg = await registerOnStart({ telegramId, username })

        const lines: string[] = []
        lines.push(`Привет, ${firstName}! 👋`)
        lines.push("")

        if (reg.isNewUser) {
            lines.push("✅ Профиль создан")
            lines.push("✅ Твой биатлонист добавлен в сборную")
        } else {
            lines.push("✅ С возвращением! Профиль уже существует")
        }

        lines.push("")
        lines.push("Нажми: 📋 Меню")

        await ctx.reply(lines.join("\n"), {
            reply_markup: persistentKeyboard(),
        })
    } catch (e) {
        console.error("Registration failed:", e)
        await ctx.reply("❌ Не смог создать/обновить профиль. Проверь БД и логи")
    }
})

bot.on("message", async (ctx) => {
    // не спамим, но можно подсказать меню
    if (ctx.message?.text === REPLY_BUTTONS.MENU) return
    await ctx.reply(`Нажми: ${REPLY_BUTTONS.MENU}`, { reply_markup: persistentKeyboard() })
})

bot.catch((err) => {
    console.error("Bot error:", err.error)
})

async function bootstrap() {
    console.log("🗄️  Checking DB connection...")
    await initDb()
    console.log("✅ DB is ready")

    console.log("✅ Bot is starting...")
    await bot.start()
}

process.on("SIGINT", async () => {
    console.log("\n🧹 Shutting down...")
    await closeDb()
    process.exit(0)
})

process.on("SIGTERM", async () => {
    console.log("\n🧹 Shutting down...")
    await closeDb()
    process.exit(0)
})

bootstrap()
