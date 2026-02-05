import { InlineKeyboard } from "grammy"

export function mainMenuKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text("👤 Профиль", "menu:profile")
        .row()
        .text("🏁 Гонка", "menu:race")
        .text("🏋️ Тренировка", "menu:training")
        .row()
        .text("📊 Сезон", "menu:season")
        .text("ℹ️ Правила", "menu:rules")
}

export function backToMenuKeyboard(): InlineKeyboard {
    return new InlineKeyboard().text("⬅️ В меню", "menu:home")
}
