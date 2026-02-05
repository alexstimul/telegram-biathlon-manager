import type { Bot, Context } from "grammy"
import { InlineKeyboard } from "grammy"
import type { RaceType, Strategy } from "../domain/raceConfig"
import { runRaceForTelegramUser } from "../services/race.service"
import { escapeHtml } from "./ui"
import { backToMenuKeyboard } from "./keyboards"
import { CALLBACKS } from "./callbacks"

type RaceDraft = {
    raceType: RaceType | null
    strategy: Strategy | null
}

const raceDraftByChat = new Map<number, RaceDraft>()

function raceTypeKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("🏁 Спринт", CALLBACKS.race.type("sprint"))
        .row()
        .text("🎯 Индивидуальная", CALLBACKS.race.type("individual"))
        .row()
        .text("⬅️ В меню", CALLBACKS.menu.home)
}

function strategyKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("🟢 Safe", CALLBACKS.race.strategy("safe"))
        .text("🟡 Balanced", CALLBACKS.race.strategy("balanced"))
        .text("🔴 Aggressive", CALLBACKS.race.strategy("aggressive"))
        .row()
        .text("⬅️ Назад", CALLBACKS.race.backToType)
        .text("⬅️ В меню", CALLBACKS.menu.home)
}

function confirmKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("▶️ Старт", CALLBACKS.race.go)
        .row()
        .text("⬅️ Назад", CALLBACKS.race.backToStrategy)
        .text("⬅️ В меню", CALLBACKS.menu.home)
}

function getDraft(ctx: Context): RaceDraft {
    const chatId = ctx.chat?.id
    if (!chatId) return { raceType: null, strategy: null }
    const cur = raceDraftByChat.get(chatId) ?? { raceType: null, strategy: null }
    raceDraftByChat.set(chatId, cur)
    return cur
}

function setDraft(ctx: Context, patch: Partial<RaceDraft>) {
    const chatId = ctx.chat?.id
    if (!chatId) return
    const cur = getDraft(ctx)
    raceDraftByChat.set(chatId, { ...cur, ...patch })
}

function renderRaceIntro(): string {
    return ["🏁 <b>Гонка</b>", "", "Выбери дисциплину:"].join("\n")
}

function renderRaceStrategy(raceType: RaceType): string {
    const name = raceType === "sprint" ? "Спринт" : "Индивидуальная"
    return ["🏁 <b>Гонка</b>", "", `Дисциплина: <b>${name}</b>`, "", "Выбери стратегию:"].join(
        "\n",
    )
}

function renderRaceConfirm(raceType: RaceType, strategy: Strategy): string {
    const name = raceType === "sprint" ? "Спринт" : "Индивидуальная"
    return [
        "🏁 <b>Гонка</b>",
        "",
        `Дисциплина: <b>${name}</b>`,
        `Стратегия: <b>${strategy}</b>`,
        "",
        "Готов начать?",
    ].join("\n")
}

export function registerRaceRoutes(bot: Bot) {
    bot.callbackQuery(CALLBACKS.menu.race, async (ctx) => {
        await ctx.answerCallbackQuery()
        setDraft(ctx, { raceType: null, strategy: null })
        await ctx.editMessageText(renderRaceIntro(), {
            parse_mode: "HTML",
            reply_markup: raceTypeKeyboard(),
        })
    })

    bot.callbackQuery(/^race:type:(sprint|individual)$/, async (ctx) => {
        await ctx.answerCallbackQuery()
        const type = ctx.match?.[1] as RaceType
        setDraft(ctx, { raceType: type, strategy: null })

        await ctx.editMessageText(renderRaceStrategy(type), {
            parse_mode: "HTML",
            reply_markup: strategyKeyboard(),
        })
    })

    bot.callbackQuery(/^race:strategy:(safe|balanced|aggressive)$/, async (ctx) => {
        await ctx.answerCallbackQuery()
        const s = ctx.match?.[1] as Strategy
        setDraft(ctx, { strategy: s })

        const d = getDraft(ctx)
        if (!d.raceType) return

        await ctx.editMessageText(renderRaceConfirm(d.raceType, s), {
            parse_mode: "HTML",
            reply_markup: confirmKeyboard(),
        })
    })

    bot.callbackQuery(CALLBACKS.race.backToType, async (ctx) => {
        await ctx.answerCallbackQuery()
        setDraft(ctx, { raceType: null, strategy: null })
        await ctx.editMessageText(renderRaceIntro(), {
            parse_mode: "HTML",
            reply_markup: raceTypeKeyboard(),
        })
    })

    bot.callbackQuery(CALLBACKS.race.backToStrategy, async (ctx) => {
        await ctx.answerCallbackQuery()
        const d = getDraft(ctx)
        if (!d.raceType) {
            await ctx.editMessageText(renderRaceIntro(), {
                parse_mode: "HTML",
                reply_markup: raceTypeKeyboard(),
            })
            return
        }

        setDraft(ctx, { strategy: null })
        await ctx.editMessageText(renderRaceStrategy(d.raceType), {
            parse_mode: "HTML",
            reply_markup: strategyKeyboard(),
        })
    })

    bot.callbackQuery(CALLBACKS.race.go, async (ctx) => {
        await ctx.answerCallbackQuery()

        const telegramId = ctx.from?.id
        if (!telegramId) return

        const d = getDraft(ctx)
        if (!d.raceType || !d.strategy) return

        const result = await runRaceForTelegramUser({
            telegramId,
            raceType: d.raceType,
            strategy: d.strategy,
        })

        const safeLog = escapeHtml(result.log)

        await ctx.editMessageText(
            ["🏁 <b>Результат гонки</b>", "", "<pre>", safeLog, "</pre>"].join("\n"),
            {
                parse_mode: "HTML",
                reply_markup: backToMenuKeyboard(),
            },
        )
    })
}
