from flask import Blueprint, request, jsonify, session
from src.models.user import db, User

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    new_user = User(username=data['username'], email=data['email'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    # In a real app, you'd verify password here
    user = User.query.filter_by(username=username).first()
    if user:
        session['user_id'] = user.id
        return jsonify({'message': 'Logged in successfully', 'user': user.to_dict()})
    return jsonify({'message': 'Invalid credentials'}), 401

@user_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

