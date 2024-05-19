from django.utils import timezone
from ..forms import SocketGroupMessageForm, SocketEditGroupNameForm, SocketEditPictureForm, SocketGroupNameForm, SocketUserGroupAddedForm, SocketUserGroupRemovedForm
import random
from django.core.files.base import ContentFile
import base64
import imghdr

from .database import get_user_by_id, get_group_by_id, newGroupImage, create_group_message, get_users_table, updateGroupInteract, edit_group_name, edit_group_picture, leave_group, added_to_group

import json

def get_origin_from_headers(headers):
    for header_name, header_value in headers:
        if header_name == b'origin':
            return header_value.decode('utf-8')
    
    return None

class GroupMessage():
    def __init__(self, chat_consumer):
        self.chat_consumer = chat_consumer

    async def receive(self, text_data_json):
        form = SocketGroupMessageForm(text_data_json)
        if form.is_valid():
            message = form.cleaned_data['message']
            recipient_group_id = form.cleaned_data['recipient']
            recipient_group = await get_group_by_id(recipient_group_id)


            if self.chat_consumer.user and recipient_group:
                users = await get_users_table(recipient_group)
                if (self.chat_consumer.user not in users):
                    return

                group_message = await create_group_message(message, self.chat_consumer.user, recipient_group)
                formatted_date = timezone.localtime(group_message.created_at).strftime("%H:%M:%S %d/%m/%Y")
                await updateGroupInteract(recipient_group)
                
                origin = get_origin_from_headers(self.chat_consumer.scope['headers'])
                base_url = origin + '/api/social/images'
                base_urls = origin + '/api/social/images/'
                senderImg = str(self.chat_consumer.user.picture)
                if not senderImg.startswith('https://'):
                    if senderImg.startswith('/'):
                        senderImg = base_url + senderImg
                    else:
                        senderImg = base_urls + senderImg
                for recipient_user in users:
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{recipient_user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'group_message',
                            'message': message,
                            'sender': self.chat_consumer.user.user_id,
                            'recipient': recipient_group_id,
                            'date': formatted_date,
                            'sender_picture': senderImg,
                            'groupName': recipient_group.name,
                        }
                    )

    async def editName(self, text_data_json):
        form = SocketEditGroupNameForm(text_data_json)
        if form.is_valid():
            newName = form.cleaned_data['newName']
            recipient_group_id = form.cleaned_data['recipient']
            recipient_group = await get_group_by_id(recipient_group_id)


            if self.chat_consumer.user and recipient_group:

                last_name = await edit_group_name(recipient_group_id, newName)
                users = await get_users_table(recipient_group)

                for recipient_user in users:
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{recipient_user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'new_group_name',
                            'sender': self.chat_consumer.user.user_id,
                            'recipient': recipient_group_id,
                            'newName': newName,
                            'lastName': last_name,
                        }
                    )

    async def editPicture(self, text_data_json):
        form = SocketEditPictureForm(text_data_json)
        if form.is_valid():
            recipient_group_id = form.cleaned_data['recipient']
            recipient_group = await get_group_by_id(recipient_group_id)

            random_num = random.randint(1, 1000)
            image_data = form.cleaned_data['newPic'].split(';base64,')[1]
            image_data_binary = base64.b64decode(image_data)
            image_type = imghdr.what(None, image_data_binary)
            allowed_extensions = ['jpg', 'jpeg', 'png', 'gif']
            if image_type not in allowed_extensions:
                return
            image_file = ContentFile(image_data_binary, name=f"{recipient_group_id}.{image_type}")
            file_name = f"{recipient_group_id}_{random_num}.{image_type}"
            await newGroupImage(recipient_group, file_name, image_file)

            origin = get_origin_from_headers(self.chat_consumer.scope['headers'])
            base_url = origin + '/api/social/images'
            base_urls = origin + '/api/social/images/'

            if self.chat_consumer.user and recipient_group:

                group = await edit_group_picture(recipient_group_id, image_file, random_num)
                if not group['picture'].startswith('https://'):
                    if group['picture'].startswith('/'):
                        group['picture'] = base_url + group['picture']
                    else:
                        group['picture'] = base_urls + group['picture']
                users = await get_users_table(recipient_group)

                for recipient_user in users:
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{recipient_user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'new_group_picture',
                            'sender': self.chat_consumer.user.user_id,
                            'recipient': recipient_group_id,
                            'id': group['name'],
                            'newPic': group['picture']
                        }
                    )

    async def leaveGroup(self, text_data_json):
        form = SocketGroupNameForm(text_data_json)
        if form.is_valid():
            recipient_group_id = form.cleaned_data['recipient']
            recipient_group = await get_group_by_id(recipient_group_id)
            if self.chat_consumer.user and recipient_group:

                await leave_group(recipient_group_id, self.chat_consumer.user.user_id)
                users = await get_users_table(recipient_group)

                await self.chat_consumer.channel_layer.group_send(
                    f"chat_{self.chat_consumer.user.socket_id}",
                    {
                        'type': 'send_message',
                        'event_type': 'i_leave_group',
                        'recipient': recipient_group_id,
                    }
                )
                for recipient_user in users:
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{recipient_user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'member_leave_group',
                            'sender': self.chat_consumer.user.user_id,
                            'recipient': recipient_group_id,
                        }
                  )

    async def userAddedGroup(self, text_data_json):
        form = SocketUserGroupAddedForm(text_data_json)
        if form.is_valid():
            recipient_group_id = form.cleaned_data['recipient']
            user_added_id = form.cleaned_data['user_added']

            added_user = await get_user_by_id(user_added_id)
            recipient_group = await get_group_by_id(recipient_group_id)

            if self.chat_consumer.user and recipient_group:

                await added_to_group(recipient_group_id, added_user)
                users = await get_users_table(recipient_group)

                for recipient_user in users:
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{recipient_user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'member_added_group',
                            'sender': self.chat_consumer.user.user_id,
                            'recipient': recipient_group_id,
                        }
                    )

    async def refreshUserGroup(self, text_data_json):
        form = SocketUserGroupRemovedForm(text_data_json)
        if form.is_valid():
            recipient_group_id = form.cleaned_data['recipient']
            userRemoved = form.cleaned_data['userRemoved']
            rm_user = await get_user_by_id(userRemoved)
            recipient_group = await get_group_by_id(recipient_group_id)

            await self.chat_consumer.channel_layer.group_send(
                f"chat_{rm_user.socket_id}",
                {
                    'type': 'send_message',
                    'event_type': 'need_refresh_group',
                    'sender': self.chat_consumer.user.user_id,
                    'recipient': recipient_group_id,
                }
            )

            if recipient_group:

                users = await get_users_table(recipient_group)

                for recipient_user in users:
                    await self.chat_consumer.channel_layer.group_send(
                        f"chat_{recipient_user.socket_id}",
                        {
                            'type': 'send_message',
                            'event_type': 'need_refresh_group',
                            'sender': self.chat_consumer.user.user_id,
                            'recipient': recipient_group_id,
                        }
                    )