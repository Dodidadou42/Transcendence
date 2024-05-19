from django.shortcuts import render
from django.http import JsonResponse, HttpResponse

from .forms import UserCreationForm, UserConnectionForm, User42InfoForm, ForgotPasswordForm, ChangePasswordForm, sign42Form, RecoverCodeForm, EditPasswordForm, BPassa2fForm, IsConnectCodeForm
from .models import User, PongGame, Tournament, GroupChat, Contact
from django.db.models import Count

from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.middleware.csrf import get_token

from django.contrib.sessions.models import Session
from asgiref.sync import sync_to_async

from django.utils import timezone
from django.core.mail import send_mail

import hashlib
import json
import os
import jwt
import httpx
import string
import asyncio

import pyotp

import secrets
import re

from datetime import datetime

from .websocket.game.global_data import getData

from django.core.files.base import ContentFile
import base64
import random

# Exception pour le code d'api 42
class CodeError(Exception):
    pass

@sync_to_async
def get_user_by_id(u_id):
    return User.objects.filter(user_id=u_id).first()

@sync_to_async
def get_user_by_email(email):
    return User.objects.filter(email=email).first()

@sync_to_async
def create_user_async(user_id,pseudo,email,password_hash,is_42,picture):
    return User.objects.create(
        user_id=user_id,
        pseudo=pseudo,
        email=email,
        password_hash=password_hash,
        is_42=is_42,
        picture=picture
    )

# Create your views here.

@ensure_csrf_cookie
def get_csrf_token(request):
    """
    View to get and set the CSRF token in the cookies.
    """
    try:
        csrf_token = get_token(request)
        response_data = {'success': True, 'csrf_token': csrf_token}
        return JsonResponse(response_data)
    except Exception as e:
        response_data = {'success': False, 'message': str(e)}
        return JsonResponse(response_data)

def create_user(request):
    if request.method == 'POST':

        data = json.loads(request.body)
        form = UserCreationForm(data)

        if form.is_valid():

            # Check email sinon crash !
            user_id = form.cleaned_data['user_id']
            pseudo = user_id
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            if (len(password) <= 6):
                response_data = {'success': False, 'message': 'Password is too short'}
                return JsonResponse(response_data, status=200)
            if (re.search(r'[A-Z]', password) is None):
                response_data = {'success': False, 'message': 'Password requires at least 1 uppercase letter'}
                return JsonResponse(response_data, status=200)
            if (re.search(r'[a-z]', password) is None):
                response_data = {'success': False, 'message': 'Password requires at least 1 lowercase letter'}
                return JsonResponse(response_data, status=200)
            if (len(re.findall(r'\d', password)) < 2):
                response_data = {'success': False, 'message': 'Password requires at least 2 digits'}
                return JsonResponse(response_data, status=200)

            is_42 = False
            picture = "/default_media/default_user.jpg"

            password_hash = hashlib.sha256(password.encode()).hexdigest()

            try:
                if (parseUserIdBeforeCreateUser(user_id) == False):
                    raise Exception('User Id not authorized')
                user = User.objects.create(
                    user_id=user_id,
                    pseudo=pseudo,
                    email=email,
                    password_hash=password_hash,
                    is_42=is_42,
                    picture=picture
                )
            except Exception as e:
                if "Key (user_id)" in str(e):
                    response_data = {'success': False, 'message': "Pseudo already in use"}
                elif "Key (email)" in str(e):
                    response_data = {'success': False, 'message': "Email already in use"}
                else:
                    response_data = {'success': False, 'message': str(e)}
                return JsonResponse(response_data, status=201)

            response_data = {'success': True, 'message': 'User succesfully created'}
            return JsonResponse(response_data, status=201)
        else:
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def parseUserIdBeforeCreateUser(Uid):
    if (Uid == 'none'):
        return False
    if (Uid == None):
        return False
    regex = re.compile('^[\x00-\x7F]*$')  # Plage de caractères Unicode pour Latin Basic (0000 - 007F)

    if not regex.match(Uid):
        return False
     # Créer un objet de traduction qui supprime tous les caractères spéciaux
    table = str.maketrans("", "", string.punctuation)
    # Supprimer les caractères spéciaux de la chaîne
    raw_Uid = Uid.translate(table)
    if (Uid != raw_Uid):
        return False
    return True

def login_user(request):
    if request.method == 'POST':

        data = json.loads(request.body)
        form = UserConnectionForm(data)

        is_a2f = data['is_a2f']
        if is_a2f:
            a2f_code = data['a2f_code']

        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            weekly = form.cleaned_data['week']

            user = User.objects.filter(email=email).first()

            if (user is not None):

                password_hash = hashlib.sha256(password.encode()).hexdigest()
                stored_password_hash = user.password_hash

                if password_hash == stored_password_hash:
                    
                    if not user.a2f_status:
                        response_data = {'success': True, 'message': 'User succesfully connected', 'a2f_status': user.a2f_status}
                        if weekly is True:
                            maxAge = 604800
                        else:
                            maxAge = 21600

                        payload = {'user_id': user.user_id}
                        token = jwt.encode(payload, os.environ.get('JWT_SECRET'), algorithm='HS256')
                        response = HttpResponse(json.dumps(response_data), status=200, content_type='application/json')
                        response.set_cookie('auth', token, max_age=maxAge, samesite='None', secure=True, httponly=True, path='/')
                        return response
                    else:
                        if not is_a2f:
                            response_data = {'success': True, 'message': 'A2F is necessary to connect', 'a2f_status': user.a2f_status}
                            response = HttpResponse(json.dumps(response_data), status=200, content_type='application/json')
                            return response
                        else:
                            totp = pyotp.TOTP(user.otp_secret)
                            is_correct = totp.verify(a2f_code)
                            
                            if is_correct:
                                response_data = {'success': True, 'message': 'User succesfully connected'}
                                if weekly is True:
                                    maxAge = 604800
                                else:
                                    maxAge = 21600

                                payload = {'user_id': user.user_id}
                                token = jwt.encode(payload, os.environ.get('JWT_SECRET'), algorithm='HS256')
                                response = HttpResponse(json.dumps(response_data), status=200, content_type='application/json')
                                response.set_cookie('auth', token, max_age=maxAge, samesite='None', secure=True, httponly=True, path='/')
                                return response
                            else:
                                response_data = {'success': False, 'message': 'Incorrect A2F code'}
                                return JsonResponse(response_data, status=202)
                else:
                    response_data = {'success': False, 'message': 'Incorrect password'}
                    return JsonResponse(response_data, status=202)
            else:
                response_data = {'success': False, 'message': 'Incorrect ID'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def disconnect_user(request):
    if request.method == 'GET':
        cookie_auth = request.COOKIES.get('auth')
        if (cookie_auth):
            payload = jwt.decode(cookie_auth, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
            u_id = payload.get('user_id')
            user = User.objects.filter(user_id=u_id).first()
            if (user):
                response_data = {'success': True, 'message': 'User succesfully disconnected'}
                response = HttpResponse(json.dumps(response_data), status=200, content_type='application/json')
                response.set_cookie('auth', '', expires='Thu, 01 Jan 1970 00:00:00 GMT', max_age=0, samesite='None', secure=True, httponly=True, path='/')
                return response
            else:
                response_data = {'success': False, 'message': 'User offline'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'User offline'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def delete_account(request):
    if request.method == 'GET':

        cookie_auth = request.COOKIES.get('auth')
        if (cookie_auth):
            payload = jwt.decode(cookie_auth, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
            u_id = payload.get('user_id')
            user = User.objects.filter(user_id=u_id).first()
            
            if (user):
                
                if PongGame.objects.exclude(status="ended").filter(players=user).exists() or \
                    Tournament.objects.exclude(status="ended").filter(players=user).exists():
                
                    response_data = {'success': False, 'message': 'Deletion impossible because user is in game or tournament'}
                    response = HttpResponse(json.dumps(response_data), status=200, content_type='application/json')
                    
                else:

                    response_data = {'success': True, 'message': 'User succesfully disconnected'}
                    response = HttpResponse(json.dumps(response_data), status=200, content_type='application/json')
                    response.set_cookie('auth', '', expires='Thu, 01 Jan 1970 00:00:00 GMT', max_age=0, samesite='None', secure=True, httponly=True, path='/')
                    handleContactChatDeleteAccount(user)
                    handleGroupChatDeleteAccount(user)
                    handlePongGameDeleteAccount(user)
                    handleTournamentDeleteAccount(user)
                    user.delete()
                    delEmptyEntities()

                return response
            else:
                response_data = {'success': False, 'message': 'User offline'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'User offline'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def delEmptyEntities():
    try :
        empty_games = PongGame.objects.filter(players__isnull=True)
        for game in empty_games:
            game.delete()
    except Exception as e:
        print(e)
    try :
        empty_tournament = Tournament.objects.filter(players__isnull=True)
        for game in empty_tournament:
            game.delete()
    except Exception as e:
        print(e)
    try :
        empty_contact = Contact.objects.filter(users__isnull=True)
        for contact in empty_contact:
            contact.delete()
    except Exception as e:
        print(e)

def handlePongGameDeleteAccount(userMe):
    try :
        tables = PongGame.objects.filter(status="in_queue").filter(players=userMe)
        for table in tables:
            table.delete()
    except Exception as e:
        print(e)

def handleTournamentDeleteAccount(userMe):
    try :
        tournaments = Tournament.objects.filter(status="in_queue").filter(players=userMe)
        for tournament in tournaments:
            tournament.delete()
        tournaments = Tournament.objects.filter(status="none").filter(players=userMe)
        for tournament in tournaments:
            tournament.delete()
    except Exception as e:
        print(e)

def handleContactChatDeleteAccount(userMe):
    try :
        contacts = Contact.objects.filter(users=userMe)
        for contact in contacts:
            contact.delete()
    except Exception as e:
        print(e)

def handleGroupChatDeleteAccount(userMe):
    try :
        groups = GroupChat.objects.filter(admins=userMe)
        for group in groups:
            group.admins.remove(userMe)
            group_users = group.users.all()
            if (group_users.count() < 2):
                group.delete()
            elif (group_users[0] != userMe):
                group.admins.add(group_users[0])
            else:
                group.admins.add(group_users[1])
    except Exception as e:
        print(e)


def is_login(request):
    if request.method == 'GET':

        cookie_auth = request.COOKIES.get('auth')
        if (cookie_auth):
            payload = jwt.decode(cookie_auth, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
            u_id = payload.get('user_id')
            user = User.objects.filter(user_id=u_id).first()
            if (user is not None):
                response_data = {'success': True, 'message': ""}
                return JsonResponse(response_data, status=200)
            else:
                response_data = {'success': False, 'message': 'User offline'}
                return JsonResponse(response_data, status=200)
        else:
            response_data = {'success': False, 'message': 'User offline'}
            return JsonResponse(response_data, status=200)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def get_42_uri(request):
    if request.method == 'GET':
        response_data = {'success': True, 'link': os.environ.get('42API_URI')}
        return JsonResponse(response_data, status=200)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

async def SignInWith42(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = sign42Form(data)
            if not form.is_valid():
                response_data = {'success': False, 'message': 'Invalid Data'}
                return JsonResponse(response_data, status=202)
            data = await Get42UserInfo(form.cleaned_data['code'], request)
            response = await Signin42(data)
            return response
        except CodeError as e:
            response_data = {'success': False, 'message': str(e)}
            return JsonResponse(response_data, status=202)
        except Exception as e:
            response_data = {'success': False, 'message': 'error occured : ' + str(e)}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

# Fonction pour faire les appel a l'api 42 en asynchrone avec httpx
# (pas obligatoire de l'utiliser mais ca m'as simplifier la logique)
async def Request_42(url, params, headers, method):
    async with httpx.AsyncClient() as client:
        if (method == 'post'):
            response = await client.post(url, params=params, headers=headers)
        else:
            response = await client.get(url, headers=headers)
        response_data = response.json()
        return response_data

async def Get42UserInfo(code, request):
    if (code is None):
        raise CodeError("Code is Undefined")
    try:
        address = request.get_host()
        port = os.environ.get('PORT_NGINX_HOST')
        data = await Request_42('https://api.intra.42.fr/oauth/token', {
            'grant_type': 'authorization_code',
            'client_id': os.environ.get('42_CLIENT_ID'),
            'client_secret': os.environ.get('42_CLIENT_SECRET'),
            'code': code,
            'redirect_uri': "https://" + address + ":" + port + "/fourty-two-link/"
        }, {}, 'post')
    except Exception as e:
        raise Exception("error while requesting the token")
    try:
        bearer = 'Bearer ' + data['access_token']
        data = await Request_42('https://api.intra.42.fr/v2/me', {},{
            'Authorization': bearer
        }, 'get')
    except Exception as e:
        raise Exception("error while requesting the info")
    return data

async def Signin42(UserData):

    form = User42InfoForm(UserData)
    u_image = UserData['image']['versions']['large']

    
    if form.is_valid():
        u_id = form.cleaned_data['login']
        email = form.cleaned_data['email']
        u_id += '𝟜𝟚'

        user = await get_user_by_email(email)
        if (user is not None):
            response_data = {'success': True, 'message': 'User succesfully connected'}
            maxAge = 604800

            payload = {'user_id': user.user_id}
            token = jwt.encode(payload, os.environ.get('JWT_SECRET'), algorithm='HS256')
            response = HttpResponse(json.dumps(response_data), status=200, content_type='application/json')
            response.set_cookie('auth', token, max_age=maxAge, samesite='None', secure=True, httponly=True, path='/')

            return response
        else:
            # Need to create a user

            pseudo = u_id
            password = 'none'
            is_42 = True
            picture = u_image

            password_hash = hashlib.sha256(password.encode()).hexdigest()
            try:
                # Il y a une fonction a part car on ne peux pas faire d'appel a la DB
                # dans une fonction asynchrone c'est pour ca qi'il y a la balise
                # @sync_to_async sur les fonctions au top du fichier
                newUser = await create_user_async(
                    u_id,
                    pseudo,
                    email,
                    password_hash,
                    is_42,
                    picture
                )

                #newUser.picture.save(u_id+str(random_num)+'.jpg', image_file, save=True)

                response_data = {'success': True, 'message': 'User succesfully created and connected'}
                maxAge = 604800

                payload = {'user_id': newUser.user_id}
                token = jwt.encode(payload, os.environ.get('JWT_SECRET'), algorithm='HS256')
                response = HttpResponse(json.dumps(response_data), status=200, content_type='application/json')
                response.set_cookie('auth', token, max_age=maxAge, samesite='None', secure=True, httponly=True, path='/')

                return response

            except Exception as e:
                if "Key (user_id)" in str(e):
                    response_data = {'success': False, 'message': "Pseudo is taken"}
                elif "Key (email)" in str(e):
                    response_data = {'success': False, 'message': "Email already in use"}
                else:
                    response_data = {'success': False, 'message': str(e)}
                return JsonResponse(response_data, status=202)

    else:
        response_data = {'success': False, 'message': 'Invalid Data'}
        return JsonResponse(response_data, status=202)

def forgot_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = ForgotPasswordForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        email = form.cleaned_data['email']
        user = User.objects.filter(email=email).filter(is_42=False).first()

        if (user is not None):

            user.recovery_mail_date = timezone.now()
            user.recovery_mail_code = str(secrets.randbelow(900000) + 100000)
            user.save()

            subject = user.recovery_mail_code + " is your recovery code for your ft_transcendance account"
            message = f'Hello,\n\nYou have requested a password reset.\n\nYour recovery code is: {user.recovery_mail_code}\n\nThis code is valid for a limited time. Please use it as soon as possible to reset your password.\n\nBest regards,\n[ft_transcendance]'
            from_email = 'ft_transcendance <ft.transcendance.42nice@gmail.com>'
            recipient_list = [email]

            send_mail(subject, message, from_email, recipient_list)
            response_data = {'success': True, 'message': 'Recovery code has been sent'}
            return JsonResponse(response_data , status=200)
        else:
            response_data = {'success': False, 'message': 'Incorrect ID'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def is_recover_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = RecoverCodeForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        email = form.cleaned_data['email']
        code = form.cleaned_data['recovery_code']
        user = User.objects.filter(email=email).first()

        if (user is not None):

            time_difference = (user.recovery_mail_date - timezone.now()).total_seconds()
            if (time_difference <= 300):
                
                if (str(user.recovery_mail_code) == str(code)):

                    user.recovery_mail_date = datetime(1970, 1, 1, 0, 0)
                    user.save()
                    
                    response_data = {'success': True, 'message': 'Recovery code is correct'}
                    return JsonResponse(response_data , status=200)

                else:
                    response_data = {'success': False, 'message': 'Incorrect recovery code'}
                    return JsonResponse(response_data, status=202)
            else:
                response_data = {'success': False, 'message': 'Recovery code expired'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Incorrect ID'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def change_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = ChangePasswordForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        email = form.cleaned_data['email']
        password = form.cleaned_data['password']
        code = form.cleaned_data['recovery_code']
        
        user = User.objects.filter(email=email).filter(is_42=False).first()

        if (user is not None):

            time_difference = (user.recovery_mail_date - timezone.now()).total_seconds()
            if (time_difference <= 300):
                
                if (str(user.recovery_mail_code) == str(code)):
                    if (len(password) <= 6):
                        response_data = {'success': False, 'message': 'Password is too short'}
                        return JsonResponse(response_data, status=200)
                    if (re.search(r'[A-Z]', password) is None):
                        response_data = {'success': False, 'message': 'Password requires at least 1 uppercase letter'}
                        return JsonResponse(response_data, status=200)
                    if (re.search(r'[a-z]', password) is None):
                        response_data = {'success': False, 'message': 'Password requires at least 1 lowercase letter'}
                        return JsonResponse(response_data, status=200)
                    if (len(re.findall(r'\d', password)) < 2):
                        response_data = {'success': False, 'message': 'Password requires at least 2 digits'}
                        return JsonResponse(response_data, status=200)
                    
                    if (len(password) < 256):
                        password_hash = hashlib.sha256(password.encode()).hexdigest()
                        user.password_hash = password_hash
                        user.save()
                        response_data = {'success': True, 'message': 'Password succesfully changed'}
                        return JsonResponse(response_data , status=200)
                    else:
                        response_data = {'success': False, 'message': 'Invalid Password'}
                        return JsonResponse(response_data, status=202)
                else:
                    response_data = {'success': False, 'message': 'Incorrect recovery code'}
                    return JsonResponse(response_data, status=202)
            else:
                response_data = {'success': False, 'message': 'Recovery code expired'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Incorrect ID'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def edit_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = EditPasswordForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        password = form.cleaned_data['password']
        new_password = form.cleaned_data['new_password']

        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')
        
                user = User.objects.get(user_id=user_id)

                if (user is not None):
                    if (len(new_password) < 256):
                        password_hash = hashlib.sha256(password.encode()).hexdigest()
                        new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()

                        if (password_hash != user.password_hash):
                            response_data = {'success': False, 'message': 'Invalid Password'}
                            return JsonResponse(response_data, status=200)
                        if (len(new_password) <= 6):
                            response_data = {'success': False, 'message': 'New password is too short'}
                            return JsonResponse(response_data, status=200)
                        if (re.search(r'[A-Z]', new_password) is None):
                            response_data = {'success': False, 'message': 'New password requires at least 1 uppercase letter'}
                            return JsonResponse(response_data, status=200)
                        if (re.search(r'[a-z]', new_password) is None):
                            response_data = {'success': False, 'message': 'New password requires at least 1 lowercase letter'}
                            return JsonResponse(response_data, status=200)
                        if (len(re.findall(r'\d', new_password)) < 2):
                            response_data = {'success': False, 'message': 'New password requires at least 2 digits'}
                            return JsonResponse(response_data, status=200)

                        user.password_hash = new_password_hash
                        user.save()
                        response_data = {'success': True, 'message': 'Password succesfully changed'}
                        return JsonResponse(response_data , status=201)                
                    else:
                        response_data = {'success': False, 'message': 'Invalid Password'}
                        return JsonResponse(response_data, status=200)
                else:
                    response_data = {'success': False, 'message': 'Incorrect ID'}
                    return JsonResponse(response_data, status=200)
            except Exception as e:
                response_data = {'success': False, 'message': 'An error occured'}
                return JsonResponse(response_data, status=200)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=200)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)
    
def bypass_a2f(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = BPassa2fForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        email = form.cleaned_data['email']
        password = form.cleaned_data['password']
        user = User.objects.filter(email=email).first()

        if (user is not None):
            
            if (len(password) < 256):
                password_hash = hashlib.sha256(password.encode()).hexdigest()

                if (password_hash == user.password_hash):
                    user.connection_mail_date = timezone.now()
                    user.connection_mail_code = str(secrets.randbelow(900000) + 100000)
                    user.save()

                    subject = user.connection_mail_code + " is your connection code for your ft_transcendance account"
                    message = f'Hello,\n\nYou have requested an email connection code.\n\nYour email connection code is: {user.connection_mail_code}\n\nThis code is valid for a limited time. Please use it as soon as possible to connect to your account.\n\nBest regards,\n[ft_transcendance]'
                    from_email = 'ft_transcendance <ft.transcendance.42nice@gmail.com>'
                    recipient_list = [email]

                    send_mail(subject, message, from_email, recipient_list)
                    response_data = {'success': True, 'message': 'Connection code sent'}
                    return JsonResponse(response_data , status=200)
                else:
                    response_data = {'success': False, 'message': 'Invalid Password'}
                    return JsonResponse(response_data, status=202)
            else:
                response_data = {'success': False, 'message': 'Invalid Password'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Incorrect ID'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def is_connection_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = IsConnectCodeForm(data)
        if not form.is_valid():
            response_data = {'success': False, 'message': 'Invalid Data'}
            return JsonResponse(response_data, status=202)
        email = form.cleaned_data['email']
        password = form.cleaned_data['password']
        code = form.cleaned_data['connection_code']
        desactivate_a2f = form.cleaned_data['desactivate_a2f']
        weekly = form.cleaned_data['weekly']
        user = User.objects.filter(email=email).first()

        if (user is not None):

            if (len(password) < 256):
                password_hash = hashlib.sha256(password.encode()).hexdigest()

                if (password_hash == user.password_hash):
                    time_difference = (user.connection_mail_date - timezone.now()).total_seconds()

                    if (time_difference <= 300):
                        
                        if (str(user.connection_mail_code) == str(code)):

                            user.connection_mail_date = datetime(1970, 1, 1, 0, 0)
                            
                            if (desactivate_a2f):
                                user.a2f_status = False
                                
                            user.save()
                            
                            response_data = {'success': True, 'message': 'User succesfully connected'}

                            if weekly is True:
                                maxAge = 604800
                            else:
                                maxAge = 21600

                            payload = {'user_id': user.user_id}
                            token = jwt.encode(payload, os.environ.get('JWT_SECRET'), algorithm='HS256')
                            response = HttpResponse(json.dumps(response_data), status=200, content_type='application/json')
                            response.set_cookie('auth', token, max_age=maxAge, samesite='None', secure=True, httponly=True, path='/')
                            return response

                        else:
                            response_data = {'success': False, 'message': 'Incorrect connection code'}
                            return JsonResponse(response_data, status=202)
                    else:
                        response_data = {'success': False, 'message': 'Connection code expired'}
                        return JsonResponse(response_data, status=202)
                else:
                    response_data = {'success': False, 'message': 'Invalid Password'}
                    return JsonResponse(response_data, status=202)
            else:
                response_data = {'success': False, 'message': 'Invalid Password'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Incorrect ID'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def is_in_game(request):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id = payload.get('user_id')

                user = User.objects.get(user_id=user_id)
                
                table = PongGame.objects.filter(players=user).filter(status="in_game").first()
                if table:
                    game = getData(table.id)
                    if game:
                        game.player[user.user_id].user = user
                        response_data = {'success': True, 'message': 'User in Game'}
                        return JsonResponse(response_data, status=200)
                response_data = {'success': False, 'message': 'User not in Game'}
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
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)