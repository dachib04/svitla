from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

#CORS(app)

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    return response

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# import models for migrations
from models import User, Folder, File

# register blueprints
from routes import register_routes
register_routes(app)

@app.route("/")
def index():
    return {"message": "Data Room Backend is running!"}

if __name__ == "__main__":
    app.run(debug=True)
