from django.contrib import admin

from .models import User, GroupChat, GroupMessage, PongGame, Contact, ContactMessage, Tournament

import environ
env = environ.Env()
is_debug = env('IS_DEV', default=True)

# Register your models here.

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    if (is_debug == False):
        readonly_fields = ['created_at', 'sender', 'message']
    else:
        readonly_fields = ['created_at']
    fields = ['created_at', 'sender', 'message']

    def has_add_permission(self, request, obj=None):
        return is_debug

class ContactMessageInline(admin.TabularInline):
    if (is_debug == False):
        readonly_fields = ['created_at', 'sender', 'message']
    else:
        readonly_fields = ['created_at']
    fieldsets = [
        (None, {'fields': ['created_at', 'sender', 'message']})
    ]
    model = ContactMessage
    extra = 0
    verbose_name = "Contact Message"
    verbose_name_plural = "Contact Messages"

    def has_add_permission(self, request, obj=None):
        return is_debug


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    inlines = [ContactMessageInline, ]
    if (is_debug == False):
        readonly_fields = ['created_at', 'users']
    else:
        readonly_fields = ['created_at']
    fields = ['created_at', 'users', 'friend', 'blocked']

    def has_add_permission(self, request, obj=None):
        return is_debug

@admin.register(GroupMessage)
class GroupMessageAdmin(admin.ModelAdmin):
    if (is_debug == False):
        readonly_fields = ['created_at', 'sender', 'message']
    else:
        readonly_fields = ['created_at']
    fields = ['created_at', 'sender', 'message']

    def has_add_permission(self, request, obj=None):
        return is_debug

class GroupMessageInline(admin.TabularInline):
    if (is_debug == False):
        readonly_fields = ['created_at', 'sender', 'message']
    else:
        readonly_fields = ['created_at']
    fieldsets = [
        (None, {'fields': ['created_at', 'sender', 'message']})
    ]
    model = GroupMessage
    extra = 0
    verbose_name = "Group Message"
    verbose_name_plural = "Group Messages"

    def has_add_permission(self, request, obj=None):
        return is_debug

@admin.register(GroupChat)
class GroupChatAdmin(admin.ModelAdmin):
    inlines = [GroupMessageInline, ]
    if (is_debug == False):
        readonly_fields = ['created_at', 'users']
    else:
        readonly_fields = ['created_at']
    fields = ['created_at', 'users', 'admins']

    def has_add_permission(self, request, obj=None):
        return is_debug

@admin.register(PongGame)
class PongGameAdmin(admin.ModelAdmin):
    if (is_debug == False):
        readonly_fields = ['pk', 'created_at', 'game_duration', 'winner', 'loser', 'winner_score', 'loser_score', 'players', 'players_in_game', 'mode', 'status', 'locked']
    else:
        readonly_fields = ['pk', 'created_at']
    fields = ['pk', 'created_at', 'game_duration', 'winner', 'loser', 'winner_score', 'loser_score', 'players', 'players_in_game', 'mode', 'j1', 'j2', 'j3', 'j4', 'status', 'isCustom', 'locked']

    def has_add_permission(self, request, obj=None):
        return is_debug

'''
class PongGameWinnerInline(admin.TabularInline):
    if (is_debug == False):
        readonly_fields = ['created_at', 'winner_score', 'loser_score', 'mode']
    else:
        readonly_fields = ['created_at']
    fieldsets = [
        (None, {'fields': ['created_at', 'winner_score', 'loser_score', 'mode']})
    ]
    fk_name = 'winning_games'
    model = PongGame
    extra = 0
    verbose_name = "Won Pong Game"
    verbose_name_plural = "Won Pong Games"

    def has_add_permission(self, request, obj=None):
        return is_debug

class PongGameLoserInline(admin.TabularInline):
    if (is_debug == False):
        readonly_fields = ['created_at', 'winner_score', 'loser_score', 'mode']
    else:
        readonly_fields = ['created_at']
    fieldsets = [
        (None, {'fields': ['created_at', 'winner_score', 'loser_score', 'mode']})
    ]
    fk_name = 'losing_games'
    model = PongGame
    extra = 0
    verbose_name = "Lost Pong Games"
    verbose_name_plural = "Lost Pong Games"

    def has_add_permission(self, request, obj=None):
        return is_debug
'''

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    #inlines = [PongGameWinnerInline, PongGameLoserInline]
    if (is_debug == False):
        readonly_fields = ['created_at', 'user_id', 'pseudo', 'email', 'is_42', 'picture', 'img_preview', 'user_level', 'user_victories', 'user_mmr1']
        fields = ['created_at', 'user_id', 'pseudo', 'email', 'is_42', 'img_preview']
    else:
        readonly_fields = ['created_at', 'img_preview']
        fields = ['created_at', 'user_id', 'pseudo', 'email', 'is_42', 'picture', 'img_preview', 'socket_id', 'user_level', 'user_victories', 'user_mmr1']

    def has_add_permission(self, request, obj=None):
        return is_debug

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    if (is_debug == False):
        readonly_fields = ['created_at', 'players', 'status', 'mode']
        fields = []
    else:
        readonly_fields = ['created_at']
        fields = ['players', 'mode', 'status', 'j1', 'j1Status', 'j1Pseudo', 'j2', 'j2Status', 'j2Pseudo','j3', 'j3Status', 'j3Pseudo', 'j4', 'j4Status', 'j4Pseudo', 'match1', 'match2']

    def has_add_permission(self, request, obj=None):
        return is_debug