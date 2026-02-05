import type { Strategy } from "./raceConfig"
import { getRaceConfig } from "./raceConfig"

export type AthleteSnapshot = {
    ski_speed: number
    endurance: number
    recovery: number
    accuracy_prone: number
    accuracy_standing: number
    shooting_speed: number
    stress_resistance: number
    focus: number
    consistency: number
    form: number
    fatigue: number
    injury_level: number
}

export type SimResult = {
    totalTimeSec: number
    missesTotal: number
    log: string
    newState: { form: number; fatigue: number; injury_level: number }
}

// todo вынести в утили
function clamp(min: number, max: number, v: number): number {
    return Math.max(min, Math.min(max, v))
}

// todo вынести в утили
function rand(): number {
    return Math.random()
}

// todo вынести в утили
function randInt(min: number, max: number): number {
    return Math.floor(rand() * (max - min + 1)) + min
}

function strategySkiFactor(s: Strategy): number {
    if (s === "safe") return 1.03
    if (s === "aggressive") return 0.97
    return 1.0
}

function strategyHitBonus(s: Strategy): number {
    if (s === "safe") return 0.04
    if (s === "aggressive") return -0.04
    return 0.0
}

function computeEffectiveForm(form: number, consistency: number): number {
    const sigma = 6 - 0.04 * clamp(0, 100, consistency)
    const delta = randInt(Math.round(-sigma), Math.round(sigma))
    return clamp(0, 100, form + delta)
}

function skiSegmentTimeSec(basePace: number, km: number, a: AthleteSnapshot, formEff: number, strategy: Strategy) {
    const speedFactor = 1 - 0.0035 * (a.ski_speed - 50)
    const fatiguePenalty = 0.0025 * a.fatigue
    const enduranceBonus = 0.0015 * (a.endurance - 50)
    const enduranceFactor = 1 + fatiguePenalty - enduranceBonus
    const formFactor = 1 - 0.0015 * (formEff - 50)
    const injuryFactor = 1 + 0.003 * a.injury_level

    const pace = basePace * speedFactor * enduranceFactor * formFactor * injuryFactor * strategySkiFactor(strategy)
    return pace * km
}

function shootStage(a: AthleteSnapshot, formEff: number, strategy: Strategy, pos: "prone" | "standing") {
    const accBase = pos === "prone" ? a.accuracy_prone : a.accuracy_standing

    const fatigueMod = -0.12 * (a.fatigue / 100)
    const formMod = 0.06 * ((formEff - 50) / 100)
    const stratMod = strategyHitBonus(strategy)

    const pHit = clamp(0.4, 0.98, accBase / 100 + fatigueMod + formMod + stratMod)

    let hits = 0
    for (let i = 0; i < 5; i += 1) {
        if (rand() < pHit) hits += 1
    }

    const misses = 5 - hits

    const baseShoot = pos === "prone" ? 48 : 55
    const speedBonus = 0.12 * (a.shooting_speed - 50)
    const focusBonus = 0.06 * (a.focus - 50)
    const stratTime = strategy === "safe" ? 2 : strategy === "aggressive" ? -2 : 0
    const noise = randInt(-2, 2)

    const shootTime = clamp(30, 80, baseShoot - speedBonus - focusBonus + stratTime + noise)

    return { hits, misses, pHit, shootTime }
}

export function simulateRace(params: {
    raceType: "sprint" | "individual"
    strategy: Strategy
    athlete: AthleteSnapshot
}): SimResult {
    const cfg = getRaceConfig(params.raceType)

    const log: string[] = []
    let total = 0
    let missesTotal = 0

    // локальная копия состояния (будем менять fatigue)
    const a: AthleteSnapshot = { ...params.athlete }
    const formEff = computeEffectiveForm(a.form, a.consistency)

    log.push(`🏁 ${cfg.name}`)
    log.push(`Стратегия: ${params.strategy}`)
    log.push(`Форма дня: ${formEff}/100`)
    log.push("")

    let skiLeg = 0
    let shootStageIndex = 0

    for (const seg of cfg.segments) {
        if (seg.kind === "SKI") {
            skiLeg += 1
            const t = skiSegmentTimeSec(cfg.basePaceSecPerKm, seg.km, a, formEff, params.strategy)
            total += t

            const fatigueGain = 2 + seg.km * (1 - a.endurance / 120) + (params.strategy === "aggressive" ? 1 : 0)
            a.fatigue = clamp(0, 100, a.fatigue + fatigueGain)

            log.push(`⛷️ Круг ${skiLeg}: +${t.toFixed(1)}с, усталость ${Math.round(a.fatigue)}`)
        } else {
            shootStageIndex += 1
            const s = shootStage(a, formEff, params.strategy, seg.pos)
            missesTotal += s.misses

            let penaltyTime = 0
            if (cfg.penalty.kind === "time") {
                penaltyTime = s.misses * cfg.penalty.valueSec
            } else {
                // штрафной круг: базово 25с + поправка от усталости/скорости
                const loop = clamp(22, 30, cfg.penalty.valueSec + a.fatigue * 0.03 - (a.ski_speed - 50) * 0.02)
                penaltyTime = s.misses * loop
            }

            total += s.shootTime + penaltyTime
            a.fatigue = clamp(0, 100, a.fatigue + 1)

            const posLabel = seg.pos === "prone" ? "лёжа" : "стоя"
            log.push(
                `🎯 Рубеж ${shootStageIndex} (${posLabel}): промахи ${s.misses}/5, ` +
                    `время ${s.shootTime.toFixed(1)}с, штраф ${penaltyTime.toFixed(1)}с`,
            )
        }
    }

    // Пост-обновления состояния (MVP)
    const injuryRoll =
        0.002 * a.fatigue + (params.strategy === "aggressive" ? 0.01 : 0) + 0.002 * (100 - a.endurance) / 50

    let injuryDelta = 0
    if (rand() < injuryRoll) {
        injuryDelta = randInt(10, 30)
    }

    const formDelta = clamp(-3, 3, Math.round((50 - missesTotal) / 10) - Math.round(a.fatigue / 40))

    const newState = {
        fatigue: Math.round(clamp(0, 100, a.fatigue)),
        form: Math.round(clamp(0, 100, a.form + formDelta)),
        injury_level: Math.round(clamp(0, 100, a.injury_level + injuryDelta)),
    }

    log.push("")
    log.push(`✅ Итог: ${Math.round(total)}с, промахи: ${missesTotal}`)
    if (injuryDelta > 0) log.push(`⚠️ Травма: +${injuryDelta}`)

    return {
        totalTimeSec: Math.round(total),
        missesTotal,
        log: log.join("\n"),
        newState,
    }
}
