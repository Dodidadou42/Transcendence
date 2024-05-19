from channels.generic.websocket import AsyncWebsocketConsumer

from .websocket.database import set_user_socket_id, remove_user_socket_id, get_game_table, get_user_by_id

from .websocket.game.global_data import getData
from django.http import HttpResponse

from .forms import EventTypeForm

from .websocket.authenticate import authenticate
from .websocket.contact_message import ContactMessage
from .websocket.group_message import GroupMessage
from .websocket.contact_friend import ContactFriend
from .websocket.contact_unfriend import ContactUnfriend
from .websocket.contact_blocked import ContactBlocked
from .websocket.contact_unblocked import ContactUnblocked
from .websocket.update_online_status import UpdateOnlineStatus
from .websocket.create_table import CreateTable
from .websocket.join_table import JoinTable
from .websocket.game_panel import GamePanel
from .websocket.custom_game import CustomGame
from .websocket.cg_modification import CG_ModifGroup 
from .websocket.tournament import Tournament
from .websocket.matchmaking import Matchmaking

import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.user = await authenticate(self.scope)

        if self.user:
            if self.user.socket_id != '':
                await self.channel_layer.group_send(
                    f"chat_{self.user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'force_close',
                    })
                
            self.socket_id = await set_user_socket_id(self.user)
            
            await self.channel_layer.group_add(
                f"chat_{self.user.socket_id}",
                self.channel_name
            )

            await self.channel_layer.group_add(
                f"chat_all",
                self.channel_name
            )

            self.contact_message = ContactMessage(self)
            self.group_message = GroupMessage(self)
            self.contact_friend = ContactFriend(self)
            self.contact_unfriend = ContactUnfriend(self)
            self.contact_blocked = ContactBlocked(self)
            self.contact_unblocked = ContactUnblocked(self)
            self.update_online_status = UpdateOnlineStatus(self)
            self.create_table = CreateTable(self)
            self.join_table = JoinTable(self)
            self.game_panel = GamePanel(self)
            self.custom_game = CustomGame(self)
            self.cg_modifgroup = CG_ModifGroup(self)
            self.tournament = Tournament(self)
            self.matchmaking = Matchmaking(self)
            
            await self.update_online_status.connect()
            
            table = await get_game_table(self.user)
            if table:
                game = getData(table.id)
                if game:
                    await self.channel_layer.group_send(
                    f"chat_{self.user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'redirect_to_game',
                    })
                    game.player[self.user.user_id].socket_id = self.user.socket_id
                else:
                    await self.channel_layer.group_send(
                    f"chat_{self.user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'redirect_to_dash',
                    })
            else:
                await self.channel_layer.group_send(
                f"chat_{self.user.socket_id}",
                {
                    'type': 'send_message',
                    'event_type': 'redirect_to_dash',
                })
                
            
        else:
            self.disconnect(None)

    async def disconnect(self, close_code):
        self.user = await get_user_by_id(self.user.user_id)
        
        if self.user:
            await self.channel_layer.group_discard(
                f"chat_{self.user.socket_id}",
                self.channel_name
            )

            await self.channel_layer.group_discard(
                f"chat_all",
                self.channel_name
            )

            if self.socket_id == self.user.socket_id:
                await self.update_online_status.disconnect()
                await remove_user_socket_id(self.user)

    async def receive(self, text_data):
        self.user = await get_user_by_id(self.user.user_id)
        text_data_json = json.loads(text_data)
        form = EventTypeForm(text_data_json)
        
        if form.is_valid():
            event_type = form.cleaned_data['event_type']
            
            if event_type == "contact_message":
                await self.contact_message.receive(text_data_json)
            elif event_type == "group_message":
                await self.group_message.receive(text_data_json)
            elif event_type == "group_edit_name":
                await self.group_message.editName(text_data_json)
            elif event_type == "group_edit_picture":
                await self.group_message.editPicture(text_data_json)
            elif event_type == "group_leave":
                await self.group_message.leaveGroup(text_data_json)
            elif event_type == "user_added_group":
                await self.group_message.userAddedGroup(text_data_json)
            elif event_type == "refresh_user_group":
                await self.group_message.refreshUserGroup(text_data_json)
            elif event_type == "contact_friend":
                await self.contact_friend.receive(text_data_json)
            elif event_type == "contact_unfriend":
                await self.contact_unfriend.receive(text_data_json)
            elif event_type == "contact_blocked":
                await self.contact_blocked.receive(text_data_json)
            elif event_type == "contact_unblocked":
                await self.contact_unblocked.receive(text_data_json)
            elif event_type == "create_table":
                await self.create_table.receive(text_data_json)
            elif event_type == "join_table":
                await self.join_table.receive(text_data_json)
            elif event_type == "game_panel":
                await self.join_table.receive(text_data_json)
            elif event_type == "key_press" or event_type == "key_release" or event_type == "request_draw":
                await self.game_panel.receive(text_data_json)
            elif event_type == "cg_owner_leave_group":
                await self.custom_game.Leave(text_data_json)
            elif event_type == "cg_modifMode":
                await self.cg_modifgroup.changeMode(text_data_json)
            elif event_type == "cg_addBotGroup":
                await self.cg_modifgroup.addBot(text_data_json)
            elif event_type == "cg_kickGroup":
                await self.cg_modifgroup.KickFromGroup(text_data_json)
            elif event_type == "cg_InviteUserGroup":
                await self.cg_modifgroup.invitePlayerCGGroup(text_data_json)
            elif event_type == "cg_joinUserGroup":
                await self.cg_modifgroup.addPlayer(text_data_json)
            elif event_type == "cg_member_leave_group":
                await self.cg_modifgroup.MemberLeaveGroup(text_data_json)
            elif event_type == "cg_start_game":
                await self.custom_game.launchGame(text_data_json)
            elif event_type == "accessTournament":
                await self.tournament.accessTournament(text_data_json)
            elif event_type == "leaveTournament":
                await self.tournament.leaveTournament(text_data_json)
            elif event_type == "majTournamentName":
                await self.tournament.majChangeDisplay(text_data_json)
            elif event_type == "tp_isReady":
                await self.tournament.tp_isReady(text_data_json)
            elif event_type == "tp_isReady2":
                await self.tournament.tp_isReady2(text_data_json)
            elif event_type == "accessMatch":
                await self.matchmaking.accessMatch(text_data_json)
            elif event_type == "leaveMatchmaking":
                await self.matchmaking.leaveMatchmaking(text_data_json)

    async def send_message(self, event):
        await self.send(text_data=json.dumps(event))