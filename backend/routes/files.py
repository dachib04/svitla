from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename
import os
from app import db
from models import File
from routes.auth import token_required

file_bp = Blueprint("files", __name__)

# UPLOAD file
@file_bp.route("/files", methods=["POST"])
@token_required
def upload_file(current_user):
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    folder_id = request.form.get("folder_id")

    if not file or file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    folder_path = os.path.join(current_app.config["UPLOAD_FOLDER"], f"folder_{folder_id}")
    os.makedirs(folder_path, exist_ok=True)

    # ensure unique filename
    base, ext = os.path.splitext(filename)
    counter = 1
    new_filename = filename
    while File.query.filter_by(name=new_filename, folder_id=folder_id, user_id=current_user.id).first():
        new_filename = f"{base}({counter}){ext}"
        counter += 1

    save_path = os.path.join(folder_path, new_filename)
    file.save(save_path)

    new_file = File(name=new_filename, folder_id=folder_id, path=save_path, user_id=current_user.id)
    db.session.add(new_file)
    db.session.commit()

    return jsonify({
        "id": new_file.id,
        "name": new_file.name,
        "folder_id": new_file.folder_id
    }), 201


# DOWNLOAD file
@file_bp.route("/files/<int:file_id>/download", methods=["GET"])
def download_file(file_id):
    file = File.query.get_or_404(file_id)
    if not os.path.exists(file.path):
        return jsonify({"error": "File not found"}), 404
    return send_file(file.path, as_attachment=True, download_name=file.name)


# UPDATE file
@file_bp.route("/files/<int:file_id>", methods=["PUT"])
@token_required
def update_file(current_user, file_id):
    file = File.query.get_or_404(file_id)

    # check ownership
    if file.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    new_name = data.get("name")
    if not new_name:
        return jsonify({"error": "New name is required"}), 400

    _, ext = os.path.splitext(file.name)
    if not new_name.endswith(ext):
        new_name += ext

    new_path = os.path.join(os.path.dirname(file.path), secure_filename(new_name))
    os.rename(file.path, new_path)

    file.name = new_name
    file.path = new_path
    db.session.commit()

    return jsonify({"id": file.id, "name": file.name})


# DELETE file
@file_bp.route("/files/<int:file_id>", methods=["DELETE"])
@token_required
def delete_file(current_user, file_id):
    file = File.query.filter_by(id=file_id, user_id=current_user.id).first_or_404()

    # remove from disk
    try:
        if os.path.exists(file.path):
            os.remove(file.path)
    except Exception as e:
        print(f"Warning: could not delete file {file.path}: {e}")

    db.session.delete(file)
    db.session.commit()

    return jsonify({"message": f"File {file.name} deleted successfully"})


# SEARCH files
@file_bp.route("/search", methods=["GET"])
@token_required
def search_files(current_user):
    q = request.args.get("q", "")
    results = File.query.filter(File.user_id == current_user.id, File.name.ilike(f"%{q}%")).all()
    return jsonify([
        {"id": f.id, "name": f.name, "folder_id": f.folder_id}
        for f in results
    ])


@file_bp.route("/files/<int:file_id>/preview", methods=["GET"])
def preview_file(file_id):
    file = File.query.get_or_404(file_id)
    if not os.path.exists(file.path):
        return jsonify({"error": "File not found"}), 404

    # Detect type for inline preview
    ext = file.name.lower()
    if ext.endswith(".pdf"):
        mimetype = "application/pdf"
    elif ext.endswith((".jpg", ".jpeg")):
        mimetype = "image/jpeg"
    elif ext.endswith(".png"):
        mimetype = "image/png"
    elif ext.endswith(".gif"):
        mimetype = "image/gif"
    elif ext.endswith((".txt", ".log")):
        mimetype = "text/plain"
    else:
        mimetype = None  # let browser guess

    return send_file(file.path, mimetype=mimetype, as_attachment=False)
