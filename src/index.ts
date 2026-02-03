import "dotenv/config";
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN is not set. Create .env and add BOT_TOKEN=...");
  process.exit(1);
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  const firstName = ctx.from?.first_name ?? "друг";
  await ctx.reply(
    [
      `Привет, ${firstName}! 👋`,
      "",
      "Это Biathlon Manager (MVP).",
      "Дальше добавим: профиль, характеристики, тренировки и симуляцию гонок.",
      "",
      "Напиши /menu (скоро) или просто жми /start 🙂"
    ].join("\n")
  );
});

// базовый health-check для логов
bot.on("message", async (ctx) => {
  await ctx.reply("Пока я понимаю только /start 🙂");
});

bot.catch((err) => {
  console.error("🔥 Bot error:", err.error);
});

console.log("✅ Bot is starting...");
await bot.start();
