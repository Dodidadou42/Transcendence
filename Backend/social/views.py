from controller.models import User, Contact, ContactMessage, GroupChat, GroupMessage, PongGame

from django.http import JsonResponse, HttpResponse
from urllib.parse import urljoin
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
import base64
import random
import imghdr

from django.utils import timezone

import jwt
import os
import json

import qrcode
from io import BytesIO
import pyotp
from .forms import searchUserForm, userOnlyForm, postPicForm, postInfosForm, gameHistoryForm, addUserGroupForm, sendUserHistForm, remUserGroupForm, getGroupChatForm, toggleA2fForm, createGroupForm

class ValueError(Exception):
    pass

def get_contacts_list(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                user = User.objects.get(user_id=user_id)

                unique_users = set()

                contacts = Contact.objects.filter(users=user)

                for contact in contacts:
                    unique_users.update(contact.users.all())

                unique_users = [contact_user for contact_user in unique_users if contact_user.id != user.id]

                users_data = [{'user_id': contact_user.user_id, 'pseudo': contact_user.pseudo} for contact_user in unique_users]

                response_data = {'success': True, 'contacts': users_data}
                return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def get_contacts_messages(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')
                contact_id = request.GET.get('contact_id')
                address = request.get_host()
                port = os.environ.get('PORT_NGINX_HOST')
                base_url = 'https://' + address + ':' + port + '/api/social/images'
                base_urls = 'https://' + address + ':' + port + '/api/social/images/'


                contact = Contact.objects.filter(users__user_id=user_id).filter(users__user_id=contact_id)
                user = User.objects.get(user_id=user_id)
                contact_user = User.objects.get(user_id=contact_id)
                me_pp = str(user.picture)
                if not me_pp.startswith('https://'):
                    if me_pp.startswith('/'):
                        me_pp = base_url + me_pp
                    else:
                        me_pp = base_urls + me_pp
                other_pp = str(contact_user.picture)
                if not other_pp.startswith('https://'):
                    if other_pp.startswith('/'):
                        other_pp = base_url + other_pp
                    else:
                        other_pp = base_urls + other_pp
                if contact.count() != 1:
                    try:
                        contact = Contact.objects.create()
                        contact.users.set([user, contact_user])
                        contact.save()
                    except User.DoesNotExist:
                        response_data = {'success': False, 'error': 'Contact doesn\'t exist'}
                        return JsonResponse(response_data, status=202)
                else:
                    contact = contact.first()

                messages = ContactMessage.objects.filter(contact=contact)
                messages_data = [{'sender': message.sender.user_id, 'message': message.message, 'created_at': message.created_at} for message in messages]

                response_data = {'success': True, 'messages': messages_data, 'owner': user_id, 'own_pic': me_pp, 'oth_pic': other_pp}
                return JsonResponse(response_data , status=200)
            except Contact.DoesNotExist:
                response_data = {'success': False, 'error': 'Chat doesn\'t exist'}
                return JsonResponse(response_data, status=202)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def get_me_user_id(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                response_data = {'success': True, 'user_id': user_id}
                return JsonResponse(response_data , status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def get_image(request, image_filename):
    # Chemin complet vers le fichier image
    image_path = os.path.join('./api/media/default_media/', image_filename)
    image_path2 = os.path.join('./api/media/users_media/', image_filename)
    image_path3 = os.path.join('./api/media/groups_media/', image_filename)
    # Vérifiez si le fichier existe
    if os.path.exists(image_path):
        # Ouvrez le fichier et lisez les données
        with open(image_path, 'rb') as image_file:
            response = HttpResponse(image_file.read(), content_type='image/jpeg')  # ou le type MIME approprié
            return response
    elif os.path.exists(image_path2):
        # Ouvrez le fichier et lisez les données
        with open(image_path2, 'rb') as image_file:
            response = HttpResponse(image_file.read(), content_type='image/jpeg')  # ou le type MIME approprié
            return response
    elif os.path.exists(image_path3):
        # Ouvrez le fichier et lisez les données
        with open(image_path3, 'rb') as image_file:
            response = HttpResponse(image_file.read(), content_type='image/jpeg')  # ou le type MIME approprié
            return response
    else:
        # Si le fichier n'existe pas, renvoyez une réponse 404
        return JsonResponse({"error": "image not found"}, status=202)

def post_search_user_list(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = searchUserForm(data)
            if not form.is_valid():
                response_data = {'success': False, 'message': 'Invalid Data'}
                return JsonResponse(response_data, status=202)
            user_filter = form.cleaned_data['filter']
            user_input = form.cleaned_data['user_input']
            u_id = ''

            cookie_auth = request.COOKIES.get('auth')
            if (cookie_auth):
                payload = jwt.decode(cookie_auth, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                u_id = payload.get('user_id')
            else:
                raise ValueError('The User is not connected')

            response = ''

            if (user_filter == 'all'):
                response = get_ul_all(user_input, u_id, request)
            elif (user_filter == 'friend'):
                response = get_ul_friend(user_input, u_id, request)
            elif (user_filter == 'online'):
                response = get_ul_online(user_input, u_id, request)
            elif (user_filter == 'request'):
                response = get_ul_request(user_input, u_id, request)
            elif (user_filter == 'blocked'):
                response = get_ul_blocked(user_input, u_id, request)
            elif (user_filter == 'allInGroup'):
                response = get_ul_all_in_group(user_input, u_id, request, data)
            else:
                response = get_ul_all(user_input, u_id, request)

            return response

        except ValueError as e:
            response_data = {'success': False, 'message': str(e)}
            return JsonResponse(response_data, status=202)
        except Exception as e:
            response_data = {'success': False, 'message': 'error occured : ' + str(e)}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def get_ul_all(user_input, me, request):
    user_list = list(User.objects.filter(user_id__icontains=user_input).values('user_id', 'pseudo', 'picture'))
    address = request.get_host()
    port = os.environ.get('PORT_NGINX_HOST')
    base_url = 'https://' + address + ':' + port + '/api/social/images'
    base_urls = 'https://' + address + ':' + port + '/api/social/images/'
    filtered_user_list = []
    for user in user_list:
        if user['user_id'] == me:
            continue # pour passer a l'user suivant sans l'ajouter
        contacts = Contact.objects.filter(users__user_id=me).filter(users__user_id=user['user_id'])
        skip = False
        for contact in contacts:
            blocked_users = contact.blocked.filter(user_id=me)
            if blocked_users.exists():
                skip = True
                break
        if (skip == True):
            continue
        if not user['picture'].startswith('https://'):
            if user['picture'].startswith('/'):
                user['picture'] = base_url + user['picture']
            else:
                user['picture'] = base_urls + user['picture']
        filtered_user_list.append(user)
        # Limiter la longueur de la liste à 20
        if len(filtered_user_list) >= 20:
            break
    response_data = {'success': True, 'message': 'here the response', 'List': filtered_user_list}
    return JsonResponse(response_data, status=200)

def get_ul_all_in_group(user_input, me, request, data):
    user_list = list(User.objects.filter(user_id__icontains=user_input).values('user_id', 'pseudo', 'picture'))
    address = request.get_host()
    port = os.environ.get('PORT_NGINX_HOST')
    base_url = 'https://' + address + ':' + port + '/api/social/images'
    base_urls = 'https://' + address + ':' + port + '/api/social/images/'
    filtered_user_list = []
    groupId = data['groupId']
    group = GroupChat.objects.get(groupId=groupId)
    groupUsers = group.users.all()
    for user in user_list:
        if user['user_id'] == me:
            continue # pour passer a l'user suivant sans l'ajouter
        contacts = Contact.objects.filter(users__user_id=me).filter(users__user_id=user['user_id'])
        skip = False
        for contact in contacts:
            blocked_users = contact.blocked.filter(user_id=me)
            if blocked_users.exists():
                skip = True
                break
        for groupUser in groupUsers:
            if groupUser.user_id == user['user_id']:
                skip = True
                break
        if (skip == True):
            continue
        if not user['picture'].startswith('https://'):
            if user['picture'].startswith('/'):
                user['picture'] = base_url + user['picture']
            else:
                user['picture'] = base_urls + user['picture']
        filtered_user_list.append(user)
        # Limiter la longueur de la liste à 20
        if len(filtered_user_list) >= 20:
            break
    response_data = {'success': True, 'message': 'here the response', 'List': filtered_user_list}
    return JsonResponse(response_data, status=200)

def get_ul_friend(user_input, me, request):
    user = User.objects.get(user_id=me)
    contact_tab = Contact.objects.filter(users=user)
    user_list = list()
    for contact in contact_tab:
        if contact.friend.count() == 2:
            contact_users = contact.users.all()
            friend = None
            for contact_user in contact_users:
                if contact_user != user:
                    friend = contact_user
            if friend is not None:
                user_list.append({'user_id': friend.user_id, 'pseudo': friend.pseudo, 'picture': str(friend.picture)})
    address = request.get_host()
    port = os.environ.get('PORT_NGINX_HOST')
    base_url = 'https://' + address + ':' + port + '/api/social/images'
    base_urls = 'https://' + address + ':' + port + '/api/social/images/'
    filtered_user_list = []
    for user in user_list:
        if user['user_id'] == me:
            continue # pour passer a l'user suivant sans l'ajouter
        if not user_input.lower() in user['user_id'].lower():
            continue # pour enlever les user qui n'ont rien a voir avec la recherche
        if not user['picture'].startswith('https://'):
            if user['picture'].startswith('/'):
                user['picture'] = base_url + user['picture']
            else:
                user['picture'] = base_urls + user['picture']
        filtered_user_list.append(user)
        # Limiter la longueur de la liste à 50
        if len(filtered_user_list) >= 20:
            break
    response_data = {'success': True, 'message': 'here the response', 'List': filtered_user_list}
    return JsonResponse(response_data, status=200)

def get_ul_online(user_input, me, request):
    user = User.objects.get(user_id=me)
    contact_tab = Contact.objects.filter(users=user)
    user_list = list()
    for contact in contact_tab:
        if contact.friend.count() == 2:
            contact_users = contact.users.all()
            friend = None
            for contact_user in contact_users:
                if contact_user != user:
                    friend = contact_user
            if friend is not None:
                user_list.append({'user_id': friend.user_id, 'pseudo': friend.pseudo, 'picture': str(friend.picture), 'socket_id': friend.socket_id})
    address = request.get_host()
    port = os.environ.get('PORT_NGINX_HOST')
    base_url = 'https://' + address + ':' + port + '/api/social/images'
    base_urls = 'https://' + address + ':' + port + '/api/social/images/'
    filtered_user_list = []
    for user in user_list:
        if user['user_id'] == me:
            continue # pour passer a l'user suivant sans l'ajouter
        if not user_input.lower() in user['user_id'].lower():
            continue # pour enlever les user qui n'ont rien a voir avec la recherche
        if user['socket_id'] == '':
            continue # pour passer si il est pas en ligne
        if not user['picture'].startswith('https://'):
            if user['picture'].startswith('/'):
                user['picture'] = base_url + user['picture']
            else:
                user['picture'] = base_urls + user['picture']
        filtered_user_list.append(user)
        # Limiter la longueur de la liste à 50
        if len(filtered_user_list) >= 20:
            break
    response_data = {'success': True, 'message': 'here the response', 'List': filtered_user_list}
    return JsonResponse(response_data, status=200)

def get_ul_request(user_input, me, request):
    user = User.objects.get(user_id=me)
    contact_tab = Contact.objects.filter(users=user)
    user_list = list()
    for contact in contact_tab:
        if contact.friend.count() == 1:
            friends = contact.friend.all()
            for friend in friends:
                if (friend is not me):
                    user_list.append({'user_id': friend.user_id, 'pseudo': friend.pseudo, 'picture': str(friend.picture), 'socket_id': friend.socket_id})
                    break
    address = request.get_host()
    port = os.environ.get('PORT_NGINX_HOST')
    base_url = 'https://' + address + ':' + port + '/api/social/images'
    base_urls = 'https://' + address + ':' + port + '/api/social/images/'
    filtered_user_list = []
    for user in user_list:
        if user['user_id'] == me:
            continue # pour passer a l'user suivant sans l'ajouter
        if not user_input.lower() in user['user_id'].lower():
            continue # pour enlever les user qui n'ont rien a voir avec la recherche
        if not user['picture'].startswith('https://'):
            if user['picture'].startswith('/'):
                user['picture'] = base_url + user['picture']
            else:
                user['picture'] = base_urls + user['picture']
        filtered_user_list.append(user)
        # Limiter la longueur de la liste à 50
        if len(filtered_user_list) >= 20:
            break
    response_data = {'success': True, 'message': 'here the response', 'List': filtered_user_list}
    return JsonResponse(response_data, status=200)

def get_ul_blocked(user_input, me, request):
    user = User.objects.get(user_id=me)
    contact_tab = Contact.objects.filter(users=user)
    user_list = list()
    for contact in contact_tab:
        if contact.blocked.count() > 0:
            contact_users = contact.blocked.all()
            otherU = None
            for contact_user in contact_users:
                if contact_user == user:
                    two_users = contact.users.all()
                    for x in two_users:
                        if x != user:
                            otherU = x
            if otherU is not None:
                user_list.append({'user_id': otherU.user_id, 'pseudo': otherU.pseudo, 'picture': str(otherU.picture)})
    address = request.get_host()
    port = os.environ.get('PORT_NGINX_HOST')
    base_url = 'https://' + address + ':' + port + '/api/social/images'
    base_urls = 'https://' + address + ':' + port + '/api/social/images/'
    filtered_user_list = []
    for user in user_list:
        if user['user_id'] == me:
            continue # pour passer a l'user suivant sans l'ajouter
        if not user_input.lower() in user['user_id'].lower():
            continue # pour enlever les user qui n'ont rien a voir avec la recherche
        if not user['picture'].startswith('https://'):
            if user['picture'].startswith('/'):
                user['picture'] = base_url + user['picture']
            else:
                user['picture'] = base_urls + user['picture']
        filtered_user_list.append(user)
        # Limiter la longueur de la liste à 50
        if len(filtered_user_list) >= 20:
            break
    response_data = {'success': True, 'message': 'here the response', 'List': filtered_user_list}
    return JsonResponse(response_data, status=200)


def get_user_info_profil(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = userOnlyForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        user_to_check = form.cleaned_data['user']
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                return get_profil_of_user(user_to_check, user_id, request)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def get_profil_of_user(user_to_search_id, me_id, request):
    try:
        address = request.get_host()
        port = os.environ.get('PORT_NGINX_HOST')
        base_url = 'https://' + address + ':' + port + '/api/social/images'
        base_urls = 'https://' + address + ':' + port + '/api/social/images/'
        user = User.objects.get(user_id=user_to_search_id)
        user_me = User.objects.get(user_id=me_id)
        isOnline = (user.socket_id != '' and user.socket_id != 'test')
        inGame = user.in_game
        contact = Contact.objects.filter(users=user).filter(users=user_me).first()
        isFriend = False
        sentFriend = False
        ReceiveFriend = False
        isBlocked = False
        sentBlocked = False
        ReceiveBlocked = False
        if contact:
            if contact.friend.count() == 2:
                isFriend = True
            if contact.friend.count() == 1:
                if contact.friend.filter(user_id=user_to_search_id).exists():
                    ReceiveFriend = True
                else:
                    sentFriend = True
            if contact.blocked.count() > 0:
                isBlocked = True
                if contact.blocked.filter(user_id=user_to_search_id).exists():
                    ReceiveBlocked = True
                if contact.blocked.filter(user_id=user_me).exists():
                    sentBlocked = True

        user_data = {
            'user_id': user.user_id,
            'pseudo': user.pseudo,
            'desc': user.user_description,
            'picture': str(user.picture),
            'victory': user.user_victories,
            'kd': user.user_ratio,
            'gamePlayed': user.user_game_played,
            'mmr1': user.user_mmr1,
            'mmr2': user.user_mmr2,
            'vip': user.user_vip,
            'online': isOnline,
            'inGame' : inGame,
            'level': user.user_level,
            'isFriend': isFriend,
            'sentFriend': sentFriend,
            'ReceiveFriend': ReceiveFriend,
            'isBlocked': isBlocked,
            'sentBlocked': sentBlocked,
            'ReceiveBlocked': ReceiveBlocked,
        }
        if 'user_id' not in user_data:
            raise Exception('error in the user')
        if not user_data['picture'].startswith('https://'):
            if user_data['picture'].startswith('/'):
                user_data['picture'] = base_url + user_data['picture']
            else:
                user_data['picture'] = base_urls + user_data['picture']
        response_data = {'success': True, 'message': 'Here the info', 'profil': user_data}
        return JsonResponse(response_data, status=200)
    except ValueError as e:
        response_data = {'success': False, 'message': str(e)}
        return JsonResponse(response_data, status=202)
    except Exception as e:
        response_data = {'success': False, 'message': 'error occured : ' + str(e)}
        return JsonResponse(response_data, status=202)

def get_user_info_profil_me(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')
                return get_profil_of_user(user_id, user_id, request)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def get_user_me_info_home(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')
                try:
                    address = request.get_host()
                    port = os.environ.get('PORT_NGINX_HOST')
                    base_url = 'https://' + address + ':' + port + '/api/social/images'
                    base_urls = 'https://' + address + ':' + port + '/api/social/images/'
                    user = User.objects.get(user_id=user_id)
                    
                    victory_ratio_list = list()
                    
                    last_games = PongGame.objects.filter(players=user).filter(isCustom=False).filter(status="ended").order_by('-created_at')
                    nb_last_games = last_games.count()
                    
                    if nb_last_games > 60:
                        last_games = last_games[:60]

                    for x in range(min(nb_last_games, 30) -1, -1, -1):
                        games_slice = last_games[x:min(nb_last_games, x + 30)]
                        game_ids = games_slice.values_list('id', flat=True)
                        victories = PongGame.objects.filter(id__in=game_ids, winner=user).count()
                        ratio = victories / games_slice.count() * 100
                        victory_ratio_list.append(ratio)
                    
                    nb_winner_streak = 0
                    nb_winner = 0
                    nb_loser_streak = 0
                    nb_loser = 0
                    nb_bonus_taken = 0
                    nb_malus_taken = 0
                    nb_points_put = 0
                    nb_points_taken = 0
                    
                    powerups_games = 0
                    
                    vs1 = 0
                    winvs1 = 0
                    
                    vs1P = 0
                    winvs1P = 0
                    
                    vs2 = 0
                    winvs2 = 0
                    
                    vs2P = 0
                    winvs2P = 0
                    
                    win = 0
                    for y in range(min(nb_last_games, 30)):
                        if last_games[y].mode == "1v1":
                            vs1 += 1
                        if last_games[y].mode == "1v1P":
                            vs1P += 1
                        if last_games[y].mode == "2v2":
                            vs2 += 1
                        if last_games[y].mode == "2v2P":
                            vs2P += 1
                        
                        if last_games[y].winner.filter(user_id=user_id).exists():
                            win += 1
                            nb_winner += 1
                            nb_points_put += last_games[y].winner_score
                            nb_points_taken += last_games[y].loser_score
                            if nb_loser > nb_loser_streak:
                                nb_loser_streak = nb_loser
                            nb_loser = 0
                            if last_games[y].mode == "1v1P" or last_games[y].mode == "2v2P":
                                powerups_games += 1
                                nb_bonus_taken += last_games[y].winner_bonus_activated
                                nb_malus_taken += last_games[y].winner_malus_activated
                            if last_games[y].mode == "1v1":
                                winvs1 += 1
                            if last_games[y].mode == "1v1P":
                                winvs1P += 1
                            if last_games[y].mode == "2v2":
                                winvs2 += 1
                            if last_games[y].mode == "2v2P":
                                winvs2P += 1
                        else:
                            nb_loser += 1
                            nb_points_put += last_games[y].loser_score
                            nb_points_taken += last_games[y].winner_score
                            if nb_winner > nb_winner_streak:
                                nb_winner_streak = nb_winner
                            nb_winner = 0
                            if last_games[y].mode == "1v1P" or last_games[y].mode == "2v2P":
                                powerups_games += 1
                                nb_bonus_taken += last_games[y].loser_bonus_activated
                                nb_malus_taken += last_games[y].loser_malus_activated
                    if nb_loser > nb_loser_streak:
                        nb_loser_streak = nb_loser
                        nb_loser = 0
                    if nb_winner > nb_winner_streak:
                        nb_winner_streak = nb_winner
                        nb_winner = 0
                    
                    capybara = min(100, nb_winner_streak * 10)
                    waste = min(100, nb_loser_streak * 10)
                    if powerups_games > 0:
                        masochist = min(100, nb_malus_taken / powerups_games * 10)
                        drugged = min(100, nb_bonus_taken / powerups_games * 10)
                    else:
                        masochist = 0
                        drugged = 0
                    if (nb_points_taken > 0):
                        defender = min(100, nb_last_games * 120 / nb_points_taken)
                    elif (nb_last_games == 0):
                        defender = 0
                    else:
                        defender = 100
                    if (nb_last_games > 0):
                        agressivity = min(100, nb_points_put * 20 / nb_last_games)
                    else:
                        agressivity = 0
                    
                    if vs1 > 0:
                        vs1ratio = winvs1 / vs1 * 100
                    else:
                        vs1ratio = 0
                        
                    if vs1P > 0:
                        vs1Pratio = winvs1P / vs1P * 100
                    else:
                        vs1Pratio = 0
                        
                    if vs2 > 0:
                        vs2ratio = winvs2 / vs2 * 100
                    else:
                        vs2ratio = 0
        
                    if vs2P > 0:
                        vs2Pratio = winvs2P / vs2P * 100
                    else:
                        vs2Pratio = 0
                        
                    if nb_last_games > 0:
                        overallratio = win / nb_last_games * 100
                    else:
                        overallratio = 0
                    
                    user_data = {
                        'user_id': user.user_id,
                        'pseudo': user.pseudo,
                        'picture': str(user.picture),
                        'level': user.user_level,
                        'victory_ratio_list': victory_ratio_list,
                        'capybara': capybara,
                        'defender': round(defender),
                        'waste': waste,
                        'masochist': round(masochist),
                        'drugged': round(drugged),
                        'agressivity': round(agressivity),
                        'vs1': round(vs1ratio),
                        'vs1P': round(vs1Pratio),
                        'vs2': round(vs2ratio),
                        'vs2P': round(vs2Pratio),
                        'overall': round(overallratio)
                    }
                    if 'user_id' not in user_data:
                        raise Exception('error in the user')
                    if not user_data['picture'].startswith('https://'):
                        if user_data['picture'].startswith('/'):
                            user_data['picture'] = base_url + user_data['picture']
                        else:
                            user_data['picture'] = base_urls + user_data['picture']
                    response_data = {'success': True, 'message': 'Here the info', 'profil': user_data}
                    return JsonResponse(response_data, status=200)
                except ValueError as e:
                    response_data = {'success': False, 'message': str(e)}
                    return JsonResponse(response_data, status=202)
                except Exception as e:
                    response_data = {'success': False, 'message': 'error occured : ' + str(e)}
                    return JsonResponse(response_data, status=202)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def postPic(request):
    if request.method == 'POST':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                u_id = payload.get('user_id')
                data = json.loads(request.body)
                form = postPicForm(data)
                if not form.is_valid():
                    response_data = {'success': False, 'message': 'Invalid Data'}
                    return JsonResponse(response_data, status=202)

                user = User.objects.get(user_id=u_id)
                random_num = random.randint(1, 100)
                image_data = form.cleaned_data['newPic'].split(';base64,')[1]
                image_data_binary = base64.b64decode(image_data)
                image_type = imghdr.what(None, image_data_binary)
                allowed_extensions = ['jpg', 'jpeg', 'png', 'gif']
                if image_type not in allowed_extensions:
                    raise Exception('Img type not valid')
                image_file = ContentFile(image_data_binary, name=f"{u_id}.{image_type}")
                file_name = f"{u_id}_{random_num}.{image_type}"
                user.picture.save(file_name, image_file, save=True)

                response_data = {'success': True, 'messagpostInfosFormage': 'gg'}
                return JsonResponse(response_data, status=200)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
            except Exception as e:
                response_data = {'success': False, 'message': str(e)}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def postInfos(request):
    if request.method == 'POST':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                u_id = payload.get('user_id')
                data = json.loads(request.body)
                form = postInfosForm(data)
                if not form.is_valid():
                    response_data = {'success': False, 'message': 'Invalid Data'}
                    return JsonResponse(response_data, status=202)

                user = User.objects.get(user_id=u_id)

                user.pseudo = form.cleaned_data['newPseudo']
                user.user_description = form.cleaned_data['newDesc']
                user.save()

                response_data = {'success': True, 'message': 'Pseudo modified'}
                return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
            except Exception as e:
                response_data = {'success': False, 'message': str(e)}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def get_user_chat_profil(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = userOnlyForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        user_to_check = form.cleaned_data['user']
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                return get_chat_profil_of_user(user_to_check, user_id, request)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def get_chat_profil_of_user(user_to_search_id, me_id, request):
    try:
        address = request.get_host()
        port = os.environ.get('PORT_NGINX_HOST')
        base_url = 'https://' + address + ':' + port + '/api/social/images'
        base_urls = 'https://' + address + ':' + port + '/api/social/images/'
        user = User.objects.get(user_id=user_to_search_id)
        isOnline = (user.socket_id != '' and user.socket_id != 'test')
        contact_tab = Contact.objects.filter(users=user)
        isFriend = False
        for contact in contact_tab:
            if contact.friend.count() == 2:
                contact_users = contact.users.all()
                for ct in contact_users:
                    if ct != user and ct.user_id == me_id:
                        isFriend = True
                        break
                if isFriend != False:
                    break
        isBlocked = False
        for contact in contact_tab:
            if contact.blocked.count() > 0:
                contact_users = contact.blocked.all()
                for ct in contact_users:
                    if ct.user_id == me_id:
                        isBlocked = True
                        break
                if isBlocked != False:
                    break
        user_data = {
            'user_id': user.user_id,
            'pseudo': user.pseudo,
            'picture': str(user.picture),
            'isFriend': isFriend,
            'isBlocked': isBlocked,
        }
        if 'user_id' not in user_data:
            raise Exception('error in the user')
        if not user_data['picture'].startswith('https://'):
            if user_data['picture'].startswith('/'):
                user_data['picture'] = base_url + user_data['picture']
            else:
                user_data['picture'] = base_urls + user_data['picture']
        response_data = {'success': True, 'message': 'Here the info', 'profil': user_data}
        return JsonResponse(response_data, status=200)
    except ValueError as e:
        response_data = {'success': False, 'message': str(e)}
        return JsonResponse(response_data, status=202)
    except Exception as e:
        response_data = {'success': False, 'message': 'error occured : ' + str(e)}
        return JsonResponse(response_data, status=202)

def get_left_contact(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')
                user = User.objects.get(user_id=user_id)
                contact_tab = Contact.objects.filter(users=user).order_by('last_interract')
                user_list = list()
                for contact in contact_tab:
                    bloqued = contact.blocked.all()
                    ct = False
                    for blocked in bloqued:
                        if (blocked.user_id == user_id):
                            ct = True
                    if ct == True:
                        continue
                    if contact.last_interract != None:
                        contact_users = contact.users.all()
                        other_user = None
                        for contact_user in contact_users:
                            if contact_user != user:
                                other_user = contact_user
                        if other_user is not None:
                            user_list.append({'user_id': other_user.user_id, 'pseudo': other_user.pseudo, 'picture': str(other_user.picture)})
                address = request.get_host()
                port = os.environ.get('PORT_NGINX_HOST')
                base_url = 'https://' + address + ':' + port + '/api/social/images'
                base_urls = 'https://' + address + ':' + port + '/api/social/images/'
                filtered_user_list = []
                for user in user_list:
                    if not user['picture'].startswith('https://'):
                        if user['picture'].startswith('/'):
                            user['picture'] = base_url + user['picture']
                        else:
                            user['picture'] = base_urls + user['picture']
                    filtered_user_list.append(user)
                    if len(filtered_user_list) >= 20:
                        break
                response_data = {'success': True, 'message': 'here the response', 'List': filtered_user_list}
                return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def get_a2f_status(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                user = User.objects.get(user_id=user_id)

                a2f_status = user.a2f_status
                response_data = {'success': True, 'a2f_status': a2f_status}
                return JsonResponse(response_data , status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def a2f_generate_key(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                user = User.objects.get(user_id=user_id)

                if user.a2f_status == False:
                    user.otp_secret = base64.b32encode(os.urandom(10)).decode('utf-8')
                    user.save()

                    uri = pyotp.totp.TOTP(user.otp_secret).provisioning_uri(name=user.user_id, issuer_name="ft_transcendance")
                    img = qrcode.make(uri)

                    buffered = BytesIO()
                    img.save(buffered, format="PNG")
                    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

                    response_data = {'success': True, 'otp_secret': user.otp_secret, 'qr_code': img_str}
                    return JsonResponse(response_data , status=200)
                else:
                    response_data = {'success': False, 'message': "Can't generate key"}
                    return JsonResponse(response_data , status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def a2f_active(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = toggleA2fForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        code = form.cleaned_data['code']
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')
                user = User.objects.get(user_id=user_id)

                if user.a2f_status == False:
                    totp = pyotp.TOTP(user.otp_secret)
                    is_correct = totp.verify(code)

                    if (is_correct):
                        user.a2f_status = True
                        user.save()
                    response_data = {'success': True, 'is_correct': is_correct}
                    return JsonResponse(response_data , status=200)
                else:
                    response_data = {'success': False, 'message': 'a2f déjà actif'}
                    return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def a2f_desactive(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = toggleA2fForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        code = form.cleaned_data['code']
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')
                user = User.objects.get(user_id=user_id)

                if user.a2f_status == True:

                    totp = pyotp.TOTP(user.otp_secret)
                    is_correct = totp.verify(code)
                    if (is_correct):
                        user.a2f_status = False
                        user.save()
                    response_data = {'success': True, 'is_correct': is_correct}
                    return JsonResponse(response_data , status=200)
                else:
                    response_data = {'success': False, 'message': 'A2F already not in use'}
                    return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def create_group_form(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = request.COOKIES.get('auth')
        if token:
            try:
                form = createGroupForm(data)
                if not form.is_valid():
                    response_data = {'success': False, 'message': 'Invalid Data'}
                    return JsonResponse(response_data, status=202)
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id_me = payload.get('user_id')
                userMe = User.objects.get(user_id=user_id_me)
                members = form.cleaned_data['members']
                groupName = form.cleaned_data['groupName']
                memberList = []

                for userId in members:
                    user = User.objects.get(user_id=userId)
                    memberList.append(user)
                try:

                    group = GroupChat.objects.create()
                    group.users.set(memberList)
                    group.name = groupName
                    group.admins.set([userMe])
                    group.last_interract = timezone.now()

                    # random_num = random.randint(1, 1000)
                    # image_data = form.cleaned_data['picture'].split(';base64,')[1]
                    # image_file = ContentFile(base64.b64decode(image_data), name=groupName + '.jpg')
                    # group.groupImg.save(groupName+str(random_num)+'.jpg', image_file, save=True)

                    # générer un nombre aléatoire entre 1 et 1000
                    random_num = random.randint(1, 1000)

                    # extraire les données d'image de form.cleaned_data['picture']
                    image_data = form.cleaned_data['picture'].split(';base64,')[1]

                    # décoder les données d'image en format binaire
                    image_data_binary = base64.b64decode(image_data)

                    # déterminer le type d'image à partir des données binaires
                    image_type = imghdr.what(None, image_data_binary)

                    # créer un objet ContentFile à partir des données d'image binaires
                    image_file = ContentFile(image_data_binary, name=f"{groupName}.{image_type}")

                    # générer un nom de fichier unique en utilisant groupName, random_num et l'extension d'image
                    file_name = f"{groupName}_{random_num}.{image_type}"

                    # enregistrer l'image dans le champ groupImg de l'objet group
                    group.groupImg.save(file_name, image_file, save=True)

                    group.save()
                except GroupChat.DoesNotExist:
                    response_data = {'success': False, 'error': 'Group doesn\'t exist'}
                    return JsonResponse(response_data, status=202)

                response_data = {'success': True, 'contact': 'ok'}
                return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def get_left_group(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')
                user = User.objects.get(user_id=user_id)
                group_tab = GroupChat.objects.filter(users=user).order_by('last_interract')
                group_list = list()
                for group in group_tab:
                    if group.last_interract != None:
                        group_list.append({'group_id': str(group.groupId), 'group_name': group.name, 'picture': str(group.groupImg)})
                address = request.get_host()
                port = os.environ.get('PORT_NGINX_HOST')
                base_url = 'https://' + address + ':' + port + '/api/social/images'
                base_urls = 'https://' + address + ':' + port + '/api/social/images/'
                filtered_group_list = []
                for group in group_list:
                    if not group['picture'].startswith('https://'):
                        if group['picture'].startswith('/'):
                            group['picture'] = base_url + group['picture']
                        else:
                            group['picture'] = base_urls + group['picture']
                    filtered_group_list.append(group)
                    if len(filtered_group_list) >= 20:
                        break
                response_data = {'success': True, 'message': 'here the response', 'List': filtered_group_list}
                return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def get_group_chat_profil(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = getGroupChatForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        group_to_check = form.cleaned_data['group']
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                return get_chat_profil_of_group(group_to_check, user_id, request)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def get_chat_profil_of_group(group_to_search_id, me_id, request):
    try:
        address = request.get_host()

        group = GroupChat.objects.get(groupId=group_to_search_id)
        imgGroup = str(group.groupImg)
        groupUsers = group.users.all()
        groupAdmins = group.admins.all()
        hasPower = me_id in [admin.user_id for admin in groupAdmins]
        groupSize = len(groupUsers)
        response_data = {
            'success': True, 
            'message': 'Here the info', 
            'groupImg': getGoodImageUrl(imgGroup, address), 
            'groupName': group.name,
            'groupMemberNumber': groupSize, 
            'members': [
                {
                    'user_id': user.user_id, 
                    'pseudo': user.pseudo, 
                    'picture': getGoodImageUrl(str(user.picture), address), 
                    'hasPower': (user.user_id != me_id) and (hasPower),
                } for user in groupUsers
            ],
            'isAdmin': hasPower
        }
        return JsonResponse(response_data, status=200)
    except ValueError as e:
        response_data = {'success': False, 'message': str(e)}
        return JsonResponse(response_data, status=202)
    except Exception as e:
        response_data = {'success': False, 'message': 'error occured : ' + str(e)}
        return JsonResponse(response_data, status=202)


def get_groups_messages(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')
                group_id = request.GET.get('group_id')
                address = request.get_host()

                group = GroupChat.objects.get(groupId=group_id)
                messages = GroupMessage.objects.filter(chat=group)
                
                messages_data = [{'sender': message.sender.user_id, 'message': message.message, 'created_at': message.created_at, 'messPic': getGoodImageUrl(str(message.sender.picture), address)} for message in messages]

                response_data = {'success': True, 'messages': messages_data}
                return JsonResponse(response_data , status=200)
            except Contact.DoesNotExist:
                response_data = {'success': False, 'error': 'Chat doesn\'t exist'}
                return JsonResponse(response_data, status=202)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def add_user_group(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = request.COOKIES.get('auth')
        if token:
            try:
                form = addUserGroupForm(data)
                if not form.is_valid():
                    response_data = {'success': False, 'message': 'Invalid Data'}
                    return JsonResponse(response_data, status=202)
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                user_added_id = form.cleaned_data['user_added_id']
                groupId = form.cleaned_data['groupId']

                group = GroupChat.objects.get(groupId=groupId)
                userAdded = User.objects.get(user_id=user_added_id)
                group.users.add(userAdded)

                group.save()

                return get_chat_profil_of_group(groupId, user_id, request)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def remove_user_group(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = request.COOKIES.get('auth')
        if token:
            try:
                form = remUserGroupForm(data)
                if not form.is_valid():
                    response_data = {'success': False, 'message': 'Invalid Data'}
                    return JsonResponse(response_data, status=202)
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                user_remove_id = form.cleaned_data['user_remove_id']
                groupId = form.cleaned_data['groupId']

                group = GroupChat.objects.get(groupId=groupId)
                userAdded = User.objects.get(user_id=user_remove_id)
                group.users.remove(userAdded)

                group.save()

                return get_chat_profil_of_group(groupId, user_id, request)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)


def getGoodImageUrl(urlBase, address):
    port = os.environ.get('PORT_NGINX_HOST')
    base_url = 'https://' + address + ':' + port + '/api/social/images'
    base_urls = 'https://' + address + ':' + port + '/api/social/images/'
    if not urlBase.startswith('https://'):
        if urlBase.startswith('/'):
            urlBase = base_url + urlBase
        else:
            urlBase = base_urls + urlBase
    return urlBase

def send_user_history_list(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = request.COOKIES.get('auth')
        if token:
            try:
                form = sendUserHistForm(data)
                if not form.is_valid():
                    response_data = {'success': False, 'message': 'Invalid Data'}
                    return JsonResponse(response_data, status=202)
                user_id_to_check = form.cleaned_data["user_id_to_check"]
                nb_history_request = form.cleaned_data["nb_history_request"]
                i_begin_history = form.cleaned_data["i_begin_history"]
                
                user_to_check = User.objects.get(user_id=user_id_to_check)
                
                if not user_to_check:
                    response_data = {'success': False, 'message': 'Incorrect user_id'}
                    return JsonResponse(response_data, status=202)
                
                tab_table = PongGame.objects.filter(players=user_to_check).filter(status="ended").order_by('-created_at')
                tab_parse_table = []
                
                is_history_list_finished = False
                for i in range(i_begin_history, i_begin_history + nb_history_request):
                    if len(tab_table) <= i:
                        is_history_list_finished = True
                        break
                    table = {"is_win": (True if tab_table[i].winner.filter(user_id=user_to_check.user_id).exists() else False), \
                            "game_mode": tab_table[i].mode, \
                            "date": tab_table[i].created_at, \
                            "j1": get_substring(tab_table[i].j1), \
                            "j2": get_substring(tab_table[i].j2), \
                            "j3": get_substring(tab_table[i].j3), \
                            "j4": get_substring(tab_table[i].j4), \
                            "winner_score": tab_table[i].winner_score, \
                            "loser_score": tab_table[i].loser_score, \
                            "game_id": tab_table[i].pk}
                    tab_parse_table.append(table)
                
                if is_history_list_finished == False and len(tab_table) <= i + 1:
                    is_history_list_finished = True

                response_data = {'success': True, \
                                'message': f'History list from {i_begin_history} to {i_begin_history + nb_history_request} send', \
                                'table_tab': tab_parse_table, \
                                'is_history_list_finished': is_history_list_finished}
                return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)
    
def game_history(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = request.COOKIES.get('auth')
        if token:
            try:
                form = gameHistoryForm(data)
                if not form.is_valid():
                    response_data = {'success': False, 'message': 'Invalid Data'}
                    return JsonResponse(response_data, status=202)
                game_id = form.cleaned_data["game_id"]
                table = PongGame.objects.filter(pk=game_id).first()
                
                if table and table.status == "ended":
                    response_data = {
                        'success': True,
                        'message': f"Returning Game {id} History",
                        'winner_score': table.winner_score,
                        'loser_score': table.loser_score,
                        'winner_powerups_activated': table.winner_powerups_activated,
                        'loser_powerups_activated': table.loser_powerups_activated,
                        'winner_bonus_activated': table.winner_bonus_activated,
                        'loser_bonus_activated': table.loser_bonus_activated,
                        'winner_malus_activated': table.winner_malus_activated,
                        'loser_malus_activated': table.loser_malus_activated,
                        'winner_highest_points_streak': table.winner_highest_points_streak,
                        'loser_highest_points_streak': table.loser_highest_points_streak,
                        'created_at': table.created_at,
                        'game_duration': table.game_duration,
                        'total_balls_hits': table.total_balls_hits,
                        'highest_balls_hits_streak': table.highest_balls_hits_streak,
                        'highest_balls_speed': table.highest_balls_speed,
                        'total_powerups_activated': table.total_powerups_activated,
                        'total_freeze_powerups_activated': table.total_freeze_powerups_activated,
                        'total_slow_powerups_activated': table.total_slow_powerups_activated,
                        'total_speed_powerups_activated': table.total_speed_powerups_activated,
                        'total_racket_reduction_powerups_activated': table.total_racket_reduction_powerups_activated,
                        'total_racket_increase_powerups_activated' : table.total_racket_increase_powerups_activated,
                        'total_multi_balls_powerups_activated': table.total_multi_ball_powerups_activated,
                        'point_time_time' : table.point_time_time,
                        'point_time_left' : table.point_time_left,
                        'point_time_right' : table.point_time_right,
                    }
                    if table.winner.filter(user_id=table.j1).exists():
                        if (table.j3 != "none"):
                            response_data.update({
                                'winner': get_substring(table.j1),
                                'winner2': get_substring(table.j2),
                                'loser': get_substring(table.j3),
                                'loser2': get_substring(table.j4),
                            })
                        else:
                            response_data.update({
                                'winner': get_substring(table.j1),
                                'loser': get_substring(table.j2),
                            })
                    else:
                        if (table.j3 != "none"):
                            response_data.update({
                                'winner': get_substring(table.j3),
                                'winner2': get_substring(table.j4),
                                'loser': get_substring(table.j1),
                                'loser2': get_substring(table.j2),
                            })
                        else:
                            response_data.update({
                                'winner': get_substring(table.j2),
                                'loser': get_substring(table.j1),
                            })
                    return JsonResponse(response_data, status=200)
                else:
                    response_data = {'success': False, 'message': 'Incorrect game ID'}
                    return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def get_substring(input_string):
    if len(input_string) > 0 and input_string[0] == '$':
        return input_string[1:]
    else:
        return input_string