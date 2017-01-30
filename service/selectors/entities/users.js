// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {createSelector} from 'reselect';

import {getCurrentChannelId} from './channels';
import {getMyPreferences} from './preferences';
import {displayUsername} from 'service/utils/user_utils';

export function getCurrentUserId(state) {
    return state.entities.users.currentId;
}

export function getProfilesInChannel(state) {
    return state.entities.users.profilesInChannel;
}

export function getUserStatuses(state) {
    return state.entities.users.statuses;
}

export function getUser(state, id) {
    return state.entities.users.profiles[id];
}

export function getUsers(state) {
    return state.entities.users.profiles;
}

export const getCurrentUser = createSelector(
    getUsers,
    getCurrentUserId,
    (profiles, currentUserId) => {
        return profiles[currentUserId];
    }
);

export const getProfileSetInCurrentChannel = createSelector(
    getCurrentChannelId,
    getProfilesInChannel,
    (currentChannel, channelProfiles) => {
        return channelProfiles[currentChannel];
    }
);

export const getProfilesInCurrentChannel = createSelector(
    getUsers,
    getUserStatuses,
    getProfileSetInCurrentChannel,
    getMyPreferences,
    (profiles, statuses, currentChannelProfileSet, preferences) => {
        const currentProfiles = [];
        if (typeof currentChannelProfileSet === 'undefined') {
            return currentProfiles;
        }

        currentChannelProfileSet.forEach((p) => {
            currentProfiles.push({
                ...profiles[p],
                status: statuses[p]
            });
        });

        // We could get rid of this if server side sorting is a possibility
        const sortedCurrentProfiles = currentProfiles.sort((a, b) => {
            const nameA = displayUsername(a, preferences);
            const nameB = displayUsername(b, preferences);

            if (nameA.toUpperCase() < nameB.toUpperCase()) {
                return -1;
            }
            if (nameA.toUpperCase() > nameB.toUpperCase()) {
                return 1;
            }

            return 0;
        });

        return sortedCurrentProfiles;
    }
);