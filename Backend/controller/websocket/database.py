from django.utils import timezone

from channels.db import database_sync_to_async

from controller.models import User, Contact, ContactMessage, GroupChat, GroupMessage, PongGame, Tournament
from django.db.models import Count

from django.db import transaction

import random
import asyncio

import uuid

import math

@database_sync_to_async
def get_user_by_id(user_id):
    try:
        return User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return None

@database_sync_to_async
def set_user_socket_id(user):
    user.socket_id = str(uuid.uuid4())
    user.save()
    return(user.socket_id)

@database_sync_to_async
def remove_user_socket_id(user):
    user.socket_id = ""
    user.save()

async def get_or_create_contact(recipient_user, sender_user):
    try:
        Contact = await get_contact(recipient_user, sender_user)
        if Contact:
            return Contact
        else:
            return await create_contact(recipient_user, sender_user)
    except Contact.DoesNotExist:
        return await create_contact(recipient_user, sender_user)

@database_sync_to_async
def get_contact(recipient_user, sender_user):
    return Contact.objects.filter(users=recipient_user).filter(users=sender_user).first()

@database_sync_to_async
def create_contact(recipient_user, sender_user):
    contact = Contact.objects.create()
    contact.users.set([recipient_user, sender_user])
    contact.save()
    return contact

@database_sync_to_async
def create_contact_message(message, sender_user, contact):
    contact_message = ContactMessage.objects.create(
            message=message,
            sender=sender_user,
            contact=contact,
        )
    contact_message.users_read.set([sender_user])
    contact_message.save()
    return contact_message

@database_sync_to_async
def create_group_message(message, sender_user, group):
    group_message = GroupMessage.objects.create(
            message=message,
            sender=sender_user,
            chat=group,
        )
    # group_message.users_read.set([sender_user])
    group_message.save()
    return group_message

@database_sync_to_async
def get_group_by_id(group_id):
    try:
        return GroupChat.objects.get(pk=group_id)
    except GroupChat.DoesNotExist:
        return None

@database_sync_to_async
def contact_friend(contact, user):
    contact.friend.add(user)
    contact.save()

@database_sync_to_async
def contact_unfriend(contact):
    contact.friend.clear()
    contact.save()

@database_sync_to_async
def contact_blocked(contact, user):
    contact.blocked.add(user)
    contact.save()

@database_sync_to_async
def contact_unblocked(contact, user):
    contact.blocked.remove(user)
    contact.save()

@database_sync_to_async
def set_in_game(user, status):
    user.in_game = status
    user.save()

@database_sync_to_async
def database_count(object):
    return object.count()

@database_sync_to_async
def update_contact_last_interract(contact):
    contact.last_interract = timezone.now()
    contact.save()

@database_sync_to_async
def user_in_contact_friend(contact, user_id):
    return contact.friend.filter(user_id=user_id).exists()

@database_sync_to_async
def user_in_contact_blocked(contact, user_id):
    return contact.blocked.filter(user_id=user_id).exists()

@database_sync_to_async
def create_table(user, opponent, game_mode):
    game_table = PongGame.objects.create()
    game_table.players.set([user, opponent])
    game_table.players_in_game.set([user])
    game_table.status = "in_queue"
    game_table.mode = game_mode
    game_table.j1 = user.user_id
    game_table.j2 = opponent.user_id
    game_table.isBattle = True
    game_table.save()
    return game_table

@database_sync_to_async
def join_table(game_table, user):
    game_table.players_in_game.add(user)
    game_table.save()


@database_sync_to_async
def get_queue_table(user, opponent):
    return PongGame.objects.filter(players=user).filter(players=opponent).exclude(status="ended").filter(isBattle=True).first()

@database_sync_to_async
def get_game_table(user):
    return PongGame.objects.filter(players=user).exclude(status="ended").first()

@database_sync_to_async
def  get_game_table_started(user):
    return PongGame.objects.filter(players=user).filter(status="in_game").first()

@database_sync_to_async
def get_in_game_table_or_in_queue(user):
    return PongGame.objects.filter(players=user).exclude(status="ended").first()

@database_sync_to_async
def get_game_table_Q(user):
    return PongGame.objects.filter(players=user).exclude(status="ended").filter(isBattle=False).first()

@database_sync_to_async
def get_tournament_Q(user):
    return Tournament.objects.filter(players=user).exclude(status='ended').first()

@database_sync_to_async
def get_tournament(user):
    return Tournament.objects.filter(players=user).exclude(status='ended').first()

@database_sync_to_async
def is_in_table(user):
    return PongGame.objects.filter(players_in_game=user).exclude(status="ended").filter(isBattle=True).first()

@database_sync_to_async
def is_in_this_table(user, opponent):
    return PongGame.objects.filter(players_in_game=user).filter(players=opponent).exclude(status="ended").filter(isBattle=True).first()

@database_sync_to_async
def quit_table(game_table, user):
    game_table.players_in_game.remove(user)
    game_table.save()
    if game_table.players.count() == 0:
        game_table.delete()

@database_sync_to_async
def destroy_table(game_table):
    game_table.delete()

@database_sync_to_async 
def end_game(table, winner, winner2, loser, loser2, winner_score, loser_score, 
winner_powerups_activated, loser_powerups_activated,
winner_bonus_activated, loser_bonus_activated,
winner_malus_activated, loser_malus_activated,
winner_highest_points_streak, loser_highest_points_streak,
winner_point_time, loser_point_time, point_time_time):

    mmr_winners = 0
    mmr_losers = 0

    try:
        winner_user = User.objects.get(user_id=winner)
        table.winner.add(winner_user)
        mmr_winners += winner_user.user_mmr1
    except User.DoesNotExist:
        pass
    try:
        if winner2:
            winner2_user = User.objects.get(user_id=winner2)
            table.winner.add(winner2_user)
            mmr_winners += winner2_user.user_mmr1
            mmr_winners /= 2
    except User.DoesNotExist:
        pass
    try:
        loser_user = User.objects.get(user_id=loser)
        table.loser.add(loser_user)
        mmr_losers += loser_user.user_mmr1
    except User.DoesNotExist:
        pass
    try:
        if loser2:
            loser2_user = User.objects.get(user_id=loser2)
            table.loser.add(loser2_user)
            mmr_losers += loser2_user.user_mmr1
            mmr_losers /= 2
    except User.DoesNotExist:
        pass

    if table.isCustom == False:
        try:
            winner_user = User.objects.get(user_id=winner)
            
            div = math.floor((winner_user.user_level + 100) / 100)
            if div < 1:
                div = 1
            winner_user.user_level += math.floor(100 / div)

            winner_user.user_game_played += 1
            winner_user.user_victories += 1
            mmr_diff = mmr_losers - winner_user.user_mmr1
            if mmr_diff < -190:
                mmr_diff = -190
            winner_user.user_mmr1 += mmr_diff / 20 + 20
            winner_user.save()
        except User.DoesNotExist:
            pass
        try:
            if winner2:
                winner2_user = User.objects.get(user_id=winner2)
                
                div = math.floor((winner2_user.user_level + 100) / 100)
                if div < 1:
                    div = 1
                winner2_user.user_level += math.floor(100 / div)
                
                winner2_user.user_game_played += 1
                winner2_user.user_victories += 1
                mmr_diff = mmr_losers - winner2_user.user_mmr1
                if mmr_diff < -190:
                    mmr_diff = -190
                winner2_user.user_mmr1 += mmr_diff / 20 + 20
                
                winner2_user.save()

        except User.DoesNotExist:
            pass
        try:
            loser_user = User.objects.get(user_id=loser)

            div = math.floor((loser_user.user_level + 100) / 100)
            if div < 1:
                div = 1
            loser_user.user_level += math.floor(25 / div)
            
            loser_user.user_game_played += 1
            mmr_diff = loser_user.user_mmr1 - mmr_winners
            if mmr_diff < -190:
                mmr_diff = -190
            loser_user.user_mmr1 -= mmr_diff / 20 + 20
            
            loser_user.save()

        except User.DoesNotExist:
            pass
        try:
            if loser2:
                loser2_user = User.objects.get(user_id=loser2)

                div = math.floor((loser2_user.user_level + 100) / 100)
                if div < 1:
                    div = 1
                loser2_user.user_level += math.floor(25 / div)

                loser2_user.user_game_played += 1
                mmr_diff = loser2_user.user_mmr1 - mmr_winners
                if mmr_diff < -190:
                    mmr_diff = -190
                loser2_user.user_mmr1 -= mmr_diff / 20 + 20
                
                loser2_user.save()

        except User.DoesNotExist:
            pass 
    
    table.winner_score = winner_score
    table.loser_score = loser_score
    table.winner_powerups_activated = winner_powerups_activated
    table.loser_powerups_activated = loser_powerups_activated
    table.winner_bonus_activated = winner_bonus_activated
    table.loser_bonus_activated = loser_bonus_activated
    table.winner_malus_activated = winner_malus_activated
    table.loser_malus_activated = loser_malus_activated
    table.winner_highest_points_streak = winner_highest_points_streak
    table.loser_highest_points_streak = loser_highest_points_streak
    table.point_time_time = point_time_time
    table.point_time_left = loser_point_time
    table.point_time_right = winner_point_time
    table.status = "ended"
    table.save()

@database_sync_to_async
def update_game_history(game):
    game.table.created_at = game.begin_date
    game.table.game_duration = game.game_duration
    game.table.total_balls_hits = game.total_balls_hits
    game.table.highest_balls_hits_streak = game.highest_balls_hits_streak
    game.table.highest_balls_speed = game.highest_balls_speed
    game.table.total_powerups_activated = game.total_powerups_activated
    game.table.total_freeze_powerups_activated = game.total_freeze_powerups_activated
    game.table.total_slow_powerups_activated = game.total_slow_powerups_activated
    game.table.total_speed_powerups_activated = game.total_speed_powerups_activated
    game.table.total_multi_ball_powerups_activated = game.total_multi_ball_powerups_activated
    game.table.total_racket_reduction_powerups_activated = game.total_racket_reduction_powerups_activated
    game.table.total_racket_increase_powerups_activated = game.total_racket_increase_powerups_activated
    game.table.save()
    
@database_sync_to_async 
def update_table_status(table, status):
    table.status = status
    table.save()

@database_sync_to_async
def get_players_table(table):
    try:
        return [player for player in table.players.all()]
    except Exception as e:
        print(e)
        return []

@database_sync_to_async
def changeTableMode(game_table, mode):
    if mode == '1v1' or mode == '2v2' or mode == '1v1P' or mode == '2v2P':
        game_table.mode = mode
    else:
        game_table.mode = '1v1'
    game_table.save()
    if game_table.players.count() == 0:
        game_table.delete()

@database_sync_to_async
def addtableBot(game_table, pos, bot):
    if pos == 2:
        game_table.j2 = bot
    elif pos == 3:
        game_table.j3 = bot
    elif pos == 4:
        game_table.j4 = bot
    game_table.save()
    if game_table.players.count() == 0:
        game_table.delete()

@database_sync_to_async
def addtablePlayer(game_table, pos, playerId):
    if pos == 2:
        game_table.j2 = playerId
    elif pos == 3:
        game_table.j3 = playerId
    elif pos == 4:
        game_table.j4 = playerId
    userToAdd = User.objects.get(user_id=playerId)
    game_table.players.add(userToAdd)
    game_table.save()
    if game_table.players.count() == 0:
        game_table.delete()

@database_sync_to_async
def checkPosFree(game_table, pos, userToJoin):
    if game_table.j1 == userToJoin:
        return False
    elif game_table.j2 == userToJoin:
        return False
    elif game_table.j3 == userToJoin:
        return False
    elif game_table.j4 == userToJoin:
        return False
    if pos == 2 and game_table.j2 == 'none':
        return True
    elif pos == 3 and game_table.j3 == 'none':
        return True
    elif pos == 4 and game_table.j4 == 'none':
        return True
    return False

@database_sync_to_async
def kickFromGroup(game_table, pos):
    entityToKick = 'none'
    if pos == 2:
        entityToKick = game_table.j2
        game_table.j2 = 'none'
    elif pos == 3:
        entityToKick = game_table.j3
        game_table.j3 = 'none'
    elif pos == 4:
        entityToKick = game_table.j4
        game_table.j4 = 'none'
    userToKick = None
    if entityToKick != '$easyBot' and entityToKick != '$normalBot' and entityToKick != '$hardBot' and entityToKick != 'none':
        userToKick = User.objects.get(user_id=entityToKick)
        game_table.players.remove(userToKick)
    game_table.save()
    if game_table.players.count() == 0:
        game_table.delete()
    return userToKick

@database_sync_to_async
def get_Cgroup_size(game):
    size = 1
    if (game.j2 != 'none'):
        size += 1
    if (game.j3 != 'none'):
        size += 1
    if (game.j4 != 'none'):
        size += 1
    return size

@database_sync_to_async
def memberLeaveGroup(game_table, userId, User):
    pos = 0
    if userId == game_table.j2:
        game_table.j2 = 'none'
        pos = 2
    elif userId == game_table.j3:
        game_table.j3 = 'none'
        pos = 3
    elif userId == game_table.j4:
        game_table.j4 = 'none'
        pos = 4
    game_table.players.remove(User)
    game_table.save()
    return pos

@database_sync_to_async
def get_users_table(table):
    return [users for users in table.users.all()]

@database_sync_to_async
def edit_group_name(group_id, newName):
    try:
        group = GroupChat.objects.get(groupId=group_id)
        last_name = group.name
        group.name = newName
        group.save()
        return last_name
    except GroupChat.DoesNotExist:
        return None

@database_sync_to_async
def edit_group_picture(group_id, picture_file, random_num):
    try:
        group = GroupChat.objects.get(groupId=group_id)
        group.groupImg.delete(save=False)
        group.groupImg.save(str(group.groupId)+str(random_num)+'.jpg', picture_file, save=True)
        group.save()
        return {'name': str(group.groupId), 'picture': str(group.groupImg)}
    except GroupChat.DoesNotExist:
        return None

@database_sync_to_async
def leave_group(group_id, user_leave_id):
    try:
        group = GroupChat.objects.get(groupId=group_id)
        users = group.users.filter(user_id=user_leave_id)
        admins = group.admins.filter(user_id=user_leave_id)
        isAdmin = False
        if group.users.count() == 1:
            group.delete()
            return False
        if users.exists():
            user_leave = users.first()
            isAdmin = True
            group.admins.remove(user_leave)
        if users.exists():
            user_leave = users.first()
            group.users.remove(user_leave)
        if isAdmin == True:
            userAdmin = group.users.filter().first()
            group.admins.add(userAdmin)
        group.save()
        return True
    except GroupChat.DoesNotExist:
        return None

@database_sync_to_async
def added_to_group(group_id, user_added):
    try:
        group = GroupChat.objects.get(groupId=group_id)
        group.users.add(user_added)
        group.save()
        return True
    except GroupChat.DoesNotExist:
        return None

@database_sync_to_async
def find_tournament(user, mode):
    try:
        actualTournament = Tournament.objects.filter(players=user).exclude(status='ended').first()
        if actualTournament == None:
            return None
        players = actualTournament.players.all()
        if (len(players) == 0):
            actualTournament.delete()
            return None
        return actualTournament
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def leave_tournament(user):
    try:
        tournaments = Tournament.objects.filter(players=user).exclude(status='ended').all()
        leaved_tournament = []
        for tournament in tournaments:
            if tournament.owner == user.user_id:
                tournament.delete()
            else:
                if tournament.j1 == user.user_id:
                    #change user_id
                    tournament.j1 = tournament.j2
                    tournament.j2 = tournament.j3
                    tournament.j3 = tournament.j4
                    tournament.j4 = 'none'
                    #change pseudo associate
                    tournament.j1Pseudo = tournament.j2Pseudo
                    tournament.j2Pseudo = tournament.j3Pseudo
                    tournament.j3Pseudo = tournament.j4Pseudo
                    tournament.j4Pseudo = 'none'
                elif tournament.j2 == user.user_id:
                    #change user_id
                    tournament.j2 = tournament.j3
                    tournament.j3 = tournament.j4
                    tournament.j4 = 'none'
                    #change pseudo associate
                    tournament.j2Pseudo = tournament.j3Pseudo
                    tournament.j3Pseudo = tournament.j4Pseudo
                    tournament.j4Pseudo = 'none'
                elif tournament.j3 == user.user_id:
                    #change user_id
                    tournament.j3 = tournament.j4
                    tournament.j4 = 'none'
                    #change pseudo associate
                    tournament.j3Pseudo = tournament.j4Pseudo
                    tournament.j4Pseudo = 'none'
                elif tournament.j4 == user.user_id:
                    tournament.j4 = 'none'
                    tournament.j4Pseudo = 'none'
                tournament.status = 'none'
                tournament.j1Status = 'none'
                tournament.j2Status = 'none'
                tournament.j3Status = 'none'
                tournament.j4Status = 'none'
                tournament.players.remove(user)
                tournament.save()
                leaved_tournament.append(tournament)
        return leaved_tournament
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def isReadyTP(user):
    try:
        tournament = Tournament.objects.filter(players=user).filter(status='ready').first()
        if tournament == None :
            tournament = Tournament.objects.filter(players=user).filter(status='prepare2').first()
        if tournament:
            if tournament.status != 'ready' and tournament.status != 'prepare2':
                return tournament
            if tournament.j1 == user.user_id:
                tournament.j1Status = 'ready'
            elif tournament.j2 == user.user_id:
                tournament.j2Status = 'ready'
            elif tournament.j3 == user.user_id:
                tournament.j3Status = 'ready'
            elif tournament.j4 == user.user_id:
                tournament.j4Status = 'ready'
            tournament.save()
            if (tournament.players.count() == 0):
                tournament.delete()
                return None
            else:
                return tournament
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def checkTournamnetCanStart(user):
    try:
        tournament = tournament = Tournament.objects.filter(players=user).exclude(status='ended').exclude(status='none').first()
        if tournament:
            if tournament.status != 'ready':
                return None
            if tournament.j1Status == 'ready' and tournament.j2Status == 'ready' and tournament.j3Status == 'ready' and tournament.j4Status == 'ready':
                tournament.status = 'prepare'
                tournament.save()
                players = tournament.players.all()
                for player in players:
                    player_tournament = Tournament.objects.filter(owner=player.user_id).exclude(status='ended').first()
                    if (player_tournament and (player_tournament.owner != tournament.owner)):
                        player_tournament.delete()
                return tournament
            else:
                return None
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def checkTournamnetCanStart2(user):
    try:
        tournament = Tournament.objects.filter(players=user).exclude(status='ended').first()
        if tournament:
            if tournament.status != 'prepare2':
                return None
            if tournament.j1Status == 'ready' and tournament.j2Status == 'ready' and tournament.j3Status == 'ready' and tournament.j4Status == 'ready':
                return tournament
            else:
                return None
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def verifAndStart(user):
    try:
        tournament = Tournament.objects.filter(players=user).exclude(status='ended').first()
        if tournament:
            if tournament.status != 'prepare2':
                return None
            tournament.j1Status = 'ready'
            tournament.j2Status = 'ready'
            tournament.j3Status = 'ready'
            tournament.j4Status = 'ready'
            tournament.save()
            return tournament
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def launchTournamentRound2(user):
    try:
        tournament = Tournament.objects.filter(players=user).exclude(status='ended').first()
        if tournament:
            if tournament.status != 'prepare2':
                return None
            tournament.match3 = PongGame.objects.create()
            tournament.match4 = PongGame.objects.create()

            p1 = tournament.match1.loser.first()
            p2 = tournament.match2.loser.first()
            p3 = tournament.match1.winner.first()
            p4 = tournament.match2.winner.first()
            tournament.match3.players.set([p3, p4])
            tournament.match3.players_in_game.set([p3, p4])
            tournament.match3.status = "in_game"
            tournament.match3.mode = tournament.mode
            tournament.match3.j1 = p3.user_id
            tournament.match3.j2 = p4.user_id
            tournament.match3.save()
            tournament.match4.players.set([p1, p2])
            tournament.match4.players_in_game.set([p1, p2])
            tournament.match4.status = "in_game"
            tournament.match4.mode = tournament.mode
            tournament.match4.j1 = p1.user_id
            tournament.match4.j2 = p2.user_id
            tournament.match4.save()
            
            tournament.status = 'round2RTS'
            tournament.save()
            return tournament
        else:
            return None
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def launchTournamentRound1(user):
    try:
        tournament = Tournament.objects.filter(players=user).exclude(status='ended').exclude(status='none').first()
        if tournament:
            if tournament.status != 'prepare':
                return None
            tournament.match1 = PongGame.objects.create()
            tournament.match2 = PongGame.objects.create()
            p1 = User.objects.filter(user_id=tournament.j1).first()
            p2 = User.objects.filter(user_id=tournament.j2).first()
            p3 = User.objects.filter(user_id=tournament.j3).first()
            p4 = User.objects.filter(user_id=tournament.j4).first()

            nbRand = random.randint(1, 10) % 3
            
            if (nbRand == 0):
                tournament.match1.players.set([p1, p2])
                tournament.match1.players_in_game.set([p1, p2])
                tournament.match1.status = "in_game"
                tournament.match1.mode = tournament.mode
                tournament.match1.j1 = p1.user_id
                tournament.match1.j2 = p2.user_id
                tournament.match1.save()
                tournament.match2.players.set([p3, p4])
                tournament.match2.players_in_game.set([p3, p4])
                tournament.match2.status = "in_game"
                tournament.match2.mode = tournament.mode
                tournament.match2.j1 = p3.user_id
                tournament.match2.j2 = p4.user_id
                tournament.match2.save()
            elif (nbRand == 1):
                tournament.match1.players.set([p1, p3])
                tournament.match1.players_in_game.set([p1, p3])
                tournament.match1.status = "in_game"
                tournament.match1.mode = tournament.mode
                tournament.match1.j1 = p1.user_id
                tournament.match1.j2 = p3.user_id
                tournament.match1.save()
                tournament.match2.players.set([p2, p4])
                tournament.match2.players_in_game.set([p2, p4])
                tournament.match2.status = "in_game"
                tournament.match2.mode = tournament.mode
                tournament.match2.j1 = p2.user_id
                tournament.match2.j2 = p4.user_id
                tournament.match2.save()
            else:
                tournament.match1.players.set([p1, p4])
                tournament.match1.players_in_game.set([p1, p4])
                tournament.match1.status = "in_game"
                tournament.match1.mode = tournament.mode
                tournament.match1.j1 = p1.user_id
                tournament.match1.j2 = p4.user_id
                tournament.match1.save()
                tournament.match2.players.set([p2, p3])
                tournament.match2.players_in_game.set([p2, p3])
                tournament.match2.status = "in_game"
                tournament.match2.mode = tournament.mode
                tournament.match2.j1 = p2.user_id
                tournament.match2.j2 = p3.user_id
                tournament.match2.save()
            tournament.status = 'round1RTS'
            tournament.save()
            return tournament
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def startTournamentRound1(user):
    try:
        tournament = Tournament.objects.filter(players=user).exclude(status='ended').first()
        if tournament:
            if tournament.status != 'round1RTS':
                return None
            tournament.status = 'round1'
            tournament.j1Status = 'none'
            tournament.j2Status = 'none'
            tournament.j3Status = 'none'
            tournament.j4Status = 'none'
            tournament.save()
            return tournament
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def startTournamentRound2(user):
    try:
        tournament = Tournament.objects.filter(players=user).exclude(status='ended').first()
        if tournament:
            if tournament.status != 'round2RTS':
                return None
            tournament.status = 'round2'
            tournament.j1Status = 'none'
            tournament.j2Status = 'none'
            tournament.j3Status = 'none'
            tournament.j4Status = 'none'
            tournament.save()
            return tournament
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def endTournamentRound(userId):
    try:
        tournament = Tournament.objects.filter(players__user_id=userId).exclude(status='ended').first()
        if tournament:
            if (tournament.status == 'round1'):
                tournament.status = 'round1Over'
            elif (tournament.status == 'round1Over'):
                tournament.status = 'round1O2'
            elif (tournament.match1 and tournament.match2):
                if (tournament.match1.status == 'ended' and tournament.match2.status == 'ended'):
                    if (tournament.status == 'round1O2'):
                        tournament.status = 'prepare2_'
                    elif (tournament.status == 'prepare2_'):
                        tournament.status = 'prepare2'
            if (tournament.status == 'round2'):
                tournament.status = 'round2O1'
            elif (tournament.status == 'round2O1'):
                tournament.status = 'round2O2'
            elif (tournament.match3 and tournament.match3):
                if (tournament.match3.status == 'ended' and tournament.match4.status == 'ended'):
                    if (tournament.status == 'round2O2'):
                        tournament.status = 'round2O3'
                    elif (tournament.status == 'round2O3'):
                        tournament.status = 'round2Over'
            tournament.save()
            return tournament
        else:
            return None
    except Exception as e:
        print(e)
        return None

async def endTournament(userId):
    await asyncio.sleep(5)
    await endTournamentFn(userId)

@database_sync_to_async
def endTournamentFn(userId):
    try:
        tournament = Tournament.objects.filter(players__user_id=userId).filter(status='round2Over').first()
        if tournament:
            tournament.status = 'ended'
            tournament.save()
            return tournament
        else:
            return None
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def getMatch(nb, user):
    try:
        tournament = Tournament.objects.filter(players=user).exclude(status='ended').first()
        if tournament:
            if (nb == 1):
                return tournament.match1
            elif (nb == 2):
                return tournament.match2
            elif (nb == 3):
                return tournament.match3
            elif (nb == 4):
                return tournament.match4
            return None
        else:
            return None
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def find_match(user):
    try:
        match = PongGame.objects.filter(players=user).exclude(status='ended').exclude(isBattle=True).first()
        if match == None:
            return None
        players = match.players.all()
        if (len(players) == 0):
            match.delete()
            return None
        return match
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def find_my_match(user):
    try:
        return PongGame.objects.filter(owner=user.user_id).exclude(status='ended').exclude(isBattle=True).first()
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def find_my_tournament(user):
    try:
        return Tournament.objects.filter(owner=user.user_id).exclude(status='ended').first()
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def create_gestion_match(user, mode):
    try:
        match = PongGame.objects.create()
        match.players.set([user])
        match.players_in_game.set([])
        match.status = "in_queue"
        match.mode = mode
        match.owner = user.user_id
        match.isBattle = False
        match.save()
        return match
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def create_gestion_tournament(user, mode):
    try:
        tournament = Tournament.objects.create()
        tournament.players.set([user])
        tournament.status = "none"
        tournament.mode = mode
        tournament.j1 = user.user_id
        tournament.j1Pseudo = user.pseudo
        tournament.owner = user.user_id
        tournament.save()
        return tournament
    except Exception as e:
        print(e)
        return None


@database_sync_to_async
def cancel_match(my_match):
    my_match.status = 'in_queue'
    my_match.j1 = 'none'
    my_match.j2 = 'none'
    my_match.j3 = 'none'
    my_match.j4 = 'none'
    my_match.locked = False
    my_match.save()
    return None

@database_sync_to_async
def locked_my_match(my_match, main_user):
    my_match.locked = True
    my_match.j1 = 'none'
    my_match.j2 = 'none'
    my_match.j3 = 'none'
    my_match.j4 = 'none'
    my_match.status = 'in_queue'
    my_match.players.set([main_user])
    my_match.save()

    matchs = PongGame.objects.filter()
    return None

@database_sync_to_async
def unlocked_my_match(my_match, main_user):
    my_match.locked = False
    my_match.j1 = 'none'
    my_match.j2 = 'none'
    my_match.j3 = 'none'
    my_match.j4 = 'none'
    my_match.status = 'in_queue'
    my_match.save()
    return None

@database_sync_to_async
def unlocked_my_tournament(my_tournament, main_user):
    if (my_tournament.locked == False):
        return None
    my_tournament.locked = False
    my_tournament.status = 'none'
    my_tournament.save()
    return None

@database_sync_to_async
def stop_matchmaking(player, s_match):
    my_match = PongGame.objects.filter(owner=player.user_id).exclude(status='ended').filter(isBattle=False).first()
    if (my_match and (my_match.owner != s_match.owner)):
        my_match.delete() 
    matchs = PongGame.objects.filter(players=player).exclude(status='ended').exclude(isBattle=True).filter(isCustom=False).all()
    for match in matchs:
        if match.owner != s_match.owner:
            match.players.remove(player)
            match.save()
    return None  

@database_sync_to_async
def stop_matchmaking_T(player, s_tournament):
    my_tournament = Tournament.objects.filter(owner=player.user_id).exclude(status='ended').first()
    if (my_tournament and (my_tournament.owner != s_tournament.owner)):
        my_tournament.delete() 
    tournaments = Tournament.objects.filter(players=player).exclude(status='prepare').exclude(owner=s_tournament.owner).exclude(status='ended').all()
    for tournament in tournaments:
        if tournament.owner != s_tournament.owner:
            if tournament.j1 == player.user_id:
                #change user_id
                tournament.j1 = tournament.j2
                tournament.j2 = tournament.j3
                tournament.j3 = tournament.j4
                tournament.j4 = 'none'
                #change pseudo associate
                tournament.j1Pseudo = tournament.j2Pseudo
                tournament.j2Pseudo = tournament.j3Pseudo
                tournament.j3Pseudo = tournament.j4Pseudo
                tournament.j4Pseudo = 'none'
            elif tournament.j2 == player.user_id:
                #change user_id
                tournament.j2 = tournament.j3
                tournament.j3 = tournament.j4
                tournament.j4 = 'none'
                #change pseudo associate
                tournament.j2Pseudo = tournament.j3Pseudo
                tournament.j3Pseudo = tournament.j4Pseudo
                tournament.j4Pseudo = 'none'
            elif tournament.j3 == player.user_id:
                #change user_id
                tournament.j3 = tournament.j4
                tournament.j4 = 'none'
                #change pseudo associate
                tournament.j3Pseudo = tournament.j4Pseudo
                tournament.j4Pseudo = 'none'
            elif tournament.j4 == player.user_id:
                #change user_id
                tournament.j4 = 'none'
                #change pseudo associate
                tournament.j4Pseudo = 'none'
            tournament.status = 'none'
            tournament.j1Status = 'none'
            tournament.j2Status = 'none'
            tournament.j3Status = 'none'
            tournament.j4Status = 'none'
            tournament.players.remove(player)
            tournament.save()
    return None  

@database_sync_to_async
def find_starting_match(main_user):
    match = PongGame.objects.filter(status='game_starting').filter(players=main_user).filter(isCustom=False).filter(isBattle=False).first()
    if match == None:
        match = PongGame.objects.filter(status='ready').filter(players=main_user).filter(isCustom=False).filter(isBattle=False).first()
    return match

@database_sync_to_async
def find_starting_tournament(main_user):
    tournament = Tournament.objects.exclude(status='ended').exclude(status='none').filter(players=main_user).first()
    return tournament

@database_sync_to_async
def find_opponent(user, mode, loop):
    mmr_limit = (50 * math.ceil(loop / 5))
    try:
        matchs = PongGame.objects.exclude(players=user).filter(status='in_queue').filter(mode=mode).exclude(isBattle=True).all()
        best_match = None
        for match in matchs:
            if match.locked == True:
                continue
            opponent = User.objects.filter(user_id=match.owner).first()
            if abs(opponent.user_mmr1 - user.user_mmr1) <= mmr_limit:
                if (best_match != None):
                    bm_players = best_match.players.all()
                    if (abs(opponent.user_mmr1 - user.user_mmr1) < abs(bm_players[0].user_mmr1 - user.user_mmr1)):
                        best_match = match
                else:
                    best_match = match
        return best_match
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def find_opponent_tournament(user, mode, loop):
    mmr_limit = (50 * math.ceil(loop / 5))
    try:
        tournaments = Tournament.objects.exclude(players=user).filter(status='none').filter(mode=mode).all()
        best_tournament = None
        for tournament in tournaments:
            if tournament.locked == True:
                continue
            opponent = User.objects.filter(user_id=tournament.owner).first()
            if abs(opponent.user_mmr1 - user.user_mmr1) <= mmr_limit:
                if (best_tournament != None):
                    bm_players = best_tournament.players.all()
                    if (abs(opponent.user_mmr1 - user.user_mmr1) < abs(bm_players[0].user_mmr1 - user.user_mmr1)):
                        best_tournament = tournament
                else:
                    best_tournament = tournament
        return best_tournament
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def join_game(opponent, main_user, mode):
    nb_max_player = 2
    if (mode == '2v2' or mode == '2v2P'):
        nb_max_player = 4
    try:
        op_match = PongGame.objects.filter(owner=opponent.user_id).exclude(status='ended').filter(isBattle=False).first()
        my_match = PongGame.objects.filter(owner=main_user.user_id).exclude(status='ended').filter(isBattle=False).first()
        op_players = op_match.players.all()
        my_players = my_match.players.all()
        if (len(op_players) == nb_max_player or len(my_players) == nb_max_player):
            return None
        op_match.players.add(main_user)
        op_match.save()
        return op_match
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def join_tournament(opponent, main_user, mode):
    nb_max_player = 4
    try:
        op_tournament = Tournament.objects.filter(owner=opponent.user_id).exclude(status='ended').first()
        my_tournament = Tournament.objects.filter(owner=main_user.user_id).exclude(status='ended').first()
        op_players = op_tournament.players.all()
        my_players = my_tournament.players.all()
        if (len(op_players) == nb_max_player or len(my_players) == nb_max_player):
            return None
        if op_tournament.j2 == 'none':
            op_tournament.j2 = main_user.user_id
            op_tournament.j2Pseudo = main_user.pseudo
            op_tournament.j2Status = 'none'
        elif op_tournament.j3 == 'none':
            op_tournament.j3 = main_user.user_id
            op_tournament.j3Pseudo = main_user.pseudo
            op_tournament.j3Status = 'none'
        elif op_tournament.j4 == 'none':
            op_tournament.j4 = main_user.user_id
            op_tournament.j4Pseudo = main_user.pseudo
            op_tournament.j4Status = 'none'
        op_tournament.players.add(main_user)
        op_tournament.save()
        return op_tournament
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def save_join_tournament(j_t):
    op_t = Tournament.objects.filter(owner=j_t.owner).exclude(status='ended').first()
    op_t.j2 = j_t.j2
    op_t.j3 = j_t.j3
    op_t.j4 = j_t.j4
    op_t.j2Pseudo = j_t.j2Pseudo
    op_t.j3Pseudo = j_t.j3Pseudo
    op_t.j4Pseudo = j_t.j4Pseudo
    op_t.save()
    return op_t


@database_sync_to_async
def leave_match(user):
    try:
        matchs = PongGame.objects.filter(players=user).exclude(status='ended').exclude(isBattle=True).filter(isCustom=False).all()
        # leaved_match = []
        for match in matchs:
            if match.owner == user.user_id:
                match.delete()
            else:
                match.players.remove(user)
                match.status = 'in_queue'
                match.save()
                # leaved_match.append(match)
        return
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def match_ready(match):
    try:
        if match:
            # gestion game about to start
            players = match.players.all()
            match.j1 = players[0].user_id
            match.j2 = players[1].user_id
            if match.mode == '2v2' or match.mode == '2v2P':
                match.j3 = players[2].user_id
                match.j4 = players[3].user_id
            match.status = 'ready'
            match.locked = True
            match.save()
            return match
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def clear_matchs(player, s_match):
    if player.user_id != s_match.owner:
        player_match = PongGame.objects.filter(owner=player.user_id).exclude(status='ended').exclude(isBattle=True).first()
        if (player_match):
            player_match.players.set([player])
            player_match.status = 'in_queue'
            player_match.locked = True
            player_match.save()
    matchs = PongGame.objects.exclude(owner=player.user_id).filter(players=player).exclude(status='ended').filter(isBattle=False).all()
    for p_match in matchs:
        if (p_match != s_match):
            p_match.players.remove(player)
            p_match.save()

@database_sync_to_async
def clear_tournaments(player, s_tournament):
    if player.user_id != s_tournament.owner:
        player_tournament = Tournament.objects.filter(owner=player.user_id).exclude(status='ended').first()
        if (player_tournament):
            player_tournament.players.set([player])
            player_tournament.status = 'none'
            player_tournament.locked = True
            player_tournament.save()
    tournaments = Tournament.objects.exclude(owner=player.user_id).exclude(owner=s_tournament.owner).filter(players=player).exclude(status='ended').all()
    for tournament in tournaments:
        if (tournament != s_tournament):
            if tournament.j1 == player.user_id:
                #change user_id
                tournament.j1 = tournament.j2
                tournament.j2 = tournament.j3
                tournament.j3 = tournament.j4
                tournament.j4 = 'none'
                #change pseudo associate
                tournament.j1Pseudo = tournament.j2Pseudo
                tournament.j2Pseudo = tournament.j3Pseudo
                tournament.j3Pseudo = tournament.j4Pseudo
                tournament.j4Pseudo = 'none'
            elif tournament.j2 == player.user_id:
                #change user_id
                tournament.j2 = tournament.j3
                tournament.j3 = tournament.j4
                tournament.j4 = 'none'
                #change pseudo associate
                tournament.j2Pseudo = tournament.j3Pseudo
                tournament.j3Pseudo = tournament.j4Pseudo
                tournament.j4Pseudo = 'none'
            elif tournament.j3 == player.user_id:
                #change user_id
                tournament.j3 = tournament.j4
                tournament.j4 = 'none'
                #change pseudo associate
                tournament.j3Pseudo = tournament.j4Pseudo
                tournament.j4Pseudo = 'none'
            elif tournament.j4 == player.user_id:
                #change user_id
                tournament.j4 = 'none'
                #change pseudo associate
                tournament.j4Pseudo = 'none'
            # tournament.status = 'none'
            # tournament.j1Status = 'none'
            # tournament.j2Status = 'none'
            # tournament.j3Status = 'none'
            # tournament.j4Status = 'none'
            tournament.players.remove(player)
            tournament.save()

@database_sync_to_async
def tournament_ready(tournament):
    try:
        if tournament:
            tournament.status = 'ready'
            tournament.save()
            return tournament
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def launch_match(match):
    try:
        if match:
            match.status = 'game_starting'
            match.save()
            return match
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def updateGroupInteract(group):
    try:
        if group:
            group.last_interract = timezone.now()
            group.save()
            return group
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def start_match(match):
    try:
        if match:
            match.status = 'in_game'
            match.players_in_game.set(match.players.all())
            match.save()
            return match
        else:
            return None
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def is_match(user):
    try:
        match = PongGame.objects.filter(players=user).filter(isBattle=False).exclude(status='ended').first()
        if match:
            return match
        else:
            return None
    except Exception as e:
        return None

@database_sync_to_async
def launch_custom_game(userMe):
    try:
        match = PongGame.objects.filter(players=userMe).exclude(status='ended').filter(isCustom=True).filter(isBattle=False).first()
        if match:
            #verification
            nb_player = 0
            if (match.j1 != 'none'):
                nb_player += 1
            if (match.j2 != 'none'):
                nb_player += 1
            if (match.j3 != 'none'):
                nb_player += 1
            if (match.j4 != 'none'):
                nb_player += 1
            if ((match.mode == '1v1') or (match.mode == '1v1P')) and (nb_player != 2):
                raise Exception('nb player invalid')
            elif ((match.mode == '2v2') or (match.mode == '2v2P')) and (nb_player != 4):
                raise Exception('nb player invalid')
            # push des user vers le haut dans les positions
            if (match.j1 == 'none'):
                match.j1 = match.j2
                match.j2 = match.j3
                match.j3 = match.j4
                match.j4 = 'none'
            if (match.j2 == 'none'):
                match.j2 = match.j3
                match.j3 = match.j4
                match.j4 = 'none'
            if (match.j3 == 'none'):
                match.j3 = match.j4
                match.j4 = 'none'
            # start logique
            match.status = 'starting'
            match.players_in_game.set(match.players.all())
            # for update : -----------
            # if (match.j1[0] == '$' or match.j1 == 'none'):
            #     match.j1Pseudo = match.j1
            # else:
            #     p1 = User.object.filter(user_id=match.j1).first()
            #     match.j1Pseudo = p1.pseudo
            # if (match.j2[0] == '$' or match.j2 == 'none'):
            #     match.j2Pseudo = match.j2
            # else:
            #     p2 = User.object.filter(user_id=match.j2).first()
            #     match.j2Pseudo = p2.pseudo
            # if (match.j3[0] == '$' or match.j3 == 'none'):
            #     match.j3Pseudo = match.j3
            # else:
            #     p3 = User.object.filter(user_id=match.j3).first()
            #     match.j3Pseudo = p3.pseudo
            # if (match.j4[0] == '$') or match.j4 == 'none':
            #     match.j4Pseudo = match.j4
            # else:
            #     p4 = User.object.filter(user_id=match.j4).first()
            #     match.j4Pseudo = p4.pseudo
            # -------------------------
            match.save()
            return match
        else:
            return None
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def start_custom_game(userMe):
    try:
        match = PongGame.objects.filter(players=userMe).exclude(status='ended').filter(isCustom=True).filter(isBattle=False).first()
        if match:
            match.status = 'in_game'
            match.save()
            return match
        else:
            return None
    except Exception as e:
        print(e)
        return None

@database_sync_to_async
def newGroupImage(recipient_group, file_name, image_file):
    recipient_group.groupImg.save(file_name, image_file, save=True)
    
@database_sync_to_async
def tournament_match1(tournament):
    return tournament.match1

@database_sync_to_async
def tournament_match2(tournament):
    return tournament.match2

@database_sync_to_async
def tournament_match3(tournament):
    return tournament.match3

@database_sync_to_async
def tournament_match4(tournament):
    return tournament.match4