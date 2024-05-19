from django.utils import timezone
from ..forms import SocketNewModeTournamentForm
import random
from django.core.files.base import ContentFile
import base64
import asyncio

from .game.game import Game
from .database import get_user_by_id, join_tournament, find_tournament, save_join_tournament, unlocked_my_tournament, find_my_tournament, clear_tournaments, stop_matchmaking_T,find_starting_tournament,  get_players_table, find_opponent_tournament, create_gestion_tournament, leave_tournament, tournament_ready, verifAndStart, isReadyTP, getMatch, checkTournamnetCanStart2, launchTournamentRound1, launchTournamentRound2, startTournamentRound1, startTournamentRound2, checkTournamnetCanStart

import json
import time
from .game.global_data import setPlayerMutex, getPlayerMutex

def get_origin_from_headers(headers):
    for header_name, header_value in headers:
        if header_name == b'origin':
            return header_value.decode('utf-8')
    
    return None

class Tournament():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def accessTournament(self, text_data_json):
        form = SocketNewModeTournamentForm(text_data_json)
        if form.is_valid():
            mode = form.cleaned_data['mode']

        if (mode != '1v1' and mode != '1v1P' and mode != '2v2' and mode != '2v2P'):
            mode = '1v1'
        # find a match
        my_tournament = await find_my_tournament(self.chat_consumer.user)
        if my_tournament:
            tournament = await find_starting_tournament(self.chat_consumer.user)
            if (tournament):
                nb_max_player = 4
                users = await get_players_table(tournament)
                if (len(users) == nb_max_player):
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{self.chat_consumer.user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'maj_tournament_group',
                            'refreshPlayers': True,
                            'refreshMatch': False,
                        }
                    )
                    return
            await self.chat_consumer.channel_layer.group_send(
                f"chat_{self.chat_consumer.user.socket_id}",
                {
                    'type': 'send_message',
                    'event_type': 'maj_tournament_group',
                    'refreshPlayers': True,
                    'refreshMatch': False,
                }
            )
        else:
            # start 2 task
            time.sleep(1.1)
            my_mutex = getPlayerMutex(self.chat_consumer.user.user_id)
            async with my_mutex:
                main_user = await get_user_by_id(self.chat_consumer.user.user_id)
                my_tournament = await create_gestion_tournament(main_user, mode)
                asyncio.create_task(self.gestion_tournament(main_user, mode))

    async def gestion_tournament(self, main_user, mode):
        nb_max_player = 4
        my_mutex = getPlayerMutex(main_user.user_id)
        loop = 1
        while (True):
            async with my_mutex:
                my_tournament = await find_my_tournament(main_user)
                starting_tournament = await find_starting_tournament(main_user)
                ## EXIT conditons
                if (my_tournament == None):  # if my game is deleted
                    return
                if starting_tournament != None:
                    if (starting_tournament.status != 'ready' and starting_tournament.status != 'none'): #game started
                        await stop_matchmaking_T(main_user, starting_tournament)
                        return
                    elif starting_tournament.status == 'ready':
                        await clear_tournaments(main_user, starting_tournament)
                else:
                    ## Verif my own game
                    users = await get_players_table(my_tournament)
                    if my_tournament.status == 'none' and len(users) == nb_max_player: # can start my match
                        #starting the game
                        await tournament_ready(my_tournament)
                        for user in users:
                            await self.chat_consumer.channel_layer.group_send(
                                f"chat_{user.socket_id}",
                                {
                                    'type': 'send_message',
                                    'event_type': 'maj_tournament_group',
                                    'refreshPlayers': True,
                                    'refreshMatch': False,
                                }
                            )
                    else: # can search for match
                        opponent_tournament = await find_opponent_tournament(main_user, mode, loop)
                        if (opponent_tournament and opponent_tournament.locked == False):
                            opponent = await get_user_by_id(opponent_tournament.owner)
                            if (opponent):
                                joined_tournament = await join_tournament(opponent, main_user, mode)
                                if (joined_tournament):
                                    jt_players = await get_players_table(joined_tournament)
                                    for jt_player in jt_players:
                                        await self.chat_consumer.channel_layer.group_send(
                                            f"chat_{jt_player.socket_id}",
                                            {
                                                'type': 'send_message',
                                                'event_type': 'maj_tournament_group',
                                                'refreshPlayers': True,
                                                'refreshMatch': False,
                                            }
                                        )
                        loop += 1
                        my_tournament = await find_my_tournament(main_user)
                        await unlocked_my_tournament(my_tournament, main_user)

            await asyncio.sleep(0.5)


    async def leaveTournament(self, text_data_json):
        p_mutex = getPlayerMutex(self.chat_consumer.user.user_id)
        async with p_mutex:
            starting_tournament = await find_starting_tournament(self.chat_consumer.user)
            if (starting_tournament and starting_tournament.status != 'ready' and starting_tournament.status != 'none'):
                return
            leaved_tournaments = await leave_tournament(self.chat_consumer.user)
        await self.chat_consumer.channel_layer.group_send(
            f"chat_{self.chat_consumer.user.socket_id}",
            {
                'type': 'send_message',
                'event_type': 'tournament_left',
            }
        )
        for l_tournament in leaved_tournaments:
            users = await get_players_table(l_tournament)
            for user in users:
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'maj_tournament_group',
                        'refreshPlayers': True,
                        'refreshMatch': False,
                    }
                    )

    async def tp_isReady(self, text_data_json): #tournament player is ready
        p_mutex = getPlayerMutex(self.chat_consumer.user.user_id)
        async with p_mutex:
            tournament = await isReadyTP(self.chat_consumer.user)

        if tournament:
            users = await get_players_table(tournament)

            for user in users:
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'maj_tournament_group',
                        'refreshPlayers': True,
                        'refreshMatch': False,
                    }
                )
            async with p_mutex:
                res = await checkTournamnetCanStart(self.chat_consumer.user)
            if (res != None):
                asyncio.create_task(self.launchRound1(self.chat_consumer.user))

    async def launchRound1(classInstance, sender):
        p_mutex = getPlayerMutex(classInstance.chat_consumer.user.user_id)
        async with p_mutex:
            tournament = await launchTournamentRound1(sender)

            if tournament:
                users = await get_players_table(tournament)

                for user in users:
                    await classInstance.chat_consumer.channel_layer.group_send(
                        f"chat_{user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'maj_tournament_group',
                            'refreshPlayers': False,
                            'refreshMatch': True,
                        }
                    )
                asyncio.create_task(classInstance.startRound1(sender))
            
    async def startRound1(classInstance, sender):
        p_mutex = getPlayerMutex(classInstance.chat_consumer.user.user_id)
        async with p_mutex:
            await asyncio.sleep(3)
            tournament = await startTournamentRound1(sender)
            if tournament:
                match1 = await getMatch(1, sender)
                m1p1 = await get_user_by_id(match1.j1)
                m1p2 = await get_user_by_id(match1.j2)
                game1 = Game(match1, m1p1, False, m1p2, False, None, False, None, False, tournament, classInstance.chat_consumer)
                match2 = await getMatch(2, sender)
                m2p1 = await get_user_by_id(match2.j1)
                m2p2 = await get_user_by_id(match2.j2)
                game2 = Game(match2, m2p1, False, m2p2, False, None, False, None, False, tournament, classInstance.chat_consumer)

                users = await get_players_table(tournament)

                for user in users:
                    await classInstance.chat_consumer.channel_layer.group_send(
                        f"chat_{user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'maj_tournament_group',
                            'refreshPlayers': False,
                            'refreshMatch': False,
                        }
                    )
            

    async def tp_isReady2(self, text_data_json):
        tournament = await isReadyTP(self.chat_consumer.user)

        if tournament:
            users = await get_players_table(tournament)

            for user in users:
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'maj_tournament_group',
                        'refreshPlayers': True,
                        'refreshMatch': False,
                    }
                )
            
            asyncio.create_task(self.verifAFKReadyRound2(self.chat_consumer.user))
            if (await checkTournamnetCanStart2(self.chat_consumer.user) != None):
                asyncio.create_task(self.launchRound2(self.chat_consumer.user))

    async def verifAFKReadyRound2(self, sender):
        await asyncio.sleep(30)
        tournament = await verifAndStart(sender)
        if tournament:
            asyncio.create_task(self.launchRound2(sender))

    async def launchRound2(classInstance, sender):
        tournament = await launchTournamentRound2(sender)
        if tournament:
            users = await get_players_table(tournament)

            for user in users:
                await classInstance.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'maj_tournament_group',
                        'refreshPlayers': False,
                        'refreshMatch': True,
                    }
                )
            asyncio.create_task(classInstance.startRound2(sender))
            
    async def startRound2(classInstance, sender):
        await asyncio.sleep(3)
        tournament = await startTournamentRound2(sender)
        if tournament:
            match1 = await getMatch(3, sender)
            m1p1 = await get_user_by_id(match1.j1)
            m1p2 = await get_user_by_id(match1.j2)
            game1 = Game(match1, m1p1, False, m1p2, False, None, False, None, False, tournament, classInstance.chat_consumer)
            match2 = await getMatch(4, sender)
            m2p1 = await get_user_by_id(match2.j1)
            m2p2 = await get_user_by_id(match2.j2)
            game2 = Game(match2, m2p1, False, m2p2, False, None, False, None, False, tournament, classInstance.chat_consumer)

            users = await get_players_table(tournament)

            for user in users:
                await classInstance.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'maj_tournament_group',
                        'refreshPlayers': False,
                        'refreshMatch': False,
                    }
                )
            
    async def majChangeDisplay(self, text_data_json):
        p_mutex = getPlayerMutex(self.chat_consumer.user.user_id)
        async with p_mutex:
            tournament = await find_starting_tournament(self.chat_consumer.user)
            if (tournament == None):
                tournament = await find_my_tournament(self.chat_consumer.user)
        if (tournament):
            users = await get_players_table(tournament)
            for user in users:
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'maj_tournament_group',
                        'refreshPlayers': True,
                        'refreshMatch': False,
                    }
                )