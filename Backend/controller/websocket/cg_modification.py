from .database import get_game_table_Q, get_tournament_Q, get_in_game_table_or_in_queue, destroy_table, get_user_by_id, get_players_table, leave_match, leave_tournament, changeTableMode, addtableBot, get_Cgroup_size, kickFromGroup, memberLeaveGroup, addtablePlayer, checkPosFree
from ..forms import SocketNewModeForm, socketAddBotForm, SocketInvitePlayerForm, SocketAddPlayerForm, SocketKickFromGroupForm

import json
import asyncio

from .game.global_data import setPlayerMutex, getPlayerMutex

from asgiref.sync import sync_to_async

class CG_ModifGroup():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def changeMode(self, text_data_json):
        form = SocketNewModeForm(text_data_json)
        if form.is_valid():
            newMode = form.cleaned_data['newMode']
            table = await get_game_table_Q(self.chat_consumer.user)
            await changeTableMode(table, newMode)
            players = await get_players_table(table)
            group_size = await get_Cgroup_size(table)
            for user in players:
                event_type = "CGModeChanged"
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': event_type,
                        'newMode': newMode,
                        'group_size': group_size,
                    }
                )

    async def addPlayer(self, text_data_json):
        position = text_data_json['pos']
        senderInvId = text_data_json['senderInv']
        leader = await get_user_by_id(senderInvId)

        p_mutex = getPlayerMutex(self.chat_consumer.user.user_id)
        async with p_mutex:
            aM = await leave_match(self.chat_consumer.user)
            if aM:
                am_players = await get_players_table(aM)
                for user in am_players:
                    if (user.user_id ==  self.chat_consumer.user.user_id):
                        return
                for user in am_players:
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'cancel_match'
                        }
                    )

        aT = await leave_tournament(self.chat_consumer.user)
        if aT:
            at_players = await get_players_table(aT)
            for user in at_players:
                if (user.user_id == self.chat_consumer.user.user_id):
                    return 
            for user in at_players:
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'maj_tournament_group',
                        'refreshPlayers': True,
                        'refreshMatch': False,
                    }
                )

        aC = await get_game_table_Q(self.chat_consumer.user)
        if aC:
            players = await get_players_table(aC)
            position = await memberLeaveGroup(aC, self.chat_consumer.user.user_id, self.chat_consumer.user)
            group_size = await get_Cgroup_size(aC)
            for user in players:
                if user.user_id == self.chat_consumer.user.user_id:
                    continue
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': "CGgroupModified",
                        'pos': position,
                        'group_size': group_size,
                    }
                )

    async def addBot(self, text_data_json):
        form = socketAddBotForm(text_data_json)
        if form.is_valid():
            position = form.cleaned_data['pos']
            dif = form.cleaned_data['dif']
            table = await get_game_table_Q(self.chat_consumer.user)
            await addtableBot(table, position, dif)
            players = await get_players_table(table)
            group_size = await get_Cgroup_size(table)
            for user in players:
                event_type = "CGgroupModifiedBot"
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': event_type,
                        'pos': position,
                        'dif': dif,
                        'group_size': group_size,
                    }
                )



    async def invitePlayerCGGroup(self, text_data_json): 
        form = SocketInvitePlayerForm(text_data_json)
        if form.is_valid():
            position = form.cleaned_data['pos']
            user_id = form.cleaned_data['userInvited']
            userInvited = await get_user_by_id(user_id)
            
            safe_opponent = await get_in_game_table_or_in_queue(userInvited)
            opponent_is_in_game = await get_game_table_Q(userInvited)
            opponent_is_in_t = await get_tournament_Q(userInvited)
            if safe_opponent or opponent_is_in_game or opponent_is_in_t:
                event_type = "opponent_already_in_game"
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{self.chat_consumer.user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': event_type,
                        'sender': self.chat_consumer.user.user_id,
                        'recipient': user_id,
                    }
                )
                return
            event_type = "CGgroupInvitedPlayer"
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{self.chat_consumer.user.socket_id}",
                {
                    'type': 'send_message',
                    'event_type': event_type,
                }
            )
            actual_game = await get_game_table_Q(self.chat_consumer.user)
            if actual_game:
                players = await get_players_table(actual_game)
                for user in players:
                    if user.user_id == user_id:
                        return
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{userInvited.socket_id}",
                {
                    'type': 'send_message',
                    'event_type': event_type,
                    'sender':  self.chat_consumer.user.user_id,
                    'pos': position,
                }
            )

    async def addPlayer(self, text_data_json):
        form = SocketAddPlayerForm(text_data_json)
        if form.is_valid():
            position = form.cleaned_data['pos']
            senderInvId = form.cleaned_data['senderInv']
            leader = await get_user_by_id(senderInvId)

            me_is_in_game = await get_game_table_Q(self.chat_consumer.user)
            me_is_in_t = await get_tournament_Q(self.chat_consumer.user)
            if me_is_in_game or me_is_in_t:
                event_type = "create_table_already_in_game"
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{self.chat_consumer.user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': event_type,
                        'sender': self.chat_consumer.user.user_id,
                        'recipient': senderInvId,
                    }
                )
                return

            tableLeader = await get_game_table_Q(leader)
            if (tableLeader == None or tableLeader.isCustom == False):
                return
            canJoin = await checkPosFree(tableLeader, position, self.chat_consumer.user.user_id)
            if canJoin == False:
                event_type = "CGgroupCantJoined"
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{self.chat_consumer.user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': event_type,
                    }
                )
                return False
            await addtablePlayer(tableLeader, position, self.chat_consumer.user.user_id)
            group_size = await get_Cgroup_size(tableLeader)
            players = await get_players_table(tableLeader)
            for user in players:
                if user.user_id == self.chat_consumer.user.user_id:
                    event_type = "CGgroupJoined"
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': event_type,
                            'group_size': group_size,
                        }
                    )
                    continue
                event_type = "CGgroupModifiedPlayer"
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': event_type,
                        'pos': position,
                        'playerId': self.chat_consumer.user.user_id,
                        'group_size': group_size,
                    }
                )


    async def KickFromGroup(self, text_data_json):
        form = SocketKickFromGroupForm(text_data_json)
        if form.is_valid():
            position = form.cleaned_data['pos']
            table = await get_game_table_Q(self.chat_consumer.user)
            players = await get_players_table(table)
            player_kicked = await kickFromGroup(table, position)
            group_size = await get_Cgroup_size(table)
            if (player_kicked == None):
                for user in players:
                    event_type = "CGgroupModified"
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': event_type,
                            'pos': position,
                            'group_size': group_size,
                        }
                    )
            else :
                for user in players:
                    if (user.user_id != player_kicked.user_id):
                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': "CGgroupModified",
                                'pos': position,
                                'group_size': group_size,
                            }
                        )
                    else:
                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': "CGgroupModifiedMe",
                                'pos': position,
                                'group_size': group_size,
                            }
                        )

    async def MemberLeaveGroup(self, text_data_json):
        table = await get_game_table_Q(self.chat_consumer.user)
        players = await get_players_table(table)
        position = await memberLeaveGroup(table, self.chat_consumer.user.user_id, self.chat_consumer.user)
        group_size = await get_Cgroup_size(table)
        for user in players:
            if user.user_id == self.chat_consumer.user.user_id:
                event_type = "CGgroupLeft"
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': event_type,
                        'pos': position,
                        'group_size': group_size,
                    }
                )
                continue
            event_type = "CGgroupModified"
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{user.socket_id}",
                {
                    'type': 'send_message',
                    'event_type': event_type,
                    'pos': position,
                    'group_size': group_size,
                }
            )