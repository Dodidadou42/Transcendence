from django.urls import path
from .views import create_table_custom_game, isInMatchmaking, getCustomGameInfo, sendContactMail, isInTournament, getTournamentInfo, getTMatchinfo, postNewTournamentPseudo, getMatchInfo

urlpatterns = [
    path('matchmaking/customGame', create_table_custom_game, name='create_table_custom_game'),
    path('matchmaking/isInQueue', isInMatchmaking, name='isInMatchmaking'),
    path('isTournament', isInTournament, name='isInTournament'),
    path('getTournamentInfo', getTournamentInfo, name='getTournamentInfo'),
    path('getTournamentInfo/match', getTMatchinfo, name='getTMatchinfo'),
    path('postTournamentNewPseudo', postNewTournamentPseudo, name='postNewTournamentPseudo'),
    path('getMatchInfo', getMatchInfo, name='getMatchInfo'),
    path('getCMatchInfo', getCustomGameInfo, name='getCustomGameInfo'),
    path('sendContactMail', sendContactMail, name='sendContactMail'),
]
