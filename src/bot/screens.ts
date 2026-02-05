import { ProfileView } from "../services/profile"

function pad(label: string, value: number | string, width = 22): string {
    const left = (label + ":").padEnd(width, " ")
    return `${left}${value}`
}

export function renderHomeScreen(): string {
    return [
        "🏁 *Biathlon Manager (MVP)*",
        "",
        "Выбери действие:",
        "",
        "• 👤 Профиль — твой биатлонист и состояние",
        "• 🏁 Гонка — симуляция (скоро)",
        "• 🏋️ Тренировка — прокачка (скоро)",
        "• 📊 Сезон — очки и рейтинг (скоро)",
        "",
        "_Меню редактируется, чтобы не засорять чат._"
    ].join("\n")
}

export function renderStubScreen(title: string): string {
    return [
        `*${title}*`,
        "",
        "🚧 В разработке.",
        "",
        "Пока доступно:",
        "• /start — регистрация",
        "• /menu — меню"
    ].join("\n")
}

export function renderProfileScreen(p: ProfileView): string {
    const a = p.athlete
    const m = p.manager

    const header = [
        "👤 *Профиль*",
        "",
        `Уровень: *${m.level}*    Рейтинг: *${m.rating}*    Деньги: *${m.money}*`,
        "",
        `Спортсмен: ${a.country ?? "—"} • Возраст: ${a.age ?? "—"}`,
        ""
    ].join("\n")

    const states = [
        "Состояние",
        "```",
        pad("Форма", a.form),
        pad("Усталость", a.fatigue),
        pad("Травма", a.injury_level),
        "```",
        ""
    ].join("\n")

    const ski = [
        "Лыжи",
        "```",
        pad("Скорость (ski_speed)", a.ski_speed),
        pad("Выносливость (endurance)", a.endurance),
        pad("Восстановление (recovery)", a.recovery),
        "```",
        ""
    ].join("\n")

    const shooting = [
        "Стрельба",
        "```",
        pad("Точность лёжа", a.accuracy_prone),
        pad("Точность стоя", a.accuracy_standing),
        pad("Скорость стрельбы", a.shooting_speed),
        pad("Стрессоустойчивость", a.stress_resistance),
        "```",
        ""
    ].join("\n")

    const psyche = [
        "Психология",
        "```",
        pad("Фокус", a.focus),
        pad("Стабильность", a.consistency),
        "```"
    ].join("\n")

    return header + states + ski + shooting + psyche
}
