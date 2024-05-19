from .database import get_user_by_id, set_in_game

import json

class UpdateOnlineStatus():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def connect(self):
        event_type = "online_status_online"
        await self.chat_consumer.channel_layer.group_send(
            f"chat_all",
            {
                'type': 'send_message',
                'event_type': event_type,
                'sender': self.chat_consumer.user.user_id,
            }
        )

    async def disconnect(self):
        await set_in_game(self.chat_consumer.user, False) # sécurité en cas de déconnexion en pleine partie
        
        event_type = "online_status_offline"
        await self.chat_consumer.channel_layer.group_send(
            f"chat_all",
            {
                'type': 'send_message',
                'event_type': event_type,
                'sender': self.chat_consumer.user.user_id,
            }
        )

    async def receive(self, text_data_json):
        if self.chat_consumer.user.in_game == False:
            event_type = "online_status_online"
        else:
            event_type = "online_status_ingame"

        await self.chat_consumer.channel_layer.group_send(
            f"chat_all",
            {
                'type': 'send_message',
                'event_type': event_type,
                'sender': self.chat_consumer.user.user_id,
            }
        )