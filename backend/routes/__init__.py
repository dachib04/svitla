from .auth import auth_bp
from .folders import folder_bp
from .files import file_bp
from .main import main_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(folder_bp)
    app.register_blueprint(file_bp)
    app.register_blueprint(main_bp)
