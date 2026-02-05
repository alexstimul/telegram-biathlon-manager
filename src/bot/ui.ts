import type { Context } from "grammy"

export function escapeHtml(input: string): string {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
}

export async function safeEditOrReply(params: {
    ctx: Context
    chatId: number
    messageId?: number | null
    text: string
    replyMarkup?: any // todo any убрать по возможности
}) {
    const { ctx, chatId, messageId, text, replyMarkup } = params

    if (messageId) {
        try {
            await ctx.api.editMessageText(chatId, messageId, text, {
                parse_mode: "HTML",
                reply_markup: replyMarkup,
            })
            return { messageId }
        } catch {
            // message might be deleted / outdated, fallback to sending new
        }
    }

    const msg = await ctx.api.sendMessage(chatId, text, {
        parse_mode: "HTML",
        reply_markup: replyMarkup,
    })

    return { messageId: msg.message_id }
}
