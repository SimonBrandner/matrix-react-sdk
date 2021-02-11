/*
Copyright 2021 Šimon Brandner <simon.bra.ag@gmail.com>

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

import React from 'react';
import { Key, IKeybind, Modifiers } from '../../../../Keyboard';
import {_t} from "../../../../languageHandler";
import BaseDialog from "../../dialogs/BaseDialog"
import KeyboardShortcut from "../../elements/KeyboardShortcut"

interface IState {
    currentKeybinding: IKeybind;
}

interface IProps {
    onFinished: (newKeybinding: null) => void;
}

export default class KeybindingDialog extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            currentKeybinding: null,
        }
    }

    onKeyDown = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const key = ev.key;
        if (key == Key.ESCAPE) {
            this.props.onFinished(null);
            return;
        }
        // TODO: Handle other modifiers like ALT_GR
        const modifiers = [];
        if (ev.altKey) modifiers.push(Modifiers.ALT)
        if (ev.shiftKey) modifiers.push(Modifiers.SHIFT)
        if (ev.metaKey) modifiers.push(Modifiers.SUPER)
        if (ev.ctrlKey) modifiers.push(Modifiers.CONTROL)

        for (const modifier of modifiers) {
            console.log("LOG", key, modifier, modifiers)
            if (key === modifier) return;
        }

        this.setState({
            currentKeybinding: {
                key: key,
                modifiers: modifiers,
            },
        });
    }

    render() {
        const keyboardShortcut =
            this.state.currentKeybinding ?
                <KeyboardShortcut keybind={this.state.currentKeybinding} ></KeyboardShortcut> : null;

        return (
            <BaseDialog
                onKeyDown={this.onKeyDown}
                onFinished={() => this.props.onFinished(null)}
                title={_t("Set keybinding")}
            >
                {keyboardShortcut}
            </BaseDialog>
        );
    }
}
