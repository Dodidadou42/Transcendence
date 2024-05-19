from .database import get_game_table_Q, destroy_table, get_user_by_id, get_players_table, launch_custom_game, start_custom_game, get_Cgroup_size\

import json
import asyncio

from .game.game import Game

from asgiref.sync import sync_to_async

class CustomGame():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def Leave(self, text_data_json):
        table = await get_game_table_Q(self.chat_consumer.user)
        players = await get_players_table(table)
        for user in players:
            if user.user_id == self.chat_consumer.user.user_id:
                event_type = "CGLeaveGroup"
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': event_type,
                    }
                )
                continue
            event_type = "ownerCGLeaveGroup"
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{user.socket_id}",
                {
                    'type': 'send_message',
                    'event_type': event_type,
                }
            )
        await destroy_table(table)


    async def launchGame(self, text_data_json):
        match = await launch_custom_game(self.chat_consumer.user)

        if (match != None):
            players = await get_players_table(match)
            event_type = "CGstarted"
            for user in players:
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': event_type,
                    }
                )
            asyncio.create_task(self.startGame(self.chat_consumer.user))
        

    async def startGame(classInstance, sender):
        match = await start_custom_game(sender)
        if (match != None):
            p1 = None
            p1_is_bot = False
            p2 = None
            p2_is_bot = False
            p3 = None
            p3_is_bot = False
            p4 = None
            p4_is_bot = False
            if (match.j1 != 'none'):
                if (match.j1[0] == '$'):
                    p1 = match.j1
                    p1_is_bot = True
                else:
                    p1 = await get_user_by_id(match.j1)
            if (match.j2 != 'none'):
                if (match.j2[0] == '$'):
                    p2 = match.j2
                    p2_is_bot = True
                else:
                    p2 = await get_user_by_id(match.j2)
            if (match.j3 != 'none'):
                if (match.j3[0] == '$'):
                    p3 = match.j3
                    p3_is_bot = True
                else:
                    p3 = await get_user_by_id(match.j3)
            if (match.j4 != 'none'):
                if (match.j4[0] == '$'):
                    p4 = match.j4
                    p4_is_bot = True
                else:
                    p4 = await get_user_by_id(match.j4)
            game = Game(match, p1, p1_is_bot, p2, p2_is_bot, p3, p3_is_bot, p4, p4_is_bot, None, classInstance.chat_consumer)
        

        