import random
import time
import asyncio
import math
from .global_data import setData, getData

from ..database import end_game, update_game_history, get_user_by_id, endTournamentRound, get_players_table, endTournament, set_in_game

from django.utils import timezone

G_SIZE = 1920 + 1080

class Game:
    def __init__(self, table, j1, is_j1_bot, j2, is_j2_bot, j3, is_j3_bot, j4, is_j4_bot, tournament, chat_consumer):
        self.mutex = asyncio.Lock()
        self.table = table
        self.chat_consumer = chat_consumer
        self.mode = table.mode
        self.task = None
        self.end_game = False
        self.tournament = tournament
        self.t_force_loaded = False

        self.player = {}

        if is_j1_bot:
            self.j1_user_id = j1
            self.j1_socket_id = 0
            key = self.j1_user_id
            while key in self.player:
                key = key + "_"
            self.j1_key = key
            self.player[self.j1_key] = Player(1920 / 42 - 1920 / 50, 1080 / 5, 1920 / 50, self.j1_user_id, self.j1_socket_id, True, 0, "J1")
        else:
            self.j1_user_id = j1.user_id
            self.j1_socket_id = j1.socket_id
            self.j1_key = self.j1_user_id
            self.player[self.j1_key] = Player(1920 / 42 - 1920 / 50, 1080 / 5, 1920 / 50, self.j1_user_id, self.j1_socket_id, False, 0, "J1")

        if is_j2_bot:
            self.j2_user_id = j2
            self.j2_socket_id = 0
            key = self.j2_user_id
            while key in self.player:
                key = key + "_"
            self.j2_key = key
            if j3 != None and j4 != None:
                self.player[self.j2_key] = Player(1920 / 42, 1080 / 5, 1920 / 50, self.j2_user_id, self.j2_socket_id, True, 0, "J2")
            else:
                self.player[self.j2_key] = Player(1920 - 1920 / 42, 1080 / 5, 1920 / 50, self.j2_user_id, self.j2_socket_id, True, 1, "J2")  
        else:
            self.j2_user_id = j2.user_id
            self.j2_socket_id = j2.socket_id
            self.j2_key = self.j2_user_id
            if j3 != None and j4 != None:
                self.player[self.j2_key] = Player(1920 / 42, 1080 / 5, 1920 / 50, self.j2_user_id, self.j2_socket_id, False, 0, "J2")
            else:
                self.player[self.j2_key] = Player(1920 - 1920 / 42, 1080 / 5, 1920 / 50, self.j2_user_id, self.j2_socket_id, False, 1, "J2")      

        if j3 != None and j4 != None:
            if is_j3_bot:
                self.j3_user_id = j3
                self.j3_socket_id = 0
                key = self.j3_user_id
                while key in self.player:
                    key = key + "_"
                self.j3_key = key
                self.player[self.j3_key] = Player(1920 - 1920 / 42 - 1920/50, 1080 / 5, 1920 / 50, self.j3_user_id, self.j3_socket_id, True, 1, "J3")
            else:
                self.j3_user_id = j3.user_id
                self.j3_socket_id = j3.socket_id
                self.j3_key = self.j3_user_id
                self.player[self.j3_key] = Player(1920 - 1920 / 42 - 1920/50, 1080 / 5, 1920 / 50, self.j3_user_id, self.j3_socket_id, False, 1, "J3")
                

            if is_j4_bot:
                self.j4_user_id = j4
                self.j4_socket_id = 0
                key = self.j4_user_id
                while key in self.player:
                    key = key + "_"
                self.j4_key = key
                self.player[self.j4_key] = Player(1920 - 1920 / 42, 1080 / 5, 1920 / 50, self.j4_user_id, self.j4_socket_id, True, 1, "J4")
            else:
                self.j4_user_id = j4.user_id
                self.j4_socket_id = j4.socket_id
                self.j4_key = self.j4_user_id
                self.player[self.j4_key] = Player(1920 - 1920 / 42, 1080 / 5, 1920 / 50, self.j4_user_id, self.j4_socket_id, False, 1, "J4")
                
        else:
            self.j3_user_id = None
            self.j3_socket_id = 0
            self.j4_user_id = None
            self.j4_socket_id = 0

        if tournament != None:
            if j1.pseudo == tournament.j1:
                self.j1_pseudo = tournament.j1Pseudo
            elif j1.pseudo == tournament.j2:
                self.j1_pseudo = tournament.j2Pseudo
            elif tournament.j3 and j1.pseudo == tournament.j3:
                self.j1_pseudo = tournament.j3Pseudo
            elif tournament.j4 and j1.pseudo == tournament.j4:
                self.j1_pseudo = tournament.j4Pseudo
            if j2.pseudo == tournament.j1:
                self.j2_pseudo = tournament.j1Pseudo
            elif j2.pseudo == tournament.j2:
                self.j2_pseudo = tournament.j2Pseudo
            elif tournament.j3 and j2.pseudo == tournament.j3:
                self.j2_pseudo = tournament.j3Pseudo
            elif tournament.j4 and j2.pseudo == tournament.j4:
                self.j2_pseudo = tournament.j4Pseudo
        else:
            self.j1_pseudo = j1.pseudo
            if is_j2_bot:
                self.j2_pseudo = j2[1:]
            else:
                self.j2_pseudo = j2.pseudo
            if j3 != None and j4 != None:
                if is_j3_bot:
                    self.j3_pseudo = j3[1:]
                else:
                    self.j3_pseudo = j3.pseudo
                if is_j4_bot:
                    self.j4_pseudo = j4[1:]
                else:
                    self.j4_pseudo = j4.pseudo
        self.player[self.j1_key].pseudo = self.j1_pseudo
        self.player[self.j2_key].pseudo = self.j2_pseudo
        if j3 != None and j4 != None:
            self.player[self.j3_key].pseudo = self.j3_pseudo
            self.player[self.j4_key].pseudo = self.j4_pseudo

        self.current_points_streak_right = 0
        self.score_left = 0
        self.powerups_activated_left = 0
        self.bonus_activated_left = 0
        self.malus_activated_left = 0
        self.highest_points_streak_left = 0
        self.current_points_streak_left = 0
        
        self.score_right = 0
        self.powerups_activated_right = 0
        self.bonus_activated_right = 0
        self.malus_activated_right = 0
        self.highest_points_streak_right = 0

        self.ball = [
                Ball(1920 / 2,
                    1080 / 2,
                    G_SIZE / 210,
                    (random.random() < 0.5) * math.pi - (random.random() - 0.5) * math.pi / 2)
        ]
        self.powerups = []
        self.playing = False
        self.spawnPowerUpInterval = 0
        
        self.game_start = None
        self.total_balls_hits = 0
        self.highest_balls_hits_streak = 0
        self.current_balls_hits_streak = 0
        self.highest_balls_speed = 0
        self.total_powerups_activated = 0
        self.total_freeze_powerups_activated = 0
        self.total_slow_powerups_activated = 0
        self.total_speed_powerups_activated = 0
        self.total_multi_ball_powerups_activated = 0
        self.total_racket_reduction_powerups_activated = 0
        self.total_racket_increase_powerups_activated = 0
        
        self.last_point = "None"

        self.begin_date = None
        self.game_duration = None
        
        self.point_time_time = [0]
        self.point_time_left = [0]
        self.point_time_right = [0]
        setData(table.id, self)
        
    async def sendDraw(self):
        dico = {
            'type': 'send_message',
            'event_type': 'draw',
            'score_left': self.score_left,
            'score_right': self.score_right,
        }
        i = 0
        for player_key in self.player:
            dico.update({
                'px' + str(i): self.player[player_key].x,
                'py' + str(i): self.player[player_key].y,
                'pheight' + str(i): self.player[player_key].height,
                'pwidth' + str(i): self.player[player_key].width,
                'visible' + str(i): self.player[player_key].visible,
                'borderColor' + str(i): self.player[player_key].borderColor,
                'borderColorVisible' + str(i): self.player[player_key].borderColorVisible,
                'status_ice' + str(i): self.player[player_key].status["ice"],
                'bounce_animation_status' + str(i) : self.player[player_key].bounceAnimation['status'],
                'bounce_animation_x' + str(i) : self.player[player_key].bounceAnimation['x'],
                'bounce_animation_y' + str(i) : self.player[player_key].bounceAnimation['y'],
                'bounce_animation_src' + str(i) : self.player[player_key].bounceAnimation['src'],
                'pressLeftVisible' + str(i) : self.player[player_key].pressLeftAnimation["status"],
                'pressLeftAnimationState' + str(i) : self.player[player_key].pressLeftAnimation["state"],
                'pseudo' + str(i) : self.player[player_key].pseudo,
            })
            j = 0
            for iceParticle in self.player[player_key].iceParticles:
                dico.update({
                    'particlex' + str(i) + str(j): iceParticle["x"],
                    'particley' + str(i) + str(j): iceParticle["y"],
                    'particlewidth' + str(i) + str(j): iceParticle["width"],
                    'particleheight' + str(i) + str(j): iceParticle["height"],
                    'particleopacity' + str(i) + str(j): iceParticle["opacity"],
                })
                j += 1
            i += 1
        i = 0
        for ball in self.ball:
            dico.update({
                'ballx' + str(i): ball.x,
                'bally' + str(i): ball.y,
                'ballr' + str(i): ball.r,
                'powerup_ice' + str(i): ball.ice,
            })
            i += 1
        i = 0
        for powerup in self.powerups:
            dico.update({
                'powerupname' + str(i): powerup["name"],
                'powerupx' + str(i): powerup['x'],
                'powerupy' + str(i): powerup['y'],
            })
            i += 1
        for player_key in self.player:
            await self.chat_consumer.channel_layer.group_send(f"chat_{self.player[player_key].socket_id}", dico)

    async def play(self):
        await self.sendDraw()
        if self.end_game == False:
            for player_key in self.player:
                await self.player[player_key].routine(self)
            for ball_i in self.ball:
                await ball_i.routine(self)

    async def final_game_task(self):
        await asyncio.sleep(5)
        
        players = await get_players_table(self.table)
        for player in players:
            await set_in_game(player, False)

        lastPK = ''
        for player_key in self.player:
            tournament = await endTournamentRound(player_key)
            lastPK = player_key
            if (tournament):
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{self.player[player_key].socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'end_round_tournament',
                    })
                if (tournament.status == 'prepare2' or tournament.status == 'round2Over'):
                    tplayers = await get_players_table(tournament)
                    for tplayer in tplayers:
                        if (tplayer.user_id != player_key):
                            await self.chat_consumer.channel_layer.group_send(
                                f"chat_{tplayer.socket_id}",
                                {
                                    'type': 'send_message',
                                    'event_type': 'maj_tournament_group',
                                    'refreshPlayers': False,
                                    'refreshMatch': True,
                                })
            else :
                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{self.player[player_key].socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'end_game',
                        'game_id': self.table.pk,
                    })
        
        self.task.cancel()
        await endTournament(lastPK)

    async def point_scored_reset_positions(self, ball):
        for player_key in self.player:
            player = self.player[player_key]
            player.bot["bestBounceY"] = None
            player.bot["bestBounceScore"] = 0
        if ball.x < 0:
            if self.last_point == "right":
                self.current_points_streak_right += 1
            else:
                self.current_points_streak_right = 1
                
            if self.current_points_streak_right > self.highest_points_streak_right:
                self.highest_points_streak_right = self.current_points_streak_right

            self.last_point = "right"
            self.score_right += 1
            
            self.point_time_time.append(math.floor((timezone.now() - self.begin_date).total_seconds()))
            self.point_time_left.append(self.score_right)
            self.point_time_right.append(self.score_left)
        else:
            if self.last_point == "left":
                self.current_points_streak_left += 1
            else:
                self.current_points_streak_left = 1
                
            if self.current_points_streak_left > self.highest_points_streak_left:
                self.highest_points_streak_left = self.current_points_streak_left
            
            self.last_point = "left"
            self.score_left += 1

            self.point_time_time.append(math.floor((timezone.now() - self.begin_date).total_seconds()))
            self.point_time_left.append(self.score_right)
            self.point_time_right.append(self.score_left)

        if self.current_balls_hits_streak > self.highest_balls_hits_streak:
            self.highest_balls_hits_streak = self.current_balls_hits_streak
        self.current_balls_hits_streak = 0
        
        for ball_i in self.ball:
            if ball_i.speed > self.highest_balls_speed:
                self.highest_balls_speed = ball_i.speed

        if self.score_right == 5 or self.score_left == 5:
            self.game_duration = math.floor((timezone.now() - self.begin_date).total_seconds())
            await update_game_history(self)
            if self.score_right == 5:
                if self.j3_user_id != None and self.j4_user_id != None:
                    await end_game(self.table, self.j3_user_id, self.j4_user_id, self.j1_user_id, self.j2_user_id, self.score_right, self.score_left, 
                        self.powerups_activated_right, self.powerups_activated_left,
                        self.bonus_activated_right, self.bonus_activated_left,
                        self.malus_activated_right, self.malus_activated_left,
                        self.highest_points_streak_right, self.highest_points_streak_left,
                        self.point_time_right, self.point_time_left, self.point_time_time)
                    for player_key in self.player:
                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.player[player_key].socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': 'game_result',
                                'winner': self.j3_user_id,
                                'winner2': self.j4_user_id,
                            })
                else:
                    await end_game(self.table, self.j2_user_id, None, self.j1_user_id, None, self.score_right, self.score_left, 
                        self.powerups_activated_right, self.powerups_activated_left,
                        self.bonus_activated_right, self.bonus_activated_left,
                        self.malus_activated_right, self.malus_activated_left,
                        self.highest_points_streak_right, self.highest_points_streak_left,
                        self.point_time_right, self.point_time_left, self.point_time_time)
                    for player_key in self.player:
                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.player[player_key].socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': 'game_result',
                                'winner': self.j2_user_id,
                                'winner2': None,
                            })
            else:
                if self.score_left == 5:
                    if self.j3_user_id != None and self.j4_user_id != None:
                        await end_game(self.table, self.j1_user_id, self.j2_user_id, self.j3_user_id, self.j4_user_id, self.score_left, self.score_right,
                            self.powerups_activated_left, self.powerups_activated_right,
                            self.bonus_activated_left, self.bonus_activated_right,
                            self.malus_activated_left, self.malus_activated_right,
                            self.highest_points_streak_left, self.highest_points_streak_right,
                            self.point_time_left, self.point_time_right, self.point_time_time)
                        for player_key in self.player:
                            await self.chat_consumer.channel_layer.group_send(
                                f"chat_{self.player[player_key].socket_id}",
                                {
                                    'type': 'send_message',
                                    'event_type': 'game_result',
                                    'winner': self.j1_user_id,
                                    'winner2': self.j2_user_id,
                                })
                    else:
                        await end_game(self.table, self.j1_user_id, None, self.j2_user_id, None, self.score_left, self.score_right,
                            self.powerups_activated_left, self.powerups_activated_right,
                            self.bonus_activated_left, self.bonus_activated_right,
                            self.malus_activated_left, self.malus_activated_right,
                            self.highest_points_streak_left, self.highest_points_streak_right,
                            self.point_time_left, self.point_time_right, self.point_time_time)
                        for player_key in self.player:
                            await self.chat_consumer.channel_layer.group_send(
                                f"chat_{self.player[player_key].socket_id}",
                                {
                                    'type': 'send_message',
                                    'event_type': 'game_result',
                                    'winner': self.j1_user_id,
                                    'winner2': None,
                                })
            self.spawnPowerUpInterval.cancel()
            asyncio.create_task(self.final_game_task())
            self.ball = []
            self.end_game = True
        else:
            self.ball = [
                    Ball(1920 / 2,
                        1080 / 2,
                        G_SIZE / 210,
                        (random.random() < 0.5) * math.pi - (random.random() - 0.5) * math.pi / 2)
                ]

class Ball:
    def __init__(self, x, y, r, direction):
        
        self.x = x
        self.y = y
        self.r = r
        self.speed = G_SIZE / 370
        self.direction = direction
        self.nextY = None
        self.lastTouch = -1
        self.ice = False
        self.checkCollision = False

    #ROUTINE
    async def routine(self, game):
        #CHECK BOUNCE
        self.check_bounce(game)
        #CHECK POWERUPS
        for p in game.powerups:
            if (self.x + self.r > p['x'] and self.x - self.r < p['x'] + G_SIZE / 22.4
                and self.y + self.r > p['y'] and self.y - self.r < p['y'] + G_SIZE / 22.4):
                pickup_powerup(game, p, self)
        #CHECK POINT SCORED
        if self.x < 0 or self.x > 1920:
            await game.point_scored_reset_positions(self)
        #SIMULATE NEXT X Y
        new_x = self.x + self.speed * math.cos(self.direction)
        new_y = self.y + self.speed * math.sin(self.direction)
        #CHECK PLAYER CLIPPING
        for player_key in game.player:
            player = game.player[player_key]
            if (player.x < 1920 / 2 and new_x < 1920 / 2 and new_x < player.x + player.width and self.x > player.x + player.width) \
                    or (player.x > 1920 / 2 and new_x > 1920 / 2 and new_x > player.x and self.x < player.x):
                if player.x < 1920 / 2:
                    self.check_player_collision(new_x, new_y, player.x + player.width, player.y, player.height)
                else:
                    self.check_player_collision(new_x, new_y, player.x, player.y, player.height)
        #MOVE
        if not self.checkCollision:
            self.x = new_x
            self.y = new_y
        self.checkCollision = False

    def check_player_collision(self, new_x, new_y, player_x, player_y, player_height):
        y3 = self.y + ((new_y - self.y) / (new_x - self.x)) * (player_x - self.x)
        if player_y < y3 < player_y + player_height:
            self.x = player_x
            self.y = y3
            self.checkCollision = True

    def check_bounce(self, game):
        #BOUNCE WALLS
        if self.y + self.r > 1080 or self.y - self.r < 0:
            self.direction = 2 * math.pi - self.direction
            self.y = self.r if self.y - self.r < 0 else 1080 - self.r
        #BOUNCE PLAYERS
        for player_key in game.player:
            player = game.player[player_key]
            if (self.x - self.r < 1920 / 2 and self.x - self.r <= player.width + player.x and self.x + self.r >= player.x
                and self.y + self.r >= player.y and self.y - self.r <= player.y + player.height) \
                    or (self.x + self.r > 1920 / 2 and self.x + self.r >= player.x and self.x - self.r <= player.x + player.width
                        and self.y + self.r >= player.y and self.y - self.r <= player.y + player.height):
                normalized_impact = (self.y - (player.y + player.height / 2)) / (player.height / 2)
                self.direction = normalized_impact * math.pi / 3 if player.team == 0 else math.pi - normalized_impact * math.pi / 3
                self.animate_bounce(player)
                self.actualize_data_after_bounce(game, player)
                
    def actualize_data_after_bounce(self, game, player):
        if self.speed * 1.1 < G_SIZE / 37:
            self.speed *= 1.1
        self.lastTouch = player.team
        self.nextY = None
        player.check_ice(self)
        game.total_balls_hits += 1
        game.current_balls_hits_streak += 1
        for p in game.player:
            if game.player[p].bot["status"]:
                game.player[p].bot_reset_data("BOUNCE")

    def animate_bounce(self, player):
        player.bounceAnimation['x'] = player.x 
        player.bounceAnimation['y'] = self.y - G_SIZE / 74
        player.bounceAnimation['status'] = True
        if player.x > 1920 / 2: 
            player.bounceAnimation['x'] -= G_SIZE / 56

        async def animate():
            i = 1
            while i != 4:
                await asyncio.sleep(0.05)
                if player.x < 1920 / 2:
                    player.bounceAnimation['src'] = f"./ballBounce0{i}.png"
                else:
                    player.bounceAnimation['src'] = f"./ballBounce{i}.png"
                i += 1
            player.bounceAnimation['status'] = False 
        asyncio.create_task(animate())


class Player:
    def __init__(self, x, height, width, user_id, socket_id, is_bot, team, index):
        
        self.is_loaded = False
        self.socket_id = socket_id
        self.user_id = user_id
        self.index = index
        self.team = team
        
        self.x = x
        self.y = 1080 / 2 - height / 2
        self.lastY = None
        self.height = height
        self.width = width
        self.dir = "IDLE"
        self.speed = G_SIZE / 224

        self.visible = True
        self.borderColor = "white"
        self.borderColorVisible = True
        self.shakingAnimationState = 0
        
        self.iceParticles = []
        self.keyPressed = {
            "UP": False,
            "DOWN": False,
            "LEFT": False,
        }
        self.status = {
            "ice": False,
            "speed": 0,
        }
        self.bounceAnimation = {
            "status": False,
            "x": 0,
            "y": 0,
            "src": "",
        }
        self.pressLeftAnimation = {
            "status": False,
            "state": 0,
        }
        self.bot = {
            "status": is_bot,
            "lastMoved": time.time(),
            "lastBreakIce": time.time(),
            "breakIceReactionTime": 0.150,
            "reactionTime": 0.3,
            "bestBounceScore": 0,
            "bestBounceY": None,
            "tolerance": None,
        }

    #ROUTINE
    async def routine(self, game):
        if self.bot["status"]:
            self.bot_routine(game)
        self.animate_ice_break()
        self.move(game)
    

    def move(self, game):
        if not self.bot["status"]:
            if (self.keyPressed["UP"] and self.keyPressed["DOWN"]) or (not self.keyPressed["UP"] and not self.keyPressed["DOWN"]):
                self.dir = "IDLE"
            elif self.keyPressed["UP"] and not self.keyPressed["DOWN"]:
                self.dir = "UP"
            elif not self.keyPressed["UP"] and self.keyPressed["DOWN"]:
                self.dir = "DOWN"

        if self.dir == "UP" and not self.status["ice"]:
            if self.bot["status"] and (game.mode == "2v2" or game.mode == "2v2P") and (self.index == "J1" or self.index == "J3"):
                self.y = max(1080 / 2, self.y - self.speed)
            else:
                self.y = max(0, self.y - self.speed)
        elif self.dir == "DOWN" and not self.status["ice"]:
            if self.bot["status"] and (game.mode == "2v2" or game.mode == "2v2P") and (self.index == "J2" or self.index == "J4"):
                self.y = min((1080 / 2), self.y + self.speed)
            else:
                self.y = min(1080 - self.height, self.y + self.speed)
        if (self.bot["status"]) and (self.y == 0 or self.y + self.height == 1080) and self.y != self.lastY:
            self.bot_reset_data("MINMAX")
        if (self.y != self.lastY):
            self.lastY = None

    #SPEEDCHANGE
    def speed_change(self, speed):
        if self.bot["status"]:
            self.bot_reset_data("SPEEDCHANGE")
        self.status["speed"] += 1 if speed == "FAST" else -1
        self.speed *= 2 if speed == "FAST" else 0.5
        self.borderColor = "green" if speed == "FAST" else "red"
        # BLINKING
        blinking = asyncio.create_task(self.toggle_border_color())
        # SPEEDREVERT
        asyncio.create_task(self.revert_speed(speed, blinking))
    async def toggle_border_color(self):
        await asyncio.sleep(4)
        while True:
            await asyncio.sleep(0.1)
            self.borderColorVisible = not self.borderColorVisible
    async def revert_speed(self, speed, blinking):
        await asyncio.sleep(5)
        if self.bot["status"]:
            self.bot_reset_data("SPEEDREVERT")
        blinking.cancel()
        self.status["speed"] += -1 if speed == "FAST" else 1
        self.speed *= 0.5 if speed == "FAST" else 2
        self.borderColorVisible = True
        if self.status["speed"] == 0:
            self.borderColor = "white"

    # SIZECHANGE
    def size_change(self, size):
        if self.bot["status"]:
            self.bot_reset_data("SIZECHANGE")
        self.y -= size / 2
        self.height += size
        # BLINKING
        blinking = asyncio.create_task(self.toggle_visibility())
        # SIZEREVERT
        asyncio.create_task(self.revert_size(size, blinking))
    async def toggle_visibility(self):
        await asyncio.sleep(4)
        while True:
            await asyncio.sleep(0.1)
            self.visible = not self.visible
    async def revert_size(self, size, blinking):
        await asyncio.sleep(5)
        if self.bot["status"]:
            self.bot_reset_data("SIZEREVERT")
        blinking.cancel()
        self.height -= size
        self.y += size / 2
        self.visible = True

    #ICE
    def check_ice(self, ball):
        if ball.ice:
            self.status["ice"] = True
            ball.ice = False
            self.ice_counter = 7 + random.random() * 5
            self.borderColor = "cyan"
            self.pressLeftAnimation["status"] = True
            self.pressLeftAnimation["task"] = asyncio.create_task(self.toggle_press_left_blinking())
    def break_ice(self):
        if self.status["ice"]:
            self.ice_counter -= 1
            if self.shakingAnimationState == 0:
                self.shakingAnimationState = 1
            if self.bot["status"]:
                self.bot["lastBreakIce"] = time.time()
                self.bot["breakIceReactionTime"] = random.random() * 0.05 + 0.15
            if self.ice_counter <= 0:
                self.status["ice"] = False
                self.generate_ice_particles()
                self.pressLeftAnimation["status"] = False
                self.pressLeftAnimation["task"].cancel()
                if self.borderColor == "cyan":
                    self.borderColor = "white"
    def animate_ice_break(self):
        if self.shakingAnimationState != 0:
            if self.shakingAnimationState in [1, 4, 5]:
                self.x -= 1
            elif self.shakingAnimationState in [2, 3]:
                self.x += 1
            elif self.shakingAnimationState == 6:
                self.x += 1
                self.shakingAnimationState = 0
        if self.shakingAnimationState != 0:
            self.shakingAnimationState += 1
    def generate_ice_particles(self):
        for i in range(10):
            new_particle = {
                "x": self.x + random.random() * self.width,
                "y": self.y + random.random() * self.height,
                "width": self.width,
                "height": self.height / 10,
                "speed": random.random() * (G_SIZE / 224),
                "direction": ((i % 10) * math.pi * 2) / 10,
                "opacity": 1,
            }
            self.iceParticles.append(new_particle)
        asyncio.create_task(self.removeparticle())
    async def removeparticle(self):
        i = 0
        while i < 180:
            await asyncio.sleep(1/30)
            for particle in self.iceParticles:
                particle["x"] += particle["speed"] * math.cos(particle["direction"])
                particle["y"] += particle["speed"] * math.sin(particle["direction"])
                if particle["opacity"] > 0.01:
                    particle["opacity"] -= 0.01
                i += 1
        self.iceParticles = []
    async def toggle_press_left_blinking(self):
        while (self.pressLeftAnimation["status"] == True):
            await asyncio.sleep(0.2)
            self.pressLeftAnimation["state"] = 0 if self.pressLeftAnimation["state"] == 1 else 1

    def bot_routine(self, game):
        if self.status["ice"] and time.time() > self.bot["lastBreakIce"] + self.bot["breakIceReactionTime"]:
            self.break_ice()
        ball = self.bot_get_closest_ball(game)
        if ball:
            if time.time() - self.bot["lastMoved"] > self.bot["reactionTime"]:
                if ball.lastTouch == self.team or ball.lastTouch == -1 or self.user_id == "$easyBot":
                    self.bot_move_easy(ball)
                    self.bot["reactionTime"] = random.random() * 0.2 + 0.3
                elif self.user_id == "$normalBot":
                    self.bot_move_medium(ball)
                    self.bot["reactionTime"] = random.random() * 0.2 + 0.2
                elif self.user_id == "$hardBot":
                   self.bot_move_hard(ball, game)
                   self.bot["reactionTime"] = 0
                self.bot["lastMoved"] = time.time()
    def bot_move_easy(self, ball):
        delta_y = ball.y - (self.y + self.height / 2)
        if self.bot["tolerance"] is None:
            self.bot["tolerance"] = random.random() * self.height / 2
        if (ball.lastTouch != self.team):
            nextY = self.bot_get_next_y(ball)
        if delta_y < -self.bot["tolerance"]:
            self.dir = "UP"
        elif delta_y > self.bot["tolerance"]:
            self.dir = "DOWN"
        if (ball.lastTouch != self.team) and (abs(ball.x - self.x) < 1920 / 2) and (self.y < nextY) and (self.y + self.height > nextY):
            self.dir = "IDLE"
    def bot_move_medium(self, ball):
        if (ball.nextY is None):
            ball.nextY = self.bot_get_next_y(ball)
        if self.bot["tolerance"] is None:
            self.bot["tolerance"] = random.random() * self.height / 2
        if ball.nextY + ball.r > self.y + self.bot["tolerance"] and ball.nextY - ball.r < self.y + self.height - self.bot["tolerance"]:
            self.dir = "IDLE"
        elif ball.nextY + ball.r < self.y + self.bot["tolerance"]:
            self.dir = "UP"
        elif ball.nextY - ball.r > self.y + self.bot["tolerance"]:
            self.dir = "DOWN"
    def bot_move_hard(self, ball, game):
        if ball.nextY is None:
            ball.nextY = self.bot_get_next_y(ball)
        if self.bot["bestBounceY"] is None:
            y = self.y
            while y  + self.height <= 1080:
                if y < ball.nextY and y + self.height > ball.nextY:
                    self.bot_check_best_bounce(y, ball, game)
                y += self.speed
            while y > 0:
                if y < ball.nextY and y + self.height > ball.nextY:
                    self.bot_check_best_bounce(y, ball, game)
                y -= self.speed
        else:
                if (self.y - self.speed < self.bot["bestBounceY"] and self.y > self.bot["bestBounceY"]) or self.y + self.speed > self.bot["bestBounceY"] and self.y < self.bot["bestBounceY"]:
                    self.dir = "IDLE"
                elif self.y < self.bot["bestBounceY"]:
                    self.dir = "DOWN"
                elif self.y > self.bot["bestBounceY"]:
                    self.dir = "UP"
                else:
                    self.dir = "IDLE"
    def bot_check_best_bounce(self, newY, ball, game):
        normalized_impact = (ball.nextY - (newY + self.height / 2)) / (self.height / 2)
        dir = normalized_impact * math.pi / 3 if self.team == 0 else math.pi - normalized_impact * math.pi / 3
        x = self.x
        y = newY
        power = {}
        powerScore = 0
        if ball.speed * 1.1 < G_SIZE / 37:
            speed = ball.speed * 1.1
        else:
            speed = ball.speed
        while (self.x > 1920 / 2 and x > 1920 / 42 - 1920 / 50) or (self.x < 1920 / 2 and x < 1920 - 1920 / 42):
            if y + ball.r > 1080 or y - ball.r < 0:
                dir = 2 * math.pi - dir
                y = ball.r if y - ball.r < 0 else 1080 - ball.r
            x = x + speed * math.cos(dir)
            y = y + speed * math.sin(dir)
            if game.mode == "1v1P" or game.mode == "2v2P":
                for p in game.powerups:
                    if (x + ball.r > p['x'] and x - ball.r < p['x'] + G_SIZE / 22.4 and y + ball.r > p['y'] and y - ball.r < p['y'] + G_SIZE / 22.4):
                        powerup_coords = (p['x'], p['y'])
                        if powerup_coords not in power:
                            power[powerup_coords] = True
                            if p["name"] == "MESLOW" or p["name"] == "MESMALL" or p["name"] == "YOUBIG" or p["name"] == "YOUFAST":
                                powerScore -= 500
                            else:
                                powerScore += 500
        if game.mode == "1v1P" or game.mode == "1v1":
            if self.team == 1 and abs(game.player[game.j1_user_id].y + game.player[game.j1_user_id].height / 2 - y) + powerScore > self.bot["bestBounceScore"]:
                self.bot["bestBounceScore"] = abs(game.player[game.j1_user_id].y + game.player[game.j1_user_id].height / 2 - y) + powerScore
                self.bot["bestBounceY"] = newY
            elif self.team == 0 and abs(game.player[game.j2_user_id].y + game.player[game.j2_user_id].height / 2 - y) + powerScore > self.bot["bestBounceScore"]:
                self.bot["bestBounceScore"] = abs(game.player[game.j2_user_id].y + game.player[game.j2_user_id].height / 2 - y) + powerScore
                self.bot["bestBounceY"] = newY
        elif game.mode == "2v2P" or game.mode == "2v2":
            if self.team == 1:
                middle = (game.player[game.j1_user_id].y + game.player[game.j2_user_id].y + game.player[game.j1_user_id].height) / 2
                if abs(middle - y) + powerScore > self.bot["bestBounceScore"]:
                    self.bot["bestBounceScore"] = abs(middle - y) + powerScore
                    self.bot["bestBounceY"] = newY
            elif self.team == 0:
                middle = (game.player[game.j3_user_id].y + game.player[game.j4_user_id].y + game.player[game.j3_user_id].height) / 2
                if abs(middle - y) + powerScore > self.bot["bestBounceScore"]:
                    self.bot["bestBounceScore"] = abs(middle - y) + powerScore
                    self.bot["bestBounceY"] = newY
    def bot_get_closest_ball(self, game):
        distance = float("inf")
        closest_ball = None
        for ball in game.ball:
            priority = 500 if ball.lastTouch != self.team else -500
            if abs(self.x - ball.x) - priority < distance:
                distance = abs(self.x - ball.x) - priority
                closest_ball = ball
        return closest_ball
    def bot_get_next_y(self, ball):
        x, y, r, direction, speed = ball.x, ball.y, ball.r, ball.direction, ball.speed
        while abs(self.x - x + r) > speed:
            x += speed * math.cos(direction)
            y += speed * math.sin(direction)
            if y - r < 0 or y + r > 1080:
                direction = 2 * math.pi - direction
                y = r if y - r < 0 else 1080 - r
            if (x < 0 or x > 1920):
                return y
        return y
    def bot_reset_data(self, msg):
        self.bot["bestBounceY"] = None
        self.bot["bestBounceScore"] = 0
        self.bot["tolerance"] = None
        self.lastY = self.y

#POWERUPS
async def spawn_powerup(game):
    if game.mode == '1v1P' or game.mode == '2v2P':
        while 1 :
            await asyncio.sleep(10)
            pu = {
                "name": get_random_powerup(),
                "x": random.uniform(1920/10, 1920 - 1920/10),
                "y": random.uniform(1080/10, 1080 - 1080/10)
            }
            game.powerups.append(pu)
            asyncio.create_task(auto_delete(game, pu))

async def auto_delete(game, pu):
                await asyncio.sleep(20)
                if pu in game.powerups:
                    game.powerups.remove(pu)

def get_random_powerup():
    powerups = ["ICE", "MEBIG", "MESMALL", "YOUBIG", "YOUSMALL", "NEWBALL",
                "MEFAST", "MESLOW", "YOUFAST", "YOUSLOW"]
    return random.choice(powerups)

def pickup_powerup(game, p, ball):    
    if ball.lastTouch == 0:
        game.total_powerups_activated += 1
        
        game.powerups_activated_left += 1
        if p["name"] in ["MEBIG", "YOUSMALL", "MEFAST", "YOUSLOW"]:
            game.bonus_activated_left += 1
        elif p["name"] in ["YOUBIG", "MESMALL", "YOUFAST", "MESLOW"]:
            game.malus_activated_left += 1
    elif ball.lastTouch == 1:
        game.total_powerups_activated += 1
        
        game.powerups_activated_right += 1
        if p["name"] in ["MEBIG", "YOUSMALL", "MEFAST", "YOUSLOW"]:
            game.bonus_activated_right += 1
        elif p["name"] in ["YOUBIG", "MESMALL", "YOUFAST", "MESLOW"]:
            game.malus_activated_right += 1
    
    if p["name"] == "ICE":
        if ball.lastTouch == -1:
            game.total_powerups_activated += 1
        game.total_freeze_powerups_activated += 1
        
        ball.ice = True
        game.powerups.remove(p)
    elif p["name"] == "NEWBALL":
        if ball.lastTouch == -1:
            game.total_powerups_activated += 1
        game.total_multi_ball_powerups_activated += 1
        
        new_ball = Ball(ball.x, ball.y, ball.r, ball.direction + (random.random() * math.pi / 6 - math.pi / 12))
        new_ball.lastTouch = ball.lastTouch
        new_ball.speed = ball.speed + random.uniform(-2, 2)
        game.ball.append(new_ball)
        game.powerups.remove(p)
    elif ball.lastTouch != -1:
        if p["name"] in ["MEBIG", "YOUBIG"]:
            game.total_racket_increase_powerups_activated += 1
        elif p["name"] in ["MESMALL", "YOUSMALL"]:
            game.total_racket_reduction_powerups_activated += 1
        elif p["name"] in ["MEFAST", "YOUFAST"]:
            game.total_speed_powerups_activated += 1
        elif p["name"] in ["MESLOW", "YOUSLOW"]:
            game.total_slow_powerups_activated += 1

        for player_key in game.player:
            if p["name"] in ["MEBIG", "MESMALL"]:
                if game.player[player_key].team == ball.lastTouch:
                    game.player[player_key].size_change(G_SIZE / 22.4 if p["name"] == "MEBIG" else -(G_SIZE / 22.4))
            elif p["name"] in ["YOUBIG", "YOUSMALL"]:
                if game.player[player_key].team != ball.lastTouch:
                    game.player[player_key].size_change(G_SIZE / 22.4 if p["name"] == "YOUBIG" else -(G_SIZE / 22.4))
            elif p["name"] in ["MEFAST", "MESLOW"]:
                if game.player[player_key].team == ball.lastTouch:
                    game.player[player_key].speed_change("FAST" if p["name"] == "MEFAST" else "SLOW")
            elif p["name"] in ["YOUFAST", "YOUSLOW"]:
                if game.player[player_key].team != ball.lastTouch:
                    game.player[player_key].speed_change("FAST" if p["name"] == "YOUFAST" else "SLOW")
        game.powerups.remove(p)
