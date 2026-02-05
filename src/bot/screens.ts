import type { ProfileView } from "../services/profile"
import { escapeHtml } from "./ui"

function pad(label: string, value: number | string, width = 22): string {
    const left = (label + ":").padEnd(width, " ")
    return `${left}${value}`
}

export function renderHomeScreen(): string {
    return [
        "🏁 <b>Biathlon Manager (MVP)</b>",
        "",
        "Выбери действие:",
        "",
        "• 👤 Профиль — твой биатлонист и состояние",
        "• 🏁 Гонка — симуляция",
        "• 🏋️ Тренировка — прокачка (скоро)",
        "• 📊 Сезон — очки и рейтинг (скоро)",
        "",
        "<i>Меню редактируется, чтобы не засорять чат.</i>",
    ].join("\n")
}

export function renderStubScreen(title: string): string {
    return [
        `<b>${escapeHtml(title)}</b>`,
        "",
        "🚧 В разработке.",
        "",
        "Пока доступно:",
        "• /start — регистрация",
        "• /menu — меню",
    ].join("\n")
}

export function renderProfileScreen(p: ProfileView): string {
    const a = p.athlete
    const m = p.manager

    const header = [
        "👤 <b>Профиль</b>",
        "",
        `Уровень: <b>${m.level}</b>    Рейтинг: <b>${m.rating}</b>    Деньги: <b>${m.money}</b>`,
        "",
        `Спортсмен: ${escapeHtml(a.country ?? "—")} • Возраст: ${a.age ?? "—"}`,
        "",
    ].join("\n")

    const stateTable = [
        "<b>Состояние</b>",
        "<pre>",
        escapeHtml(pad("Форма", a.form)),
        escapeHtml(pad("Усталость", a.fatigue)),
        escapeHtml(pad("Травма", a.injury_level)),
        "</pre>",
        "",
    ].join("\n")

    const skiTable = [
        "<b>Лыжи</b>",
        "<pre>",
        escapeHtml(pad("Скорость", a.ski_speed)),
        escapeHtml(pad("Выносливость", a.endurance)),
        escapeHtml(pad("Восстановление", a.recovery)),
        "</pre>",
        "",
    ].join("\n")

    const shootTable = [
        "<b>Стрельба</b>",
        "<pre>",
        escapeHtml(pad("Точность лёжа", a.accuracy_prone)),
        escapeHtml(pad("Точность стоя", a.accuracy_standing)),
        escapeHtml(pad("Скорость стрельбы", a.shooting_speed)),
        escapeHtml(pad("Стрессоустойчивость", a.stress_resistance)),
        "</pre>",
        "",
    ].join("\n")

    const psychTable = [
        "<b>Психология</b>",
        "<pre>",
        escapeHtml(pad("Фокус", a.focus)),
        escapeHtml(pad("Стабильность", a.consistency)),
        "</pre>",
    ].join("\n")

    return header + stateTable + skiTable + shootTable + psychTable
}
