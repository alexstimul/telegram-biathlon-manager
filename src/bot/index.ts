import type { Bot } from "grammy"
import { registerMenuRoutes } from "./menu"
import { registerRaceRoutes } from "./race"
import { registerDebugRoutes } from "./debug"

export function registerAllRoutes(bot: Bot) {
    registerMenuRoutes(bot)
    registerRaceRoutes(bot)
    registerDebugRoutes(bot)
}
