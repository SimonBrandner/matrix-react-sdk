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
import {KeyCombo, isMac, Key, Modifier} from "../../../Keyboard";

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
    [Modifier.ALT]: _td("Alt"),
    [Modifier.CONTROL]: _td("Ctrl"),
    [Modifier.SHIFT]: _td("Shift"),
}

const keyIcon: Record<string, string> = {
    [Key.ARROW_UP]: "↑",
    [Key.ARROW_DOWN]: "↓",
    [Key.ARROW_LEFT]: "←",
    [Key.ARROW_RIGHT]: "→",
};

interface IProps {
    keyCombo: KeyCombo;
}

export default class Shortcut extends React.Component<IProps> {
    render() {
        const key = this.props.keyCombo.key;

        const modifiersElement = [];
        if (this.props.keyCombo.ctrlOrCmdKey) {
            modifiersElement.push(
                <React.Fragment>
                    <kbd>{ isMac ? "⌘" : alternateModifierName[Modifier.CONTROL] }</kbd>+
                </React.Fragment>,
            );
        }
        if (this.props.keyCombo.altKey) {
            modifiersElement.push(
                <React.Fragment>
                    <kbd>{ isMac ? "⌥" : alternateModifierName[Modifier.ALT] }</kbd>+
                </React.Fragment>,
            );
        }
        if (this.props.keyCombo.shiftKey) {
            modifiersElement.push(
                <React.Fragment>
                    <kbd>{ alternateModifierName[Modifier.SHIFT] }</kbd>+
                </React.Fragment>,
            );
        }

        const keyElement = key ? <kbd>{ keyIcon[key] || alternateKeyName[key] || key }</kbd> : null;

        return (
            <div className="mx_KeyboardShortcut">
                {modifiersElement}
                {keyElement}
            </div>
        );
    }
}
