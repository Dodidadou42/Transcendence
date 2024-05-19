from .database import get_user_by_id, get_or_create_contact, contact_friend, database_count, user_in_contact_friend
from ..forms import SocketRecipientForm

import json

class ContactFriend():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def receive(self, text_data_json):
        form = SocketRecipientForm(text_data_json)
        if form.is_valid():
            recipient_user_id = form.cleaned_data['recipient']
            recipient_user = await get_user_by_id(recipient_user_id)

            if self.chat_consumer.user and recipient_user and self.chat_consumer.user != recipient_user:
                contact = await get_or_create_contact(recipient_user, self.chat_consumer.user)
                if contact:
                    if (not await user_in_contact_friend(contact, self.chat_consumer.user.user_id)) and await database_count(contact.blocked) == 0:
                        await contact_friend(contact, self.chat_consumer.user)
                        
                        if await database_count(contact.friend) == 1: # Demande envoyée
                            event_type = "contact_friend_sent"
                        elif await database_count(contact.friend) == 2: # Demande envoyeé par l'autre user avant / demande acceptée
                            event_type = "contact_friend_accepted"

                        for user_i in [recipient_user, self.chat_consumer.user]:
                            await self.chat_consumer.channel_layer.group_send(
                                f"chat_{user_i.socket_id}",
                                {
                                    'type': 'send_message',
                                    'event_type': event_type,
                                    'sender': self.chat_consumer.user.user_id,
                                    'recipient': recipient_user_id,
                                }
                            )

                    else:
                        if await database_count(contact.blocked) != 0: # Contact bloqué par vous ou l'utilisateur
                            event_type = "contact_friend_blocked"    
                        else: # Demande déjà envoyée
                            event_type = "contact_friend_already_sent"

                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.chat_consumer.user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': event_type,
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                            }
                        )