from .database import get_user_by_id, database_count, get_game_table, set_in_game, tournament_match1, tournament_match2, tournament_match3, tournament_match4
from ..forms import EventTypeForm, GamePanelForm

import json

import asyncio

from django.utils import timezone

from .game.global_data import getData, setData
from .game.game import Game, spawn_powerup

class GamePanel():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def game(self, game):
        i = 0
        while (i < 15):
            are_all_loaded = True
            for player in game.player:
                if game.player[player].bot["status"] == False and game.player[player].is_loaded == False:
                    are_all_loaded = False
            if are_all_loaded == True:
                break
            i += 1
            await asyncio.sleep(1)
        await game.sendDraw()
        for player_key in game.player:
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{game.player[player_key].socket_id}",
                {
                    'type': 'send_message',
                    'event_type': 'minus_timer',
                    'timer': '3',
                })
        await asyncio.sleep(1)
        await game.sendDraw()
        for player_key in game.player:
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{game.player[player_key].socket_id}",
                {
                    'type': 'send_message',
                    'event_type': 'minus_timer',
                    'timer': '2',
                })
        await asyncio.sleep(1)
        await game.sendDraw()
        for player_key in game.player:
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{game.player[player_key].socket_id}",
                {
                    'type': 'send_message',
                    'event_type': 'minus_timer',
                    'timer': '1',
                })
        await asyncio.sleep(1)
        await game.sendDraw()
        for player_key in game.player:
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{game.player[player_key].socket_id}",
                {
                    'type': 'send_message',
                    'event_type': 'minus_timer',
                    'timer': '0',
                })
        game.spawnPowerUpInterval = asyncio.create_task(spawn_powerup(game))
        game.begin_date = timezone.now()
        while (1):
            await asyncio.sleep(1/60)
            await game.play()

    async def receive(self, text_data_json):
        form = EventTypeForm(text_data_json)
        
        if form.is_valid():
            event_type = form.cleaned_data['event_type']
            
            if self.chat_consumer.user:
                table = await get_game_table(self.chat_consumer.user)
                if table:
                    game = getData(table.id)
                    if game:
                        if event_type == "key_press" or event_type == "key_release":
                            form_action = GamePanelForm(text_data_json)
                                
                            if form_action.is_valid():
                                if event_type == "key_press":
                                    action = form_action.cleaned_data['action']
                                    if action == "UP" or action == "DOWN":
                                        game.player[self.chat_consumer.user.user_id].keyPressed[action] = True
                                    if action == "LEFT" and not game.player[self.chat_consumer.user.user_id].keyPressed[action]:
                                        game.player[self.chat_consumer.user.user_id].keyPressed[action] = True
                                        game.player[self.chat_consumer.user.user_id].break_ice()
                                elif event_type == "key_release":
                                    action = form_action.cleaned_data['action']
                                    if action == "UP" or action == "DOWN" or action == "LEFT":
                                        game.player[self.chat_consumer.user.user_id].keyPressed[action] = False
                        elif event_type == "request_draw":
                            if game.player[self.chat_consumer.user.user_id].is_loaded == True:
                                return
                            async with game.mutex:
                                first = True
                                for player in game.player:
                                    if game.player[player].bot["status"] == False and game.player[player].is_loaded == True:
                                        first = False
                                game.player[self.chat_consumer.user.user_id].is_loaded = True
                                game.player[self.chat_consumer.user.user_id].socket_id = self.chat_consumer.user.socket_id
                                await set_in_game(self.chat_consumer.user, True)
                                if first and game.t_force_loaded == False:
                                    game.task = asyncio.create_task(self.game(game))
                                    game.t_force_loaded = True
                            if game.tournament:
                                other_game = None
                                match1 = await tournament_match1(game.tournament)
                                match2 = await tournament_match2(game.tournament)
                                match3 = await tournament_match3(game.tournament)
                                match4 = await tournament_match4(game.tournament)
                                if match1.id == game.table.id:
                                    other_game = getData(match2.id)
                                elif match2.id == game.table.id:
                                    other_game = getData(match1.id)
                                elif match3.id == game.table.id:
                                    other_game = getData(match4.id)
                                elif match4.id == game.table.id:
                                    other_game = getData(match3.id)
                                if other_game:
                                    async with other_game.mutex:
                                        first_other = True
                                        for player in other_game.player:
                                            if other_game.player[player].bot["status"] == False and other_game.player[player].is_loaded == True:
                                                first_other = False
                                        if first_other and other_game.t_force_loaded == False:
                                            other_game.task = asyncio.create_task(self.game(other_game))
                                            other_game.t_force_loaded = True
                    
                    
