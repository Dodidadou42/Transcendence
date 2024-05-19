import jwt
import os

from .database import get_user_by_id

async def authenticate(scope):
    cookie_header = next((header[1] for header in scope['headers'] if header[0] == b'cookie'), None)
    
    if cookie_header:
        cookie_string = cookie_header.decode('utf-8')
        user_id = extract_user_id_from_cookie(cookie_string)
    else:
        return None

    if user_id is not None:
        user = await get_user_by_id(user_id)
        return user
    else:
        return None

def extract_user_id_from_cookie(cookie_string):
    try:
        auth = extract_auth_from_cookie(cookie_string)
        
        if auth is not None:
            payload = jwt.decode(auth, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
            user_id = payload.get('user_id')
            return user_id

        else:
            return None

    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def extract_auth_from_cookie(cookie_string):
    cookies_list = [cookie.strip() for cookie in cookie_string.split(';')]

    for cookie in cookies_list:
        if cookie.startswith('auth='):
            auth_value = cookie.split('=', 1)[1]
            return auth_value

    return None