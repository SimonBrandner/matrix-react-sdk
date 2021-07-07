/*
 Copyright 2015, 2016 OpenMarket Ltd

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
import Flair from '../elements/Flair';
import FlairStore from '../../../stores/FlairStore';
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import DisambiguatedProfile from "./DisambiguatedProfile";
import { MsgType } from '../../../../../matrix-js-sdk/src/@types/event';

interface IProps {
    mxEvent: MatrixEvent;
    onClick(): void;
    enableFlair: boolean;
}

interface IState {
    userGroups;
    relatedGroups;
}

@replaceableComponent("views.messages.SenderProfile")
export default class SenderProfile extends React.Component<IProps, IState> {
    static contextType = MatrixClientContext;
    private unmounted: boolean;

    constructor(props: IProps) {
        super(props);
        const senderId = this.props.mxEvent.getSender();

        this.state = {
            userGroups: FlairStore.cachedPublicisedGroups(senderId) || [],
            relatedGroups: [],
        };
    }

    componentDidMount() {
        this.unmounted = false;
        this._updateRelatedGroups();

        if (this.state.userGroups.length === 0) {
            this.getPublicisedGroups();
        }

        this.context.on('RoomState.events', this.onRoomStateEvents);
    }

    componentWillUnmount() {
        this.unmounted = true;
        this.context.removeListener('RoomState.events', this.onRoomStateEvents);
    }

    async getPublicisedGroups() {
        if (!this.unmounted) {
            const userGroups = await FlairStore.getPublicisedGroupsCached(
                this.context, this.props.mxEvent.getSender(),
            );
            this.setState({ userGroups });
        }
    }

    onRoomStateEvents = event => {
        if (event.getType() === 'm.room.related_groups' &&
            event.getRoomId() === this.props.mxEvent.getRoomId()
        ) {
            this._updateRelatedGroups();
        }
    };

    _updateRelatedGroups() {
        if (this.unmounted) return;
        const room = this.context.getRoom(this.props.mxEvent.getRoomId());
        if (!room) return;

        const relatedGroupsEvent = room.currentState.getStateEvents('m.room.related_groups', '');
        this.setState({
            relatedGroups: relatedGroupsEvent ? relatedGroupsEvent.getContent().groups || [] : [],
        });
    }

    _getDisplayedGroups(userGroups, relatedGroups) {
        let displayedGroups = userGroups || [];
        if (relatedGroups && relatedGroups.length > 0) {
            displayedGroups = relatedGroups.filter((groupId) => {
                return displayedGroups.includes(groupId);
            });
        } else {
            displayedGroups = [];
        }
        return displayedGroups;
    }

    render() {
        const { mxEvent, onClick } = this.props;

        // emote message must include the name so don't duplicate it
        if (mxEvent.getContent()?.msgtype === MsgType.Emote) return null;

        let flair;
        if (this.props.enableFlair) {
            const displayedGroups = this._getDisplayedGroups(
                this.state.userGroups, this.state.relatedGroups,
            );

            flair = <Flair key='flair'
                userId={mxEvent.getSender()}
                groups={displayedGroups}
            />;
        }

        return (
            <DisambiguatedProfile
                fallbackName={mxEvent.getSender() || ""}
                flair={flair}
                onClick={onClick}
                member={mxEvent.sender}
            />
        );
    }
}
