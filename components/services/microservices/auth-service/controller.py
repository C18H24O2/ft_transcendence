from datetime import datetime, timedelta, timezone
import jwt
import peewee
from service_runtime.models import User
import os
import sys

JWT_SECRET = os.environ["AUTH_JWT_SECRET"] or "secretKeyLalalalalalallalalaaaaaaaaaaaaaaaaa"  # ça se sent?
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_SECONDS = 3600 * 24 * 30  # 30 days
JWT_EXP_DELTA = timedelta(seconds=JWT_EXP_DELTA_SECONDS)


def generate_jwt(user: User) -> str:
    return jwt.encode({
        'uid': user.id,
        'username': user.username,
        'exp': datetime.now(timezone.utc) + JWT_EXP_DELTA,
    }, JWT_SECRET, JWT_ALGORITHM)


def get_user_from_jwt(token: str) -> User:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return User.get_by_id(payload['uid'])
    except jwt.ExpiredSignatureError:
        pass
    except jwt.InvalidTokenError:
        pass
    except peewee.DoesNotExist:
        pass
    except Exception as e:
        print("Error getting user from token", e)
    return None


def validate_jwt(token: str) -> bool:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        # print("payload:", payload, file=sys.stderr)
        date = datetime.fromtimestamp(payload['exp'])
        if date.timestamp() < datetime.now(timezone.utc).timestamp():
            return False
        return True
    except jwt.ExpiredSignatureError:
        pass
    except jwt.InvalidTokenError:
        pass
    except Exception as e:
        print("Error validating token", e)
    return False
