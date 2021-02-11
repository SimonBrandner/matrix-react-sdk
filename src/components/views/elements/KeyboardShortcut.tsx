/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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

import * as React from "react";
import { _td } from "../../../languageHandler";
import {IKeybind, isMac, Key, Modifiers} from "../../../Keyboard";

const alternateKeyName: Record<string, string> = {
    [Key.PAGE_UP]: _td("Page Up"),
    [Key.PAGE_DOWN]: _td("Page Down"),
    [Key.ESCAPE]: _td("Esc"),
    [Key.ENTER]: _td("Enter"),
    [Key.SPACE]: _td("Space"),
    [Key.HOME]: _td("Home"),
    [Key.END]: _td("End"),
};

const alternateModifierName: Record<string, string> = {
    [Modifiers.ALT]: _td("Alt"),
    [Modifiers.ALT_GR]: _td("Alt Gr"),
    [Modifiers.SHIFT]: _td("Shift"),
    [Modifiers.SUPER]: _td("Super"),
    [Modifiers.CONTROL]: _td("Ctrl"),
}

const keyIcon: Record<string, string> = {
    [Key.ARROW_UP]: "↑",
    [Key.ARROW_DOWN]: "↓",
    [Key.ARROW_LEFT]: "←",
    [Key.ARROW_RIGHT]: "→",
};

const modifierIcon: Record<string, string> = {
    [Modifiers.COMMAND]: "⌘",
};

if (isMac) {
    modifierIcon[Modifiers.ALT] = "⌥";
}

interface IProps {
    keybind: IKeybind;
}

export default class Shortcut extends React.Component<IProps> {
    render() {
        const key = this.props.keybind.key;
        const modifiers = this.props.keybind.modifiers;

        const modifiersElement = modifiers?.map((modifier) => {
            return (
                <React.Fragment key={modifier}>
                    <kbd>{ modifierIcon[modifier] || alternateModifierName[modifier] || modifier }</kbd>+
                </React.Fragment>
            );
        });
        const keyElement = key ? <kbd>{ keyIcon[key] || alternateKeyName[key] || key }</kbd> : null;

        return (
            <div className="mx_KeyboardShortcut">
                {modifiersElement}
                {keyElement}
            </div>
        );
    }
}
