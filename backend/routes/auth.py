from flask import Blueprint, request, jsonify
import jwt, datetime
from functools import wraps
from app import app
from services.auth_service import create_user, authenticate
from services.user_service import get_user_by_id

auth_bp = Blueprint("auth", __name__)


# Token decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token missing"}), 403
        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = get_user_by_id(data["user_id"])
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 403
        return f(current_user, *args, **kwargs)
    return decorated


# Register endpoint
#@auth_bp.route("/register", methods=["POST"])
#def register():
    data = request.get_json()
    user, error = create_user(data.get("username"), data.get("password"))
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"message": "User created", "id": user.id}), 201

@auth_bp.route("/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        # Preflight request — just confirm CORS is allowed
        return '', 200

    data = request.get_json()
    user, error = create_user(data.get("username"), data.get("password"))
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"message": "User created", "id": user.id}), 201

# Login endpoint
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        # Handle preflight request
        return '', 200

    data = request.get_json()
    user = authenticate(data.get("username"), data.get("password"))
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)},
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )
    return jsonify({"token": token})
