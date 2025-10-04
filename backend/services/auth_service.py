from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from app import db


# Create new user (hash password before saving)
def create_user(username: str, password: str):
    if not username or not password:
        return None, "Missing fields"

    if User.query.filter_by(username=username).first():
        return None, "User already exists"

    hashed_pw = generate_password_hash(password)   # hash here
    user = User(username=username, password=hashed_pw)  # store in DB
    db.session.add(user)
    db.session.commit()
    return user, None


# Authenticate (login)
def authenticate(username: str, password: str):
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):  # verify here
        return None
    return user
