import type { Bot, Context } from "grammy"
import { mainMenuKeyboard, backToMenuKeyboard } from "./keyboards"
import { renderHomeScreen, renderProfileScreen, renderStubScreen } from "./screens"
import { getProfileByTelegramId } from "../services/profile"

type MenuState = {
    chatId: number | null
    messageId: number | null
}

// MVP: храним одно меню на чат в памяти процесса.
// На прод/несколько инстансов позже перенесём в БД.
const menuStateByChat = new Map<number, MenuState>()

async function upsertMenuMessage(ctx: Context, text: string) {
    const chatId = ctx.chat?.id
    if (!chatId) return

    const state = menuStateByChat.get(chatId) ?? { chatId, messageId: null }

    if (state.messageId) {
        try {
            await ctx.api.editMessageText(chatId, state.messageId, text, {
                parse_mode: "Markdown",
                reply_markup: mainMenuKeyboard()
            })
            menuStateByChat.set(chatId, state)
            return
        } catch {
            state.messageId = null
        }
    }

    const msg = await ctx.reply(text, {
        parse_mode: "Markdown",
        reply_markup: mainMenuKeyboard()
    })

    state.messageId = msg.message_id
    menuStateByChat.set(chatId, state)
}

async function editCallbackMessage(ctx: Context, text: string, showBack = true) {
    if (!ctx.callbackQuery?.message) return

    const reply_markup = showBack ? backToMenuKeyboard() : mainMenuKeyboard()

    await ctx.editMessageText(text, {
        parse_mode: "Markdown",
        reply_markup
    })
}

export function registerMenuRoutes(bot: Bot) {
    bot.command("menu", async (ctx) => {
        await upsertMenuMessage(ctx, renderHomeScreen())
    })

    bot.callbackQuery("menu:home", async (ctx) => {
        await ctx.answerCallbackQuery()
        await editCallbackMessage(ctx, renderHomeScreen(), false)
    })

    bot.callbackQuery("menu:profile", async (ctx) => {
        await ctx.answerCallbackQuery()

        const telegramId = ctx.from?.id
        if (!telegramId) return

        try {
            const profile = await getProfileByTelegramId(telegramId)
            await editCallbackMessage(ctx, renderProfileScreen(profile))
        } catch (e) {
            await editCallbackMessage(
                ctx,
                ["*👤 Профиль*", "", "Профиль не найден. Попробуй заново: /start"].join("\n")
            )
        }
    })

    bot.callbackQuery("menu:race", async (ctx) => {
        await ctx.answerCallbackQuery()
        await editCallbackMessage(ctx, renderStubScreen("🏁 Гонка"))
    })

    bot.callbackQuery("menu:training", async (ctx) => {
        await ctx.answerCallbackQuery()
        await editCallbackMessage(ctx, renderStubScreen("🏋️ Тренировка"))
    })

    bot.callbackQuery("menu:season", async (ctx) => {
        await ctx.answerCallbackQuery()
        await editCallbackMessage(ctx, renderStubScreen("📊 Сезон"))
    })

    bot.callbackQuery("menu:rules", async (ctx) => {
        await ctx.answerCallbackQuery()
        await editCallbackMessage(ctx, renderStubScreen("ℹ️ Правила"))
    })

    bot.hears("Меню", async (ctx) => {
        await upsertMenuMessage(ctx, renderHomeScreen())
    })
}
