import type { Bot, Context } from "grammy"
import { mainMenuKeyboard, backToMenuKeyboard } from "./keyboards"
import { renderHomeScreen, renderProfileScreen, renderStubScreen } from "./screens"
import { safeEditOrReply } from "./ui"
import { getProfileByTelegramId } from "../services/profile"
import { COMMANDS, REPLY_BUTTONS } from "./commands"
import { CALLBACKS } from "./callbacks"

type MenuState = {
    messageId: number | null
}

const menuStateByChat = new Map<number, MenuState>()

function getState(chatId: number): MenuState {
    const state = menuStateByChat.get(chatId) ?? { messageId: null }
    menuStateByChat.set(chatId, state)
    return state
}

async function showMenu(ctx: Context, text: string) {
    const chatId = ctx.chat?.id
    if (!chatId) return

    const state = getState(chatId)

    const res = await safeEditOrReply({
        ctx,
        chatId,
        messageId: state.messageId,
        text,
        replyMarkup: mainMenuKeyboard(),
    })

    state.messageId = res.messageId
}

async function editCallback(ctx: Context, text: string, keyboard: any) {
    await ctx.editMessageText(text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
    })
}

export function registerMenuRoutes(bot: Bot) {
    bot.command(COMMANDS.MENU, async (ctx) => {
        await showMenu(ctx, renderHomeScreen())
    })

    bot.hears(REPLY_BUTTONS.MENU, async (ctx) => {
        await showMenu(ctx, renderHomeScreen())
    })

    bot.callbackQuery(CALLBACKS.menu.home, async (ctx) => {
        await ctx.answerCallbackQuery()
        await editCallback(ctx, renderHomeScreen(), mainMenuKeyboard())
    })

    bot.callbackQuery(CALLBACKS.menu.profile, async (ctx) => {
        await ctx.answerCallbackQuery()
        const telegramId = ctx.from?.id
        if (!telegramId) return

        try {
            const profile = await getProfileByTelegramId(telegramId)
            await editCallback(ctx, renderProfileScreen(profile), backToMenuKeyboard())
        } catch {
            await editCallback(
                ctx,
                renderStubScreen("👤 Профиль: не найден. Нажми /start"),
                backToMenuKeyboard(),
            )
        }
    })

    bot.callbackQuery(CALLBACKS.menu.race, async (ctx) => {
        // обработается в race routes
        await ctx.answerCallbackQuery()
    })

    bot.callbackQuery(CALLBACKS.menu.training, async (ctx) => {
        await ctx.answerCallbackQuery()
        await editCallback(ctx, renderStubScreen("🏋️ Тренировка"), backToMenuKeyboard())
    })

    bot.callbackQuery(CALLBACKS.menu.season, async (ctx) => {
        await ctx.answerCallbackQuery()
        await editCallback(ctx, renderStubScreen("📊 Сезон"), backToMenuKeyboard())
    })

    bot.callbackQuery(CALLBACKS.menu.season, async (ctx) => {
        await ctx.answerCallbackQuery()
        await editCallback(ctx, renderStubScreen("ℹ️ Правила"), backToMenuKeyboard())
    })
}
