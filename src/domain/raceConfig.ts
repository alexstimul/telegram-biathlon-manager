export type RaceType = "sprint" | "individual"
export type ShootPos = "prone" | "standing"
export type Strategy = "safe" | "balanced" | "aggressive"

export type Segment =
    | { kind: "SKI"; km: number }
    | { kind: "SHOOT"; pos: ShootPos }

export type RaceConfig = {
    type: RaceType
    name: string
    basePaceSecPerKm: number
    segments: Segment[]
    penalty: { kind: "loop" | "time"; valueSec: number }
}

export function getRaceConfig(type: RaceType): RaceConfig {
    if (type === "sprint") {
        return {
            type,
            name: "Спринт",
            basePaceSecPerKm: 160,
            segments: [
                { kind: "SKI", km: 3.3 },
                { kind: "SHOOT", pos: "prone" },
                { kind: "SKI", km: 3.3 },
                { kind: "SHOOT", pos: "standing" },
                { kind: "SKI", km: 3.4 },
            ],
            penalty: { kind: "loop", valueSec: 25 },
        }
    }

    return {
        type,
        name: "Индивидуальная",
        basePaceSecPerKm: 165,
        segments: [
            { kind: "SKI", km: 3 },
            { kind: "SHOOT", pos: "prone" },
            { kind: "SKI", km: 3 },
            { kind: "SHOOT", pos: "standing" },
            { kind: "SKI", km: 3 },
            { kind: "SHOOT", pos: "prone" },
            { kind: "SKI", km: 3 },
            { kind: "SHOOT", pos: "standing" },
            { kind: "SKI", km: 3 },
        ],
        penalty: { kind: "time", valueSec: 60 },
    }
}
