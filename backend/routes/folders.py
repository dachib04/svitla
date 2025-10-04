from flask import Blueprint, request, jsonify
from app import db
from models import Folder
from routes.auth import token_required

folder_bp = Blueprint("folders", __name__)

# CREATE
@folder_bp.route("/folders", methods=["POST"])
@token_required
def create_folder(current_user):
    data = request.get_json()
    name = data.get("name")
    parent_id = data.get("parent_id")
    if not name:
        return jsonify({"error": "Folder name is required"}), 400
    folder = Folder(name=name, parent_id=parent_id, user_id=current_user.id)
    db.session.add(folder)
    db.session.commit()
    return jsonify({"id": folder.id, "name": folder.name, "parent_id": folder.parent_id}), 201

# LIST
@folder_bp.route("/folders", methods=["GET"])
@token_required
def list_folders(current_user):
    parent_id = request.args.get("parent_id")
    query = Folder.query.filter_by(user_id=current_user.id)
    if parent_id == "null":
        folders = query.filter(Folder.parent_id.is_(None)).all()
    elif parent_id is not None:
        folders = query.filter_by(parent_id=parent_id).all()
    else:
        folders = query.all()
    return jsonify([{"id": f.id, "name": f.name, "parent_id": f.parent_id} for f in folders])

# GET
@folder_bp.route("/folders/<int:folder_id>", methods=["GET"])
def get_folder(folder_id):
    folder = Folder.query.get_or_404(folder_id)
    return jsonify({
        "id": folder.id,
        "name": folder.name,
        "parent_id": folder.parent_id,
        "subfolders": [{"id": f.id, "name": f.name} for f in folder.children],
        "files": [{"id": file.id, "name": file.name} for file in folder.files]
    })

# UPDATE
@folder_bp.route("/folders/<int:folder_id>", methods=["PUT"])
@token_required
def update_folder(current_user, folder_id):
    folder = Folder.query.get_or_404(folder_id)
    data = request.get_json()
    new_name = data.get("name")
    if not new_name:
        return jsonify({"error": "New name is required"}), 400
    folder.name = new_name
    db.session.commit()
    return jsonify({"id": folder.id, "name": folder.name, "parent_id": folder.parent_id})

# DELETE
@folder_bp.route("/folders/<int:folder_id>", methods=["DELETE"])
@token_required
def delete_folder(current_user, folder_id):
    folder = Folder.query.get_or_404(folder_id)
    db.session.delete(folder)
    db.session.commit()
    return jsonify({"message": f"Folder {folder_id} deleted successfully"})
