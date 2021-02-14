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
import {KeyCombo, isModifier} from '../../../../Keyboard';
import {_t} from "../../../../languageHandler";
import BaseDialog from "../../dialogs/BaseDialog"
import KeyboardShortcut from "../../elements/KeyboardShortcut"

interface IState {
    currentKeyCombo: KeyCombo;
}

interface IProps {
    onFinished: (newKeybinding: KeyCombo | null) => void;
}

export default class KeybindingDialog extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            currentKeyCombo: null,
        }
    }

    keys: Array<KeyCombo> = [];
    timeout;

    // TODO What if only a key is pressed
    onKeyDown = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        clearTimeout(this.timeout);

        const key = ev.key;
        this.keys.push(key);

        const keyCombo: KeyCombo = {
            key: key,
        }

        if (ev.altKey) keyCombo.altKey = true;
        if (ev.shiftKey) keyCombo.shiftKey = true;
        if (ev.metaKey || ev.ctrlKey) keyCombo.ctrlOrCmdKey = true;

        if (isModifier(key)) {
            keyCombo.key = null;
        }

        this.setState({
            currentKeyCombo: keyCombo,
        });
    }

    onKeyUp = (ev) => {
        this.keys.splice(this.keys.indexOf(ev.key), 1);
        if (this.keys.length > 0) return;
        if (!this.state.currentKeyCombo.key) return;

        this.timeout = setTimeout(() => {
            this.props.onFinished(this.state.currentKeyCombo);
        }, 500);
    }

    render() {
        const keyboardShortcut =
            this.state.currentKeyCombo ?
                <KeyboardShortcut keyCombo={this.state.currentKeyCombo} ></KeyboardShortcut> : null;

        return (
            <BaseDialog
                onKeyDown={this.onKeyDown}
                onKeyUp={this.onKeyUp}
                quitOnEscape={false}
                onFinished={() => this.props.onFinished(null)}
                title={_t("Set keybinding")}
            >
                {keyboardShortcut}
            </BaseDialog>
        );
    }
}
