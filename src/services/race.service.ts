import type { RaceType, Strategy } from "../domain/raceConfig"
import { simulateRace } from "../domain/simulateRace"
import { getProfileByTelegramId } from "./profile"

export async function runRaceForTelegramUser(params: {
    telegramId: number
    raceType: RaceType
    strategy: Strategy
}) {
    const profile = await getProfileByTelegramId(params.telegramId)

    const result = simulateRace({
        raceType: params.raceType,
        strategy: params.strategy,
        athlete: profile.athlete,
    })

    return result
}
