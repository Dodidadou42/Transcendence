from django.utils import timezone
from ..forms import SocketMessageForm
from .database import get_or_create_contact, create_contact_message, get_user_by_id, database_count, update_contact_last_interract

import json

def get_origin_from_headers(headers):
    for header_name, header_value in headers:
        if header_name == b'origin':
            return header_value.decode('utf-8')
    
    return None

class ContactMessage():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def receive(self, text_data_json):
        origin = get_origin_from_headers(self.chat_consumer.scope['headers'])
        base_url = origin + '/api/social/images'
        base_urls = origin + '/api/social/images/'
        form = SocketMessageForm(text_data_json)
        if form.is_valid():
            message = form.cleaned_data['message']
            recipient_user_id = form.cleaned_data['recipient']
            recipient_user = await get_user_by_id(recipient_user_id)

            sender_picture = str(self.chat_consumer.user.picture)
            if not sender_picture.startswith('https://'):
                if sender_picture.startswith('/'):
                    sender_picture = base_url + sender_picture
                else:
                    sender_picture = base_urls + sender_picture

            if self.chat_consumer.user and recipient_user and self.chat_consumer.user != recipient_user:
                contact = await get_or_create_contact(recipient_user, self.chat_consumer.user)
                if contact:
                    if await database_count(contact.blocked) == 0:
                        await update_contact_last_interract(contact)

                        contact_message = await create_contact_message(message, self.chat_consumer.user, contact)
                        formatted_date = timezone.localtime(contact_message.created_at).strftime("%H:%M:%S %d/%m/%Y")
                        for user_i in [recipient_user, self.chat_consumer.user]:
                            await self.chat_consumer.channel_layer.group_send(
                                f"chat_{user_i.socket_id}",
                                {
                                    'type': 'send_message',
                                    'event_type': 'contact_message',
                                    'message': message,
                                    'sender': self.chat_consumer.user.user_id,
                                    'recipient': recipient_user_id,
                                    'sender_picture': sender_picture,
                                    'date': formatted_date,
                                }
                            )
                    
                    else: # Contact bloqué par vous ou l'utilisateur
                        await self.chat_consumer.channel_layer.group_send(
                            f"chat_{recipient_user.socket_id}",
                            {
                                'type': 'send_message',
                                'event_type': 'contact_message_blocked',
                                'message': message,
                                'sender': self.chat_consumer.user.user_id,
                                'recipient': recipient_user_id,
                                'sender_picture': sender_picture,
                                'date': None,
                            }
                        )