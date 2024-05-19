import asyncio

data = {} 

def getData(id):
    if id in data:
        return data[id]
    else:
        return None

def setData(id, game):
    data[id] = game


players_in_queue = {}

def setPlayerMutex(Uid):
    if Uid not in players_in_queue:
        players_in_queue[Uid] = asyncio.Lock()

def getPlayerMutex(Uid):
    if Uid not in players_in_queue:
        players_in_queue[Uid] = asyncio.Lock()
    return players_in_queue[Uid]