/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

/** An enum of keys */
export enum Key {
    HOME = "Home",
    END = "End",
    PAGE_UP = "PageUp",
    PAGE_DOWN = "PageDown",
    BACKSPACE = "Backspace",
    DELETE = "Delete",
    ARROW_UP = "ArrowUp",
    ARROW_DOWN = "ArrowDown",
    ARROW_LEFT = "ArrowLeft",
    ARROW_RIGHT = "ArrowRight",
    TAB = "Tab",
    ESCAPE = "Escape",
    ENTER = "Enter",
    ALT = "Alt",
    CONTROL = "Control",
    META = "Meta",
    SHIFT = "Shift",
    CONTEXT_MENU = "ContextMenu",

    COMMA = ",",
    PERIOD = ".",
    LESS_THAN = "<",
    GREATER_THAN = ">",
    BACKTICK = "`",
    SPACE = " ",
    SLASH = "/",
    SQUARE_BRACKET_LEFT = "[",
    SQUARE_BRACKET_RIGHT = "]",
    A = "a",
    B = "b",
    C = "c",
    D = "d",
    E = "e",
    F = "f",
    G = "g",
    H = "h",
    I = "i",
    J = "j",
    K = "k",
    L = "l",
    M = "m",
    N = "n",
    O = "o",
    P = "p",
    Q = "q",
    R = "r",
    S = "s",
    T = "t",
    U = "u",
    V = "v",
    W = "w",
    X = "x",
    Y = "y",
    Z = "z",
}

/**
 * An array of modifiers
 * */
export const Modifiers = ["Control", "Meta", "Shift", "Alt"];

/**
 * Represents a key combination
 */
export interface KeyCombo {
    key: Key;
    altKey?: boolean;
    shiftKey?: boolean;
    /*
     * It's preferable to use this over ctrlKey and metaKey
     */
    ctrlOrCmdKey?: boolean;
    /** This shouldn't be used since it will work only
     * on one platform. They are here for legacy purposes.
     */
    ctrlKey?: boolean;
    /** This shouldn't be used since it will work only
     * on one platform. They are here for legacy purposes.
     */
    metaKey?: boolean;
}

/**
 * Parse event into keyCombo
 * @param {KeyboardEvent} ev The event to parse
 * @returns {KeyCombo|undefined} Returns undefined if ev
 * is not a valid keyCombo otherwise returns keyCombo
 */
export function parseKeyCombo(ev: KeyboardEvent): KeyCombo | undefined {
    if (Modifiers.includes(ev.key)) return undefined;
    if (!(
        ev.altKey ||
        ev.shiftKey ||
        ev.ctrlKey ||
        ev.metaKey
    )) return undefined;

    const keyCombo: KeyCombo = {
        key: ev.key as Key,
    }
    if (ev.altKey) keyCombo.altKey = true;
    if (ev.shiftKey) keyCombo.shiftKey = true;
    if (ev.metaKey || ev.ctrlKey) keyCombo.ctrlOrCmdKey = true;
    return keyCombo;
}

export function isOnlyCtrlOrCmdKeyEvent(ev) {
    if (isMac) {
        return ev.metaKey && !ev.altKey && !ev.ctrlKey && !ev.shiftKey;
    } else {
        return ev.ctrlKey && !ev.altKey && !ev.metaKey && !ev.shiftKey;
    }
}

export function isOnlyCtrlOrCmdIgnoreShiftKeyEvent(ev) {
    if (isMac) {
        return ev.metaKey && !ev.altKey && !ev.ctrlKey;
    } else {
        return ev.ctrlKey && !ev.altKey && !ev.metaKey;
    }
}
