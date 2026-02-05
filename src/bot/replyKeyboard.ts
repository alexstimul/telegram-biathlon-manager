import { Keyboard } from "grammy"

export function persistentKeyboard(): Keyboard {
    return new Keyboard().text("Меню").resized().persistent()
}
