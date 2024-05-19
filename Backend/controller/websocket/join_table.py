from .database import get_user_by_id, get_or_create_contact, get_game_table_started, get_players_table, get_Cgroup_size, memberLeaveGroup, leave_match, get_tournament, leave_tournament, database_count, get_game_table_Q, get_tournament_Q, get_queue_table, join_table, is_in_table, destroy_table, update_table_status, get_game_table, is_in_this_table
from ..forms import SocketRecipientForm
from .game.global_data import getData, getPlayerMutex

import json

import asyncio

from .game.game import Game

class JoinTable():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer
        
    async def receive(self, text_data_json):
        form = SocketRecipientForm(text_data_json)
        if form.is_valid():
            recipient_user_id = form.cleaned_data['recipient']
        opponent = await get_user_by_id(recipient_user_id)

        if self.chat_consumer.user and opponent and self.chat_consumer.user != opponent:
            contact = await get_or_create_contact(self.chat_consumer.user, opponent)
            if contact:
                if await database_count(contact.blocked) == 0:
                    table = await is_in_table(self.chat_consumer.user)   # comprend pas a quoi sa sert
                    if table and not is_in_this_table(self.chat_consumer.user, opponent):
                        await destroy_table(table) # ----

                    is_in_game_started = await get_game_table_started(self.chat_consumer.user)
                    if is_in_game_started:
                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.chat_consumer.user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': "join_table_you_already_in_game",
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                            }
                        ) 
                        return
                    
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
                                'recipient': recipient_user_id,
                            }
                        )
                        return

                    p_mutex = getPlayerMutex(self.chat_consumer.user.user_id)
                    async with p_mutex:
                        await leave_match(self.chat_consumer.user)

                    async with p_mutex:
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

                    opponent_is_in_game = await get_game_table_Q(opponent)
                    opponent_is_in_t = await get_tournament(opponent)

                    if opponent_is_in_game or opponent_is_in_t:
                        event_type = "join_table_already_in_game"
                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.chat_consumer.user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': event_type,
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                            }
                        ) 
                        return

                    game_table = await get_queue_table(self.chat_consumer.user, opponent)
                    if game_table:
                        await join_table(game_table, self.chat_consumer.user)
                        event_type = "join_table_success"
                        
                        if (await database_count(game_table.players_in_game) == 2):
                            await update_table_status(game_table, "in_game")
                            if (game_table.j1[0] == '$'):
                                j1 = game_table.j1
                                is_j1_bot = True
                            else:
                                j1 = await get_user_by_id(game_table.j1)
                                is_j1_bot = False
                            if (game_table.j2[0] == '$'):
                                j2 = game_table.j2
                                is_j2_bot = True
                            else:
                                j2 = await get_user_by_id(game_table.j2)
                                is_j2_bot = False
                            if (game_table.mode == "2v2" or game_table.mode == "2v2P"):
                                if (game_table.j3[0] == '$'):
                                    j3 = game_table.j3
                                    is_j3_bot = True
                                else:
                                    j3 = await get_user_by_id(game_table.j3)
                                    is_j3_bot = False
                                if (game_table.j4[0] == '$'):
                                    j4 = game_table.j4
                                    is_j4_bot = True
                                else:
                                    j4 = await get_user_by_id(game_table.j4)
                                    is_j4_bot = False
                            else:
                                j3 = None
                                j4 = None
                                is_j3_bot = False
                                is_j4_bot = False
                            Game(game_table, j1, is_j1_bot, j2, is_j2_bot, j3, is_j3_bot, j4, is_j4_bot, None, self.chat_consumer)

                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.chat_consumer.user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': event_type,
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                            }
                        )

                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{opponent.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': event_type,
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                            }
                        )
                        
                                    
                    else:
                        event_type="join_table_not_found"
                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.chat_consumer.user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': event_type,
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                            }
                        )
                    
                        
                else: # contact bloqué par vous ou par l'opposant 
                    event_type = "join_table_blocked"

                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{self.chat_consumer.user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': event_type,
                            'sender': self.chat_consumer.user.user_id,
                            'recipient': recipient_user_id,
                        }
                    )        
