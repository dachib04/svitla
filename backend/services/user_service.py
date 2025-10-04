from models import User

# Get user by ID
def get_user_by_id(user_id: int):
    return User.query.get(user_id)

# List all users
def list_users():
    return User.query.all()

# Delete user
def delete_user(user_id: int):
    user = User.query.get(user_id)
    if not user:
        return None, "User not found"
    return user, None
