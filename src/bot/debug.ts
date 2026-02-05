import type { Bot } from "grammy"
import { InlineKeyboard } from "grammy"
import { resetProfileByTelegramId } from "../services/reset"
import { persistentKeyboard } from "./replyKeyboard"
import { config } from "../config"
import { COMMANDS } from "./commands"
import { CALLBACKS } from "./callbacks"

function resetKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("✅ Да, удалить", "debug:reset:confirm")
        .text("❌ Отмена", "debug:reset:cancel")
}

export function registerDebugRoutes(bot: Bot) {
    if (!config.debugCommands) return

    bot.command(COMMANDS.RESET, async (ctx) => {
        await ctx.reply(
            [
                "⚠️ *Сброс профиля*",
                "",
                "Это удалит твоего менеджера и спортсмена из базы.",
                "После этого можно снова пройти регистрацию через /start.",
                "",
                "Подтвердить?",
            ].join("\n"),
            {
                parse_mode: "Markdown",
                reply_markup: resetKeyboard(),
            },
        )
    })

    bot.callbackQuery(CALLBACKS.debug.resetCancel, async (ctx) => {
        await ctx.answerCallbackQuery()
        await ctx.editMessageText("Ок, отменил", { reply_markup: undefined })
    })

    bot.callbackQuery(CALLBACKS.debug.resetConfirm, async (ctx) => {
        await ctx.answerCallbackQuery()

        const telegramId = ctx.from?.id
        if (!telegramId) return

        try {
            const res = await resetProfileByTelegramId(telegramId)
            await ctx.editMessageText(`✅ ${res.message}`, { reply_markup: undefined })
            await ctx.reply("Нажми /start чтобы создать профиль заново", {
                reply_markup: persistentKeyboard(),
            })
        } catch (e) {
            console.error("Reset failed:", e)
            await ctx.editMessageText(
                "❌ Не удалось удалить профиль. Проверь логи сервера и доступ к БД",
                { reply_markup: undefined },
            )
        }
    })
}
