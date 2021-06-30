/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2015, 2016, 2018, 2019, 2021 The Matrix.org Foundation C.I.C.

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
import { EventStatus, MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { MatrixClientPeg } from '../../../MatrixClientPeg';
import dis from '../../../dispatcher/dispatcher';
import * as sdk from '../../../index';
import { _t } from '../../../languageHandler';
import Modal from '../../../Modal';
import Resend from '../../../Resend';
import SettingsStore from '../../../settings/SettingsStore';
import { isUrlPermitted } from '../../../HtmlUtils';
import { isContentActionable } from '../../../utils/EventUtils';
import IconizedContextMenu, { IconizedContextMenuOption, IconizedContextMenuOptionList } from './IconizedContextMenu';
import { EventType } from "matrix-js-sdk/src/@types/event";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import { ReadPinsEventId } from "../right_panel/PinnedMessagesCard";
import ForwardDialog from "../dialogs/ForwardDialog";
import { Action } from "../../../dispatcher/actions";
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
import { ButtonEvent } from '../elements/AccessibleButton';
import { copyPlaintext } from '../../../utils/strings';

export function canCancel(eventStatus) {
    return eventStatus === EventStatus.QUEUED || eventStatus === EventStatus.NOT_SENT;
}

interface IProps {
    // The MatrixEvent associated with the context menu */
    mxEvent: MatrixEvent;
    // An optional EventTileOps implementation that can be used to unhide preview widgets */
    eventTileOps?; // TODO: Add type when TextualBody is TSified
    // An optional function to be called when the user clicks collapse thread, if not provided hide button
    collapseReplyThread?(): void;
    // Callback called when the menu is dismissed
    onFinished(): void;
    // If the menu is inside a dialog, we sometimes need to close that dialog after click (forwarding)
    onCloseDialog?(): void;
    permalinkCreator: RoomPermalinkCreator;
    rightClick?: boolean;
}

interface IState {
    canRedact: boolean;
    canPin: boolean;
}

@replaceableComponent("views.context_menus.MessageContextMenu")
export default class MessageContextMenu extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            canRedact: false,
            canPin: false,
        };
    }

    componentDidMount() {
        MatrixClientPeg.get().on('RoomMember.powerLevel', this.checkPermissions);
        this.checkPermissions();
    }

    componentWillUnmount() {
        const cli = MatrixClientPeg.get();
        if (cli) {
            cli.removeListener('RoomMember.powerLevel', this.checkPermissions);
        }
    }

    private checkPermissions = (): void => {
        const cli = MatrixClientPeg.get();
        const room = cli.getRoom(this.props.mxEvent.getRoomId());

        // We explicitly decline to show the redact option on ACL events as it has a potential
        // to obliterate the room - https://github.com/matrix-org/synapse/issues/4042
        // Similarly for encryption events, since redacting them "breaks everything"
        const canRedact = room.currentState.maySendRedactionForEvent(this.props.mxEvent, cli.credentials.userId)
            && this.props.mxEvent.getType() !== EventType.RoomServerAcl
            && this.props.mxEvent.getType() !== EventType.RoomEncryption;
        let canPin = room.currentState.mayClientSendStateEvent(EventType.RoomPinnedEvents, cli);

        // HACK: Intentionally say we can't pin if the user doesn't want to use the functionality
        if (!SettingsStore.getValue("feature_pinning")) canPin = false;

        this.setState({ canRedact, canPin });
    };

    private isPinned(): boolean {
        const room = MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());
        const pinnedEvent = room.currentState.getStateEvents(EventType.RoomPinnedEvents, '');
        if (!pinnedEvent) return false;
        const content = pinnedEvent.getContent();
        return content.pinned && Array.isArray(content.pinned) && content.pinned.includes(this.props.mxEvent.getId());
    }

    private onResendReactionsClick = (): void => {
        for (const reaction of this.getUnsentReactions()) {
            Resend.resend(reaction);
        }
        this.closeMenu();
    };

    private onReportEventClick = (): void => {
        const ReportEventDialog = sdk.getComponent("dialogs.ReportEventDialog");
        Modal.createTrackedDialog('Report Event', '', ReportEventDialog, {
            mxEvent: this.props.mxEvent,
        }, 'mx_Dialog_reportEvent');
        this.closeMenu();
    };

    private onViewSourceClick = (): void => {
        const ViewSource = sdk.getComponent('structures.ViewSource');
        Modal.createTrackedDialog('View Event Source', '', ViewSource, {
            mxEvent: this.props.mxEvent,
        }, 'mx_Dialog_viewsource');
        this.closeMenu();
    };

    private onRedactClick = (): void => {
        const ConfirmRedactDialog = sdk.getComponent("dialogs.ConfirmRedactDialog");
        Modal.createTrackedDialog('Confirm Redact Dialog', '', ConfirmRedactDialog, {
            onFinished: async (proceed, reason) => {
                if (!proceed) return;

                const cli = MatrixClientPeg.get();
                try {
                    if (this.props.onCloseDialog) this.props.onCloseDialog();
                    await cli.redactEvent(
                        this.props.mxEvent.getRoomId(),
                        this.props.mxEvent.getId(),
                        undefined,
                        reason ? { reason } : {},
                    );
                } catch (e) {
                    const code = e.errcode || e.statusCode;
                    // only show the dialog if failing for something other than a network error
                    // (e.g. no errcode or statusCode) as in that case the redactions end up in the
                    // detached queue and we show the room status bar to allow retry
                    if (typeof code !== "undefined") {
                        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
                        // display error message stating you couldn't delete this.
                        Modal.createTrackedDialog('You cannot delete this message', '', ErrorDialog, {
                            title: _t('Error'),
                            description: _t('You cannot delete this message. (%(code)s)', { code }),
                        });
                    }
                }
            },
        }, 'mx_Dialog_confirmredact');
        this.closeMenu();
    };

    private onForwardClick = (): void => {
        Modal.createTrackedDialog('Forward Message', '', ForwardDialog, {
            matrixClient: MatrixClientPeg.get(),
            event: this.props.mxEvent,
            permalinkCreator: this.props.permalinkCreator,
        });
        this.closeMenu();
    };

    private onPinClick = (): void => {
        const cli = MatrixClientPeg.get();
        const room = cli.getRoom(this.props.mxEvent.getRoomId());
        const eventId = this.props.mxEvent.getId();

        const pinnedIds = room?.currentState?.getStateEvents(EventType.RoomPinnedEvents, "")?.getContent().pinned || [];
        if (pinnedIds.includes(eventId)) {
            pinnedIds.splice(pinnedIds.indexOf(eventId), 1);
        } else {
            pinnedIds.push(eventId);
            cli.setRoomAccountData(room.roomId, ReadPinsEventId, {
                event_ids: [
                    ...(room.getAccountData(ReadPinsEventId)?.getContent()?.event_ids || []),
                    eventId,
                ],
            });
        }
        cli.sendStateEvent(this.props.mxEvent.getRoomId(), EventType.RoomPinnedEvents, { pinned: pinnedIds }, "");
        this.closeMenu();
    };

    private closeMenu = (): void => {
        if (this.props.onFinished) this.props.onFinished();
    };

    private onUnhidePreviewClick = (): void => {
        if (this.props.eventTileOps) {
            this.props.eventTileOps.unhideWidget();
        }
        this.closeMenu();
    };

    private onQuoteClick = (): void => {
        dis.dispatch({
            action: Action.ComposerInsert,
            event: this.props.mxEvent,
        });
        this.closeMenu();
    };

    private onPermalinkClick = (e: ButtonEvent): void => {
        e.preventDefault();
        const ShareDialog = sdk.getComponent("dialogs.ShareDialog");
        Modal.createTrackedDialog('share room message dialog', '', ShareDialog, {
            target: this.props.mxEvent,
            permalinkCreator: this.props.permalinkCreator,
        });
        this.closeMenu();
    };

    private onCollapseReplyThreadClick = (): void => {
        this.props.collapseReplyThread();
        this.closeMenu();
    };

    private onCopyClick = (): void => {
        copyPlaintext(this.getSelectedText());
        this.closeMenu();
    };

    private getReactions(filter: (event: MatrixEvent) => boolean): Array<MatrixEvent> {
        const cli = MatrixClientPeg.get();
        const room = cli.getRoom(this.props.mxEvent.getRoomId());
        const eventId = this.props.mxEvent.getId();
        return room.getPendingEvents().filter(e => {
            const relation = e.getRelation();
            return relation &&
                relation.rel_type === "m.annotation" &&
                relation.event_id === eventId &&
                filter(e);
        });
    }

    private getUnsentReactions(): Array<MatrixEvent> {
        return this.getReactions(e => e.status === EventStatus.NOT_SENT);
    }

    private getSelectedText(): string {
        return window.getSelection().toString();
    }

    render() {
        const cli = MatrixClientPeg.get();
        const me = cli.getUserId();
        const mxEvent = this.props.mxEvent;
        const eventStatus = mxEvent.status;
        const unsentReactionsCount = this.getUnsentReactions().length;
        let resendReactionsButton;
        let redactButton;
        let forwardButton;
        let pinButton;
        let unhidePreviewButton;
        let externalURLButton;
        let quoteButton;
        let collapseReplyThread;
        let redactItemList;

        // status is SENT before remote-echo, null after
        const isSent = !eventStatus || eventStatus === EventStatus.SENT;
        if (!mxEvent.isRedacted()) {
            if (unsentReactionsCount !== 0) {
                resendReactionsButton = (
                    <IconizedContextMenuOption
                        iconClassName="mx_MessageContextMenu_iconResend"
                        label={ _t('Resend %(unsentCount)s reaction(s)', { unsentCount: unsentReactionsCount }) }
                        onClick={this.onResendReactionsClick}
                    />
                );
            }
        }

        if (isSent && this.state.canRedact) {
            redactButton = (
                <IconizedContextMenuOption
                    iconClassName="mx_MessageContextMenu_iconRedact"
                    label={_t("Remove")}
                    onClick={this.onRedactClick}
                />
            );
        }

        if (isContentActionable(mxEvent)) {
            forwardButton = (
                <IconizedContextMenuOption
                    iconClassName="mx_MessageContextMenu_iconForward"
                    label={_t("Forward")}
                    onClick={this.onForwardClick}
                />
            );

            if (this.state.canPin) {
                pinButton = (
                    <IconizedContextMenuOption
                        iconClassName="mx_MessageContextMenu_iconPin"
                        label={ this.isPinned() ? _t('Unpin') : _t('Pin') }
                        onClick={this.onPinClick}
                    />
                );
            }
        }

        const viewSourceButton = (
            <IconizedContextMenuOption
                iconClassName="mx_MessageContextMenu_iconSource"
                label={_t("View source")}
                onClick={this.onViewSourceClick}
            />
        );

        if (this.props.eventTileOps) {
            if (this.props.eventTileOps.isWidgetHidden()) {
                unhidePreviewButton = (
                    <IconizedContextMenuOption
                        iconClassName="mx_MessageContextMenu_iconUnhidePreview"
                        label={_t("Show preview")}
                        onClick={this.onUnhidePreviewClick}
                    />
                );
            }
        }

        let permalink;
        if (this.props.permalinkCreator) {
            permalink = this.props.permalinkCreator.forEvent(this.props.mxEvent.getId());
        }
        // XXX: if we use room ID, we should also include a server where the event can be found (other than in the domain of the event ID)
        const permalinkButton = (
            <IconizedContextMenuOption
                iconClassName="mx_MessageContextMenu_iconPermalink"
                onClick={this.onPermalinkClick}
                label= {_t('Share')}
                element="a"
                href={permalink}
                target="_blank"
                rel="noreferrer noopener"
            />
        );

        if (this.props.eventTileOps) { // this event is rendered using TextualBody
            quoteButton = (
                <IconizedContextMenuOption
                    iconClassName="mx_MessageContextMenu_iconQuote"
                    label={_t("Quote")}
                    onClick={this.onQuoteClick}
                />
            );
        }

        // Bridges can provide a 'external_url' to link back to the source.
        if (typeof (mxEvent.event.content.external_url) === "string" &&
            isUrlPermitted(mxEvent.event.content.external_url)
        ) {
            externalURLButton = (
                <IconizedContextMenuOption
                    iconClassName="mx_MessageContextMenu_iconLink"
                    onClick={this.closeMenu}
                    label={ _t('Source URL') }
                    element="a"
                    target="_blank"
                    rel="noreferrer noopener"
                    href={mxEvent.event.content.external_url}
                />
            );
        }

        if (this.props.collapseReplyThread) {
            collapseReplyThread = (
                <IconizedContextMenuOption
                    iconClassName="mx_MessageContextMenu_iconCollapse"
                    label={_t("Collapse reply thread")}
                    onClick={this.onCollapseReplyThreadClick}
                />
            );
        }

        let reportEventButton;
        if (mxEvent.getSender() !== me) {
            reportEventButton = (
                <IconizedContextMenuOption
                    iconClassName="mx_MessageContextMenu_iconReport"
                    label={_t("Report")}
                    onClick={this.onReportEventClick}
                />
            );
        }

        let copyButton;
        if (this.props.rightClick && this.getSelectedText()) {
            copyButton = (
                <IconizedContextMenuOption
                    iconClassName="mx_MessageContextMenu_iconCopy"
                    label={_t("Copy")}
                    onMouseDown={this.onCopyClick} // We use onMouseDown so that the selection isn't cleared when we click
                />
            );
        }

        const nativeItemsList = (
            <IconizedContextMenuOptionList>
                { copyButton }
            </IconizedContextMenuOptionList>
        );

        const commonItemsList = (
            <IconizedContextMenuOptionList>
                { quoteButton }
                { forwardButton }
                { pinButton }
                { permalinkButton }
                { reportEventButton }
                { externalURLButton }
                { unhidePreviewButton }
                { viewSourceButton }
                { resendReactionsButton }
                { collapseReplyThread }
            </IconizedContextMenuOptionList>
        );

        if (redactButton) {
            redactItemList = (
                <IconizedContextMenuOptionList red>
                    { redactButton }
                </IconizedContextMenuOptionList>
            );
        }

        return (
            <IconizedContextMenu
                {...this.props}
                className="mx_MessageContextMenu"
                compact={true}
            >
                { nativeItemsList }
                { commonItemsList }
                { redactItemList }
            </IconizedContextMenu>
        );
    }
}
