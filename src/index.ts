import "dotenv/config";
import { Bot } from "grammy";
import { closeDb, initDb } from "./db";
import { registerOnStart } from "./services/registration";

const token = process.env.BOT_TOKEN;

if (!token) {
    console.error("❌ BOT_TOKEN is not set. Create .env and add BOT_TOKEN=...");
    process.exit(1);
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const username = ctx.from?.username ?? null;
    const firstName = ctx.from?.first_name ?? "друг";

    try {
        const reg = await registerOnStart({ telegramId, username });

        const lines: string[] = [];
        lines.push(`Привет, ${firstName}! 👋`);
        lines.push("");

        if (reg.isNewUser) {
            lines.push("✅ Профиль создан.");
            lines.push("✅ Твой биатлонист добавлен в сборную.");
        } else {
            lines.push("✅ С возвращением! Профиль уже сущесвтует.");
        }

        lines.push("");
        lines.push("Следующий шаг: /menu (скоро)");

        await ctx.reply(lines.join("\n"));
    } catch (err) {
        console.error("❌ Registration failed:", err);
        await ctx.reply(
            "Упс, не смог создать / обновить профиль. Проверь подключение к БД и схему таблиц",
        );
    }
});

bot.on("message", async (ctx) => {
    await ctx.reply("Пока я понимаю только /start 🙂");
});

bot.catch((err) => {
    console.error("🔥 Bot error:", err.error);
});

async function bootstrap() {
    try {
        console.log(" Checking DB connection...");
        await initDb();
        console.log("✅ DB is ready");

        console.log("✅ Bot is starting...");
        await bot.start();
    } catch (err) {
        console.error("❌ Startup failed:", err);
        process.exitCode = 1;
    }
}

process.on("SIGINT", async () => {
    console.log("\n Shutting down...");
    await closeDb();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\n Shutting down...");
    await closeDb();
    process.exit(0);
});

bootstrap();
