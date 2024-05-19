from .database import get_user_by_id, get_or_create_contact, contact_unblocked, user_in_contact_blocked
from ..forms import SocketRecipientForm

import json

class ContactUnblocked():
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
                    if await user_in_contact_blocked(contact, self.chat_consumer.user.user_id):
                        await contact_unblocked(contact, self.chat_consumer.user)
                        if await user_in_contact_blocked(contact, recipient_user_id):
                            event_type = "contact_unblocked_done"
                        else:
                            event_type = "contact_fully_unblocked_done"
                        
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

                    else: # Pas actuellement bloqué
                        event_type = "contact_unblocked_impossible"

                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{self.chat_consumer.user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': event_type,
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                            }
                        )