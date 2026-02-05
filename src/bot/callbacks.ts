export const CALLBACKS = {
    menu: {
        home: "menu:home",
        profile: "menu:profile",
        race: "menu:race",
        training: "menu:training",
        season: "menu:season",
        rules: "menu:rules",
    },

    race: {
        type: (v: "sprint" | "individual") => `race:type:${v}`,
        strategy: (v: "safe" | "balanced" | "aggressive") => `race:strategy:${v}`,
        go: "race:go",
        backToType: "race:back:type",
        backToStrategy: "race:back:strategy",
    },

    debug: {
        resetConfirm: "debug:reset:confirm",
        resetCancel: "debug:reset:cancel",
    },
} as const
