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
import {_t, _td} from "../../../../../languageHandler";
import Modal from '../../../../../Modal';
import AccessibleButton from '../../../elements/AccessibleButton';
import KeybindingDialog from '../../account/KeybindingDialog';
import {SETTINGS} from "../../../../../settings/Settings"
import {SettingLevel} from "../../../../../settings/SettingLevel";
import SettingsStore from '../../../../../settings/SettingsStore';
import Shortcut from '../../../elements/KeyboardShortcut';
import {IKeybind} from '../../../../../Keyboard';

interface KeybindingIProps {
    settingName: string;
}
interface KeybindingIState {
    currentKeybinding: IKeybind;
}

// TODO: Handle conflicts
export class Keybinding extends React.Component<KeybindingIProps, KeybindingIState> {
    constructor(props: KeybindingIProps) {
        super(props);

        this.state = {
            currentKeybinding: SettingsStore.getValue(this.props.settingName),
        };
    }

    onSetKeybinding = (newKeybinding: IKeybind) => {
        if (newKeybinding == null) return;
        this.setState({
            currentKeybinding: newKeybinding,
        });
        SettingsStore.setValue(this.props.settingName, null, SettingLevel.ACCOUNT, newKeybinding);
    }

    onRemoveKeybinding = (ev) => {
        this.setState({
            currentKeybinding: null,
        });
    }

    showKeybindingDialog = (ev) => {
        Modal.createDialog(KeybindingDialog, {
            onFinished: this.onSetKeybinding,
        });
    }

    render() {
        const label = SettingsStore.getDisplayName(this.props.settingName);
        const value = this.state.currentKeybinding;

        let buttons;
        if (value) {
            buttons = <div className="mx_KeybindingUserSettingsTab_keybind_buttons">
                <Shortcut keybind={value}></Shortcut>
                <AccessibleButton kind="primary" onClick={this.showKeybindingDialog}>
                    {_t("Edit")}
                </AccessibleButton>
                <AccessibleButton kind="danger" onClick={this.onRemoveKeybinding}>
                    {_t("Remove")}
                </AccessibleButton>
            </div>;
        } else {
            buttons = <div className="mx_KeybindingUserSettingsTab_keybind_buttons">
                <AccessibleButton kind="primary" onClick={this.showKeybindingDialog}>
                    {_t("Add")}
                </AccessibleButton>
            </div>
        }

        return (
            <div className="mx_KeybindingUserSettingsTab_keybind">
                {label}
                {buttons}
            </div>
        );
    }
}

export default class KeybindingsUserSettingsTab extends React.Component {
    getSectionKeybinds(startsWith: string) {
        return Object.keys(SETTINGS).filter((settingName) => {
            if (settingName.startsWith(startsWith)) {
                return true
            } else {
                return false
            }
        }).map((settingName) => {
            return (
                <Keybinding key={settingName} settingName={settingName}></Keybinding>
            );
        });
    }

    getSections(categories: Map<string, string>) {
        const sections = [];
        for (const category of categories.entries()) {
            const sectionKeybinds = this.getSectionKeybinds(category[0]);

            sections.push(
                <div key={category[0]} className="mx_SettingsTab_section">
                    <span className="mx_SettingsTab_subheading">{category[1]}</span>
                    {sectionKeybinds}
                </div>,
            );
        }
        return sections;
    }

    render() {
        const Categories = new Map([
            ["Keybind.Composer.", _td("Composer")],
            ["Keybind.Calls.", _td("Calls")],
            ["Keybind.Room.", _td("Room")],
            ["Keybind.RoomList.", _td("RoomList")],
            ["Keybind.Navigation.", _td("Navigation")],
            ["Keybind.Autocomplete.", _td("Autocomplete")],
        ]);
        const sections = this.getSections(Categories);

        return (
            <div className="mx_SettingsTab mx_KeybindingUserSettingsTab">
                <div className="mx_SettingsTab_heading">{_t("Customize your keybindings")}</div>
                {sections}
            </div>
        );
    }
}
