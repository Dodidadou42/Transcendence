from django.db import models
import PIL
from django.utils.html import mark_safe
from django_otp.models import Device
import uuid

from django.db.models import JSONField

from datetime import datetime, timedelta

# Create your models here.

class User(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    user_id = models.CharField(max_length=15, unique=True)
    pseudo = models.CharField(max_length=15)
    email = models.EmailField(max_length=255, unique=True)
    password_hash = models.CharField(max_length=255)
    is_42 = models.BooleanField(default=True)
    picture = models.ImageField(upload_to='users_media', default='')
    socket_id = models.CharField(max_length=255, default='')
    in_game = models.BooleanField(default=False)
    user_level = models.IntegerField(default=0)
    user_description = models.CharField(max_length=200, default='I am a new player ! Hello world !')
    user_victories = models.IntegerField(default=0)
    user_ratio = models.IntegerField(default=0)
    user_game_played = models.IntegerField(default=0)
    user_mmr1 = models.IntegerField(default=200)
    user_mmr2 = models.IntegerField(default=200)
    user_vip = models.BooleanField(default=False)
    a2f_status = models.BooleanField(default=False)
    otp_secret = models.CharField(max_length=255, blank=True, null=True, default="")
    recovery_mail_code = models.IntegerField(default=0)
    recovery_mail_date = models.DateTimeField(default=datetime(1970, 1, 1, 0, 0))
    connection_mail_code = models.IntegerField(default=0)
    connection_mail_date = models.DateTimeField(default=datetime(1970, 1, 1, 0, 0))

    def img_preview(self):
        return mark_safe(f'<img src = "{self.picture.url}" width = "300"/>')

    def __str__(self):
        return self.user_id

class GroupChat(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    groupId = models.UUIDField(primary_key = True, default = uuid.uuid4, editable = False)
    groupImg = models.ImageField(upload_to='groups_media', default='')
    name = models.CharField(max_length=50)
    users = models.ManyToManyField(User, related_name='groups_users', blank=True)
    admins = models.ManyToManyField(User, related_name='groups_admins', blank=True)
    blocked = models.ManyToManyField(User, related_name='groups_blocked', blank=True)
    last_interract = models.DateTimeField(null=True, default=None)

    def __str__(self):
        users_str = ', '.join([str(user) for user in self.users.all()])
        before_formatted = self.created_at + timedelta(hours=2)
        formatted_date = before_formatted.strftime("%Y-%m-%d %H:%M:%S")
        return f"{formatted_date} - {users_str}" #utilisation de self.id ?

class GroupMessage(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    message = models.CharField(max_length=1023)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_sent_messages')
    chat = models.ForeignKey(GroupChat, on_delete=models.CASCADE, related_name='group_messages')

    def __str__(self):
        before_formatted = self.created_at + timedelta(hours=2)
        formatted_date = before_formatted.strftime("%Y-%m-%d %H:%M:%S")
        return f"{formatted_date} - {self.sender} -> {self.chat}" #utilisation de self.id ?

class Contact(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    users = models.ManyToManyField(User, related_name='contact', blank=True)
    friend = models.ManyToManyField(User, related_name='friend', blank=True)
    blocked = models.ManyToManyField(User, related_name='blocked', blank=True)
    last_interract = models.DateTimeField(null=True, default=None)

    def __str__(self):
        users_str = ', '.join([str(user) for user in self.users.all()])
        before_formatted = self.created_at + timedelta(hours=2)
        formatted_date = before_formatted.strftime("%Y-%m-%d %H:%M:%S")
        return f"{formatted_date} - {users_str}" #utilisation de self.id ?

class ContactMessage(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    message = models.CharField(max_length=1023)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contact_sent_messages')
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='contact_messages')
    users_read = models.ManyToManyField(User, related_name='contact_read_messages', blank=True)

    def __str__(self):
        before_formatted = self.created_at + timedelta(hours=2)
        formatted_date = before_formatted.strftime("%Y-%m-%d %H:%M:%S")
        return f"{formatted_date} - {self.sender} -> {self.contact}" #utilisation de self.id ?

class PongGame(models.Model):
    j1 = models.CharField(max_length=128, default='none')
    j2 = models.CharField(max_length=128, default='none')
    j3 = models.CharField(max_length=128, default='none')
    j4 = models.CharField(max_length=128, default='none')
    players = models.ManyToManyField(User, related_name='games', blank=True)
    players_in_game = models.ManyToManyField(User, related_name='in_games', blank=True)
    mode = models.CharField(max_length=128)

    isCustom = models.BooleanField(default=False)
    isBattle = models.BooleanField(default=False)
    owner = models.CharField(max_length=128, default='no')
    locked = models.BooleanField(default=False)

    status = models.CharField(max_length=128)

    winner = models.ManyToManyField(User, related_name='winning_games')
    loser = models.ManyToManyField(User, related_name='losing_games')

    winner_score = models.IntegerField(null=True)
    loser_score = models.IntegerField(null=True)

    winner_powerups_activated = models.IntegerField(default=0)
    loser_powerups_activated = models.IntegerField(default=0)
    winner_bonus_activated = models.IntegerField(default=0)
    loser_bonus_activated = models.IntegerField(default=0)
    winner_malus_activated = models.IntegerField(default=0)
    loser_malus_activated = models.IntegerField(default=0)
    winner_highest_points_streak = models.IntegerField(default=0)
    loser_highest_points_streak = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    game_duration = models.IntegerField(default=0)
    total_balls_hits = models.IntegerField(default=0)
    highest_balls_hits_streak = models.IntegerField(default=0)
    highest_balls_speed = models.IntegerField(default=0)
    total_powerups_activated = models.IntegerField(default=0)
    total_freeze_powerups_activated = models.IntegerField(default=0)
    total_slow_powerups_activated = models.IntegerField(default=0)
    total_speed_powerups_activated = models.IntegerField(default=0)
    total_multi_ball_powerups_activated = models.IntegerField(default=0)
    total_racket_reduction_powerups_activated = models.IntegerField(default=0)
    total_racket_increase_powerups_activated = models.IntegerField(default=0)
    
    point_time_time = JSONField(default=list)
    point_time_left = JSONField(default=list)
    point_time_right = JSONField(default=list)

    def __str__(self):
        players_str = ', '.join([str(player) for player in self.players.all()])
        before_formatted = self.created_at + timedelta(hours=2)
        formatted_date = before_formatted.strftime("%Y-%m-%d %H:%M:%S")
        return f"{formatted_date} - {players_str}"

class Tournament(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    winner = models.ManyToManyField(User, related_name='winning_games_tournament')
    j1 = models.CharField(max_length=128, default='none')
    j2 = models.CharField(max_length=128, default='none')
    j3 = models.CharField(max_length=128, default='none')
    j4 = models.CharField(max_length=128, default='none')
    j1Pseudo = models.CharField(max_length=128, default='none')
    j2Pseudo = models.CharField(max_length=128, default='none')
    j3Pseudo = models.CharField(max_length=128, default='none')
    j4Pseudo = models.CharField(max_length=128, default='none')
    players = models.ManyToManyField(User, related_name='tournament_players', blank=True)
    status = models.CharField(max_length=10, default='none')
    j1Status = models.CharField(max_length=10, default='none') # none c'est quand la game est pas lancer
    j2Status = models.CharField(max_length=10, default='none') # et apres on aura in_game ou waiting
    j3Status = models.CharField(max_length=10, default='none') # et a la fin over
    j4Status = models.CharField(max_length=10, default='none') # 
    mode = models.CharField(max_length=10, default='1v1')
    match1 = models.OneToOneField(PongGame, on_delete=models.CASCADE, related_name='match1', null=True, blank=True)
    match2 = models.OneToOneField(PongGame, on_delete=models.CASCADE, related_name='match2', null=True, blank=True)
    match3 = models.OneToOneField(PongGame, on_delete=models.CASCADE, related_name='match3', null=True, blank=True)
    match4 = models.OneToOneField(PongGame, on_delete=models.CASCADE, related_name='match4', null=True, blank=True)

    owner = models.CharField(max_length=128, default='no')
    locked = models.BooleanField(default=False)

    def __str__(self):
        players_str = ', '.join([str(player) for player in self.players.all()])
        before_formatted = self.created_at + timedelta(hours=2)
        formatted_date = before_formatted.strftime("%Y-%m-%d %H:%M:%S")
        return f"{formatted_date} - {players_str}"