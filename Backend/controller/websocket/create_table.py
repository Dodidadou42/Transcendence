from .database import get_user_by_id, create_table, get_tournament_Q, get_or_create_contact, database_count, is_in_table, destroy_table, get_game_table, get_game_table_Q, get_in_game_table_or_in_queue
from .game.global_data import getData
from ..forms import SocketRecipientForm, SocketGameInviteForm

import json

import asyncio

class CreateTable():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def game(self, table, text_data_json):
        await asyncio.sleep(15)
        if (await database_count(table.players_in_game) != 2):
            await destroy_table(table)
            form = SocketRecipientForm(text_data_json)
            if form.is_valid():
                recipient_user_id = form.cleaned_data['recipient']
                opponent = await get_user_by_id(recipient_user_id)
                
                event_type = "create_table_expires"
                
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

    async def receive(self, text_data_json):        
        form = SocketGameInviteForm(text_data_json)
        if form.is_valid():
            recipient_user_id = form.cleaned_data['recipient']
            game_mode = form.cleaned_data['mode']
            if game_mode != '1v1' and game_mode != '1v1P' and game_mode != '2v2' and game_mode != '2v2P':
                game_mode = '1v1'
                
            opponent = await get_user_by_id(recipient_user_id)
            
            safe_opponent = await get_in_game_table_or_in_queue(opponent)
            opponent_is_in_game = await get_game_table_Q(opponent)
            opponent_is_in_t = await get_tournament_Q(opponent)

            if safe_opponent or opponent_is_in_game or opponent_is_in_t:
                event_type = "opponent_already_in_game"
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
            
            if self.chat_consumer.user and opponent and self.chat_consumer.user != opponent:
                contact = await get_or_create_contact(self.chat_consumer.user, opponent)
                if contact:
                    if await database_count(contact.blocked) == 0:
                        table = await is_in_table(self.chat_consumer.user)
                        if table:
                            await destroy_table(table)
                            
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
                            
                        table = await create_table(self.chat_consumer.user, opponent, game_mode)
                        
                        event_type = "create_table_success"

                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.chat_consumer.user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': event_type,
                                'sender': self.chat_consumer.user.user_id,
                                'opponent': recipient_user_id,
                                'mode': game_mode,
                            }
                        )

                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{opponent.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': event_type,
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                                'mode': game_mode,
                            }
                        )
                        
                        asyncio.create_task(self.game(table, text_data_json))
                            
                    else: # contact bloqué par vous ou par l'opposant 
                        event_type = "create_table_blocked"

                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.chat_consumer.user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': event_type,
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                            }
                        )