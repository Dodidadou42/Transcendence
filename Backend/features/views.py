from controller.models import User, Contact, ContactMessage, PongGame, Tournament

from django.http import JsonResponse, HttpResponse
from urllib.parse import urljoin
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
import base64
import random
import string

import jwt
import os
import json

import qrcode
from io import BytesIO
import base64
import pyotp

from django.core.mail import send_mail

from .forms import createCustomGameForm, newTournamentPseudoForm, contactMailForm

# Create your views here.

def postRequestVerif(request, nextFunction):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id_me = payload.get('user_id')
                userMe = User.objects.get(user_id=user_id_me)
                
                dataToSend = nextFunction(request, data, userMe)

                response_data = {'success': True, 'data': dataToSend}
                return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
            except Exception as e:
                print(e)
                response_data = {'success': False, 'message': 'error happened', 'error': str(e)}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a POST request'}
        return JsonResponse(response_data, status=202)

def getRequestVerif(request, nextFunction):
    if request.method == 'GET':
        token = request.COOKIES.get('auth')
        if token:
            try:
                payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
                user_id_me = payload.get('user_id')
                userMe = User.objects.get(user_id=user_id_me)
                
                dataToSend = nextFunction(request, userMe)

                response_data = {'success': True, 'data': dataToSend}
                return JsonResponse(response_data, status=200)
            except jwt.ExpiredSignatureError:
                response_data = {'success': False, 'message': 'Expired token'}
                return JsonResponse(response_data, status=202)
            except jwt.InvalidTokenError:
                response_data = {'success': False, 'message': 'Invalid token'}
                return JsonResponse(response_data, status=202)
            except Exception as e:
                print(e)
                response_data = {'success': False, 'message': 'error happened'}
                return JsonResponse(response_data, status=202)
        else:
            response_data = {'success': False, 'message': 'Missing cookie'}
            return JsonResponse(response_data, status=202)
    else:
        response_data = {'success': False, 'message': 'This is not a GET request'}
        return JsonResponse(response_data, status=202)

def create_table_custom_game(request):
    return postRequestVerif(request, create_table_custom_game_Function)

def create_table_custom_game_Function(request, data, UserMe):
    form = createCustomGameForm(data)
    if not form.is_valid():
        raise Exception("Invalid Data")
    table = PongGame.objects.create()
    table.players.set([UserMe])
    table.status = 'in_queue'
    if form.cleaned_data['mode'] == '1v1' or form.cleaned_data['mode'] == '2v2' or form.cleaned_data['mode'] == '1v1P' or form.cleaned_data['mode'] == '2v2P':
        table.mode = form.cleaned_data['mode']
    else:
        table.mode = '1v1'
    table.isCustom = True
    table.j1 = UserMe.user_id
    table.save()
    return "request ok here"

def isInMatchmaking(request):
    return postRequestVerif(request, isInMatchmaking_Function)

def isInMatchmaking_Function(request, data, UserMe):
    table = PongGame.objects.filter(players=UserMe).exclude(status='ended').filter(isBattle=False).first()
    if (table == None):
        return {'mode': 'none'}
    for player in table.players.all():
        (player)
    theMode = 'none'
    j1Name = 'none'
    j2Name = 'none'
    j3Name = 'none'
    j4Name = 'none'
    isCustom = False
    try :
        theMode = table.mode
    except Exception as e:
        theMode = 'none'
    try :
        j1Name = table.j1
    except Exception as e:
        j1Name = 'none'
    try :
        j2Name = table.j2
    except Exception as e:
        j2Name = 'none'
    try :
        j3Name = table.j3
    except Exception as e:
        j3Name = 'none'
    try :
        j4Name = table.j4
    except Exception as e:
        j4Name = 'none'
    try :
        isCustom = table.isCustom
    except Exception as e:
        isCustom = False
    return {'mode': theMode, 'j1': j1Name, 'j2': j2Name, 'j3': j3Name, 'j4': j4Name, 'isCustom': isCustom}

def isInTournament(request):
    return postRequestVerif(request, isInTournament_Function)

def isInTournament_Function(request, data, UserMe):
    try:
        tournament = tournament = Tournament.objects.filter(players=UserMe).exclude(status='ended').first()
        if tournament:
            return True
        else:
            return False
    except Exception as e:
        print(e)
        return False

def getTournamentInfo(request):
    return postRequestVerif(request, getTournamentInfo_Function)

def getTournamentInfo_Function(request, data, UserMe):
    try:
        tournament = tournament = Tournament.objects.filter(players=UserMe).exclude(status='ended').exclude(status='none').first()
        if (tournament == None):
            tournament = Tournament.objects.filter(owner=UserMe.user_id).exclude(status='ended').first()
        meReady = False
        if (UserMe.user_id == tournament.j1 and tournament.j1Status != 'none'):
            meReady = True
        elif (UserMe.user_id == tournament.j2 and tournament.j2Status != 'none'):
            meReady = True
        elif (UserMe.user_id == tournament.j3 and tournament.j3Status != 'none'):
            meReady = True
        elif (UserMe.user_id == tournament.j4 and tournament.j4Status != 'none'):
            meReady = True
        return {
            'j1': tournament.j1,
            'j2': tournament.j2, 
            'j3': tournament.j3, 
            'j4': tournament.j4,
            'j1_pseudo': tournament.j1Pseudo,
            'j2_pseudo': tournament.j2Pseudo, 
            'j3_pseudo': tournament.j3Pseudo, 
            'j4_pseudo': tournament.j4Pseudo, 
            'nbPlayer': tournament.players.count(), 
            'j1Status':tournament.j1Status,
            'j2Status':tournament.j2Status,
            'j3Status':tournament.j3Status,
            'j4Status':tournament.j4Status,
            'isReady': meReady,
            'status': tournament.status,
        }
    except Exception as e:
        print(e)
        return False

def getTMatchinfo(request):
    return postRequestVerif(request, getTMatchinfo_Function)

def getTMatchinfo_Function(request, data, UserMe):
    try:
        tournament = Tournament.objects.filter(players=UserMe).exclude(status='ended').first()
        address = request.get_host()
        return {
            'match1': getTMatchinfo2(1, tournament, address),
            'match2': getTMatchinfo2(2, tournament, address),
            'match3': getTMatchinfo2(3, tournament, address),
            'match4': getTMatchinfo2(4, tournament, address),
        }
    except Exception as e:
        print(e)
        return False

def getTMatchinfo2(mid, tournament, address):
    try:
        # Utilisez un dictionnaire pour simplifier la recherche du match correspondant
        matches = {
            1: tournament.match1,
            2: tournament.match2,
            3: tournament.match3,
            4: tournament.match4,
        }
        match = matches.get(mid, None)
        if (match == None):
            raise Exception('')

        p1 = User.objects.filter(user_id=match.j1).first()
        p2 = User.objects.filter(user_id=match.j2).first()
        p1Pseudo = getTournamentPseudo(tournament, match.j1, p1.pseudo)
        p2Pseudo = getTournamentPseudo(tournament, match.j2, p2.pseudo)

        winner = 'none'
        winnerU = match.winner.first()
        if winnerU != None:
            winner = winnerU.user_id

        return {
            'j1': match.j1,
            'j1Name': p1Pseudo,
            'j1Picture': getGoodImageUrl(str(p1.picture), address),
            'j2': match.j2,
            'j2Name': p2Pseudo,
            'j2Picture': getGoodImageUrl(str(p2.picture), address),
            'winner': winner,
            'status': match.status,
        }
    except Exception as e:
        print(e)
        return False        

def getTournamentPseudo(tournament, Uid, safeChoice):
    if (Uid == tournament.j1):
        return tournament.j1Pseudo
    elif (Uid == tournament.j2):
        return tournament.j2Pseudo
    elif (Uid == tournament.j3):
        return tournament.j3Pseudo
    elif (Uid == tournament.j4):
        return tournament.j4Pseudo
    else:
        return safeChoice

def getMatchInfo(request):
    return getRequestVerif(request, getMatchInfo_Function)

def getMatchInfo_Function(request, UserMe):
    try:
        match = PongGame.objects.filter(status='game_starting', players=UserMe).filter(isCustom=False).filter(isBattle=False).first()
        if(match == None):
            match = PongGame.objects.filter(status='ready', players=UserMe).filter(isCustom=False).filter(isBattle=False).first()
            if(match == None):
                return False
        return {
            'j1': match.j1,
            'j2': match.j2, 
            'j3': match.j3, 
            'j4': match.j4, 
            'nbPlayer': match.players.count(),
            'status': match.status,
            'mode': match.mode,
        }
    except Exception as e:
        print(e)
        return False

def getCustomGameInfo(request):
    return getRequestVerif(request, getCustomGameInfo_Function)

def getCustomGameInfo_Function(request, UserMe):
    try:
        match = PongGame.objects.filter(players=UserMe).exclude(status='ended').filter(isCustom=True).filter(isBattle=False).first()
        if (match == None):
            raise Exception('no match found')
        nb_player = 0
        if (match.j1 != 'none'):
            nb_player += 1
        if (match.j2 != 'none'):
            nb_player += 1
        if (match.j3 != 'none'):
            nb_player += 1
        if (match.j4 != 'none'):
            nb_player += 1
        return {
            'j1': match.j1,
            'j2': match.j2, 
            'j3': match.j3, 
            'j4': match.j4, 
            'nbPlayer': nb_player,
            'status': match.status,
            'mode': match.mode,
        }
    except Exception as e:
        print(e)
        return False

def postNewTournamentPseudo(request):
    return postRequestVerif(request, postNewTournamentPseudo_function)

def postNewTournamentPseudo_function(request, data, UserMe):
    form = newTournamentPseudoForm(data)
    if not form.is_valid():
        raise Exception("Invalid Data")
    tournament = tournament = Tournament.objects.filter(players=UserMe).exclude(status='ended').exclude(status='none').first()
    if (tournament == None):
        tournament = Tournament.objects.filter(owner=UserMe.user_id).exclude(status='ended').first()
    if (tournament == None):
        raise Exception('not in tournament')
    # parse pseudo
    new_pseudo_raw = form.cleaned_data['newPseudo']
    new_pseudo = parseStringForPseudoInput(new_pseudo_raw)
    #check if pseudo already used ( <unique> tournament pseudo )
    if (tournament.j1Pseudo == new_pseudo and tournament.j1 != UserMe.user_id):
        raise Exception('pseudo already in use')
    elif (tournament.j2Pseudo == new_pseudo and tournament.j2 != UserMe.user_id):
        raise Exception('pseudo already in use')
    elif (tournament.j3Pseudo == new_pseudo and tournament.j3 != UserMe.user_id):
        raise Exception('pseudo already in use')
    elif (tournament.j4Pseudo == new_pseudo and tournament.j4 != UserMe.user_id):
        raise Exception('pseudo already in use')
    #pseudo not taken
    if ( tournament.j1 == UserMe.user_id):
        tournament.j1Pseudo = new_pseudo
    elif ( tournament.j2 == UserMe.user_id):
        tournament.j2Pseudo = new_pseudo
    elif ( tournament.j3 == UserMe.user_id):
        tournament.j3Pseudo = new_pseudo
    elif ( tournament.j4 == UserMe.user_id):
        tournament.j4Pseudo = new_pseudo
    tournament.save()
    return True

def parseStringForPseudoInput(brut_pseudo):
    # Créer un objet de traduction qui supprime tous les caractères spéciaux
    table = str.maketrans("", "", string.punctuation)
    # Supprimer les caractères spéciaux de la chaîne
    raw_pseudo = brut_pseudo.translate(table)
    # Recuperer seulement les 25 premier chars
    pseudo = raw_pseudo[:15]

    if (pseudo == 'none'):
        raise Exception('Invalid pseudo')
    elif (pseudo == ''):
        raise Exception('Invalid pseudo')
    return pseudo

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

def sendContactMail(request):
    return postRequestVerif(request, sendContactMail_function)


def sendContactMail_function(request, data, UserMe):
    form = contactMailForm(data)
    if not form.is_valid():
        raise Exception("Invalid Data")
    sender_email = form.cleaned_data['email']
    mess = form.cleaned_data['mess']
    topic = form.cleaned_data['topic']
    name = form.cleaned_data['name']

    subject = "Your mail was successfully sended"
    message = f'Hello ' + name + ',\n\nYou have sent an email to our team and we will respond to you shortly. Thank you for using our service\n\nBest regards,\n[ft_transcendance]'
    from_email = 'ft_transcendance <ft.transcendance.42nice@gmail.com>'
    recipient_list = [sender_email]
    send_mail(subject, message, from_email, recipient_list)

    subject = topic
    message = "from " + sender_email + "\n\n" + mess
    from_email = 'ft_transcendance <ft.transcendance.42nice@gmail.com>'
    recipient_list = [from_email]
    send_mail(subject, message, from_email, recipient_list)
    return True