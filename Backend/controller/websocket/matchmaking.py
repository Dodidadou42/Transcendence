from django.utils import timezone
from ..forms import SocketNewModeTournamentForm
import random
from django.core.files.base import ContentFile
import base64
import asyncio
import time

from .database import get_user_by_id, find_match, unlocked_my_match, locked_my_match, find_my_match, clear_matchs, cancel_match, stop_matchmaking, find_starting_match, get_players_table, leave_match, start_match, is_match, match_ready, launch_match, join_game, create_gestion_match, find_opponent
from .game.game import Game
from .game.global_data import setPlayerMutex, getPlayerMutex

import json

def get_origin_from_headers(headers):
    for header_name, header_value in headers:
        if header_name == b'origin':
            return header_value.decode('utf-8')
    
    return None

def print_en_couleur(texte, couleur):
    couleurs = {
        'noir': '\033[30m',
        'rouge': '\033[31m',
        'vert': '\033[32m',
        'jaune': '\033[33m',
        'bleu': '\033[34m',
        'magenta': '\033[35m',
        'cyan': '\033[36m',
        'blanc': '\033[37m',
    }
    fin_couleur = '\033[0m'

class Matchmaking():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def accessMatch(self, text_data_json):
        form = SocketNewModeTournamentForm(text_data_json)
        if form.is_valid():
            mode = form.cleaned_data['mode']

        if (mode != '1v1' and mode != '1v1P' and mode != '2v2' and mode != '2v2P'):
            mode = '1v1'
        # find a match
        my_match = await find_my_match(self.chat_consumer.user)
        if my_match:
            match = await find_starting_match(self.chat_consumer.user)
            if (match):
                nb_max_player = 2
                if (mode == '2v2' or mode == '2v2P'):
                    nb_max_player = 4
                users = await get_players_table(match)
                if (len(users) == nb_max_player):
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{self.chat_consumer.user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'joined_match', #no cancel but the design will be the good one on front
                        }
                    )
                    return
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{self.chat_consumer.user.socket_id}",
                {
                    'type': 'send_message',
                    'event_type': 'cancel_match',
                }
            )
        else:
            # start 2 task
            time.sleep(1.1)
            my_mutex = getPlayerMutex(self.chat_consumer.user.user_id)
            async with my_mutex:
                main_user = await get_user_by_id(self.chat_consumer.user.user_id)
                ma_game = await create_gestion_match(main_user, mode)
                asyncio.create_task(self.gestion_match(main_user, mode))

# ===================================== gestion ====================================

    async def gestion_match(self, main_user, mode):
        nb_max_player = 2
        if (mode == '2v2' or mode == '2v2P'):
            nb_max_player = 4
        my_mutex = getPlayerMutex(main_user.user_id)
        loop = 1
        while (True):
            async with my_mutex:
                my_match = await find_my_match(main_user)
                starting_match = await find_starting_match(main_user)
                ## EXIT conditons
                if (my_match == None):  # if my game is deleted
                    return
                if starting_match != None:
                    if (starting_match.status != 'ready' and starting_match.status != 'in_queue'): #game started
                        await stop_matchmaking(main_user, starting_match)
                        return
                    elif starting_match.status == 'ready':
                        await clear_matchs(main_user, starting_match)
                else:
                    ## Verif my own game
                    users = await get_players_table(my_match)
                    if my_match.status == 'in_queue' and len(users) == nb_max_player: # can start my match
                        #starting the game
                        await match_ready(my_match)
                        for user in users:
                            await self.chat_consumer.channel_layer.group_send(
                                f"chat_{user.socket_id}",
                                {
                                    'type': 'send_message',
                                    'event_type': 'joined_match',
                                }
                            )
                        asyncio.create_task(self.launchMatch(main_user, nb_max_player))
                    else: # can search for match
                        opponent_match = await find_opponent(main_user, mode, loop)
                        if (opponent_match and opponent_match.locked == False):
                            opponent = await get_user_by_id(opponent_match.owner)
                            if (opponent):
                                joined_mach = await join_game(opponent, main_user, mode)
                        loop += 1
                        my_match = await find_my_match(main_user)
                        await unlocked_my_match(my_match, main_user)

            await asyncio.sleep(0.5)

#       ================================= launch ============================

    async def launchMatch(classInstance, main_user, nb_max_player):
        await asyncio.sleep(3)
        match = await find_my_match(main_user)
        if (match == None):
            return
        users = await get_players_table(match)
        if (match.owner != main_user.user_id) or (len(users) < nb_max_player):
            # await cancel_match(match)
            for user in users:
                await classInstance.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'cancel_match',
                    }
                )
            return 
        match = await launch_match(match)
        if match:
            for user in users: 
                await classInstance.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'maj_match',
                    }
                )
            asyncio.create_task(classInstance.startMatch(match, nb_max_player))

    async def startMatch(classInstance, match, nb_max_player):
        await asyncio.sleep(2)
        users = await get_players_table(match)
        if (len(users) < nb_max_player):
            return
        match = await start_match(match)
        if nb_max_player == 2:
            game = Game(match, users[0], False, users[1], False, None, False, None, False, None, classInstance.chat_consumer)
        else:
            game = Game(match, users[0], False, users[1], False, users[2], False, users[3], False, None, classInstance.chat_consumer)
        await asyncio.sleep(1)
        if match:
            for user in users:
                await classInstance.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'start_match',
                    }
                )


    async def leaveMatchmaking(self, text_data_json):
        users = []
        p_mutex = getPlayerMutex(self.chat_consumer.user.user_id)
        async with p_mutex:
            starting_game = await find_starting_match(self.chat_consumer.user)
            users = await get_players_table(starting_game)
            if (starting_game and starting_game.status == 'game_starting'):
                return
            await leave_match(self.chat_consumer.user)
        await self.chat_consumer.channel_layer.group_send(
            f"chat_{self.chat_consumer.user.socket_id}",
            {
                'type': 'send_message',
                'event_type': 'leave_match',
            }
        )
        for user in users:
            if user.user_id == self.chat_consumer.user.user_id:
                continue
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{user.socket_id}",
                {
                    'type': 'send_message',
                    'event_type': 'cancel_match',
                }
            )