from flask import Blueprint, request, jsonify, session
from src.models.storm import db, Storm, Idea, Vote, AnonymousUser
import uuid
import random
import string
from datetime import datetime

storm_bp = Blueprint('storm', __name__)

def generate_storm_code():
    """Generate a unique storm code"""
    return 'STORM-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def generate_session_id():
    """Generate a unique session ID"""
    return 'session-' + str(uuid.uuid4())

def generate_id():
    """Generate a unique ID"""
    return str(uuid.uuid4())

@storm_bp.route('/storms', methods=['GET'])
def list_storms():
    """List storms
    ---
    parameters:
      - name: status
        in: query
        type: string
        required: false
        description: Filter by storm status
    responses:
      200:
        description: A list of storms
      500:
        description: Server error
    """
    try:
        status = request.args.get('status')
        query = Storm.query
        if status:
            query = query.filter_by(status=status)
        storms = query.order_by(Storm.created_at.desc()).all()
        return jsonify([storm.to_dict() for storm in storms])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@storm_bp.route('/storms', methods=['POST'])
def create_storm():
    """Create a new storm
    ---
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
            description:
              type: string
            blueTokens:
              type: integer
            redTokens:
              type: integer
            ideationTimeLimit:
              type: integer
            votingTimeLimit:
              type: integer
    responses:
      201:
        description: Created
      400:
        description: Bad request
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        
        # Generate unique storm code
        storm_code = generate_storm_code()
        while Storm.query.get(storm_code):
            storm_code = generate_storm_code()
        
        # Generate moderator session
        moderator_id = generate_session_id()
        
        # Create storm
        storm = Storm(
            id=storm_code,
            title=data['title'],
            description=data.get('description', ''),
            token_budget={
                'maxBlue': data.get('blueTokens', 5),
                'maxRed': data.get('redTokens', 3)
            },
            ideation_time_limit=data.get('ideationTimeLimit'),
            voting_time_limit=data.get('votingTimeLimit'),
            moderator_id=moderator_id
        )
        
        # Create moderator user
        moderator = AnonymousUser(
            session_id=moderator_id,
            username='Modérateur',
            storm_id=storm_code,
            role='moderator'
        )
        
        db.session.add(storm)
        db.session.add(moderator)
        db.session.commit()
        
        # Set session
        session['user_id'] = moderator_id
        session['storm_id'] = storm_code
        
        return jsonify({
            'storm': storm.to_dict(),
            'user': moderator.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@storm_bp.route('/storms/<storm_id>', methods=['GET'])
def get_storm(storm_id):
    """Get storm details
    ---
    parameters:
      - name: storm_id
        in: path
        type: string
        required: true
        description: The storm ID
    responses:
      200:
        description: Storm details
      404:
        description: Not found
      500:
        description: Server error
    """
    try:
        storm = Storm.query.get_or_404(storm_id)
        return jsonify(storm.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@storm_bp.route('/storms/<storm_id>/join', methods=['POST'])
def join_storm(storm_id):
    """Join a storm as anonymous user
    ---
    consumes:
      - application/json
    parameters:
      - name: storm_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            username:
              type: string
    responses:
      200:
        description: Joined
      400:
        description: Bad request
      401:
        description: Unauthorized
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        username = data.get('username')
        
        if not username:
            return jsonify({'error': 'Username is required'}), 400
        
        storm = Storm.query.get_or_404(storm_id)
        
        # Generate session ID
        session_id = generate_session_id()
        
        # Create anonymous user
        user = AnonymousUser(
            session_id=session_id,
            username=username,
            storm_id=storm_id,
            role='participant'
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Set session
        session['user_id'] = session_id
        session['storm_id'] = storm_id
        
        return jsonify({
            'storm': storm.to_dict(),
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@storm_bp.route('/storms/<storm_id>/ideas', methods=['POST'])
def submit_idea(storm_id):
    """Submit a new idea
    ---
    consumes:
      - application/json
    parameters:
      - name: storm_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
            description:
              type: string
    responses:
      201:
        description: Idea created
      400:
        description: Invalid phase or data
      401:
        description: Not authenticated
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        storm = Storm.query.get_or_404(storm_id)
        user = AnonymousUser.query.get_or_404(user_id)
        
        if storm.status != 'ideation':
            return jsonify({'error': 'Storm is not in ideation phase'}), 400
        
        # Create idea
        idea = Idea(
            id=generate_id(),
            title=data['title'],
            description=data.get('description', ''),
            storm_id=storm_id,
            author_id=user_id,
            author_username=user.username
        )
        
        db.session.add(idea)
        db.session.commit()
        
        return jsonify(idea.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@storm_bp.route('/ideas/<idea_id>', methods=['PUT'])
def update_idea(idea_id):
    """Update an idea
    ---
    consumes:
      - application/json
    parameters:
      - name: idea_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
            description:
              type: string
    responses:
      200:
        description: Idea updated
      400:
        description: Not editable in current phase
      401:
        description: Not authenticated
      403:
        description: Not authorized
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        idea = Idea.query.get_or_404(idea_id)
        
        if idea.author_id != user_id:
            return jsonify({'error': 'Not authorized'}), 403
        
        storm = Storm.query.get_or_404(idea.storm_id)
        if storm.status != 'ideation':
            return jsonify({'error': 'Cannot edit ideas after ideation phase'}), 400
        
        idea.title = data.get('title', idea.title)
        idea.description = data.get('description', idea.description)
        idea.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(idea.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@storm_bp.route('/ideas/<idea_id>', methods=['DELETE'])
def delete_idea(idea_id):
    """Delete an idea
    ---
    parameters:
      - name: idea_id
        in: path
        type: string
        required: true
    responses:
      204:
        description: Deleted
      400:
        description: Not deletable in current phase
      401:
        description: Not authenticated
      403:
        description: Not authorized
      500:
        description: Server error
    """
    try:
        user_id = session.get('user_id')

        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401

        idea = Idea.query.get_or_404(idea_id)
        storm = Storm.query.get_or_404(idea.storm_id)

        # Determine permissions: idea author or the storm moderator
        user = AnonymousUser.query.get_or_404(user_id)
        is_author = idea.author_id == user_id
        is_moderator = user.role == 'moderator' and storm.moderator_id == user_id

        if not (is_author or is_moderator):
            return jsonify({'error': 'Not authorized'}), 403

        if storm.status != 'ideation':
            return jsonify({'error': 'Cannot delete ideas after ideation phase'}), 400

        db.session.delete(idea)
        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@storm_bp.route('/ideas/<idea_id>/vote', methods=['POST'])
def submit_vote(idea_id):
    """Submit a vote for an idea
    ---
    consumes:
      - application/json
    parameters:
      - name: idea_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            blueTokens:
              type: integer
            redTokens:
              type: integer
            comment:
              type: string
    responses:
      201:
        description: Vote submitted
      400:
        description: Validation error or insufficient tokens
      401:
        description: Not authenticated
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        idea = Idea.query.get_or_404(idea_id)
        storm = Storm.query.get_or_404(idea.storm_id)
        
        if storm.status != 'voting':
            return jsonify({'error': 'Storm is not in voting phase'}), 400
        
        blue_tokens = data.get('blueTokens', 0)
        red_tokens = data.get('redTokens', 0)
        comment = data.get('comment', '')
        
        if not comment.strip():
            return jsonify({'error': 'Comment is required'}), 400
        
        if blue_tokens > 0 and red_tokens > 0:
            return jsonify({'error': 'Cannot use both blue and red tokens on the same idea'}), 400
        
        # Check token budget
        user_votes = Vote.query.filter_by(storm_id=storm.id, user_id=user_id).all()
        total_blue = sum(vote.blue_tokens for vote in user_votes)
        total_red = sum(vote.red_tokens for vote in user_votes)
        
        if total_blue + blue_tokens > storm.token_budget['maxBlue']:
            return jsonify({'error': 'Insufficient blue tokens'}), 400
        
        if total_red + red_tokens > storm.token_budget['maxRed']:
            return jsonify({'error': 'Insufficient red tokens'}), 400
        
        # Remove existing vote for this idea
        existing_vote = Vote.query.filter_by(idea_id=idea_id, user_id=user_id).first()
        if existing_vote:
            db.session.delete(existing_vote)
        
        # Create new vote
        vote = Vote(
            id=generate_id(),
            idea_id=idea_id,
            storm_id=storm.id,
            user_id=user_id,
            blue_tokens=blue_tokens,
            red_tokens=red_tokens,
            comment=comment
        )
        
        db.session.add(vote)
        db.session.commit()
        
        return jsonify(vote.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@storm_bp.route('/storms/<storm_id>/advance-phase', methods=['POST'])
def advance_phase(storm_id):
    """Advance storm to next phase (moderator only)
    ---
    parameters:
      - name: storm_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Phase advanced
      400:
        description: Cannot advance further
      401:
        description: Not authenticated
      403:
        description: Not authorized
      500:
        description: Server error
    """
    try:
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        storm = Storm.query.get_or_404(storm_id)
        user = AnonymousUser.query.get_or_404(user_id)
        
        if user.role != 'moderator' or storm.moderator_id != user_id:
            return jsonify({'error': 'Not authorized'}), 403
        
        if storm.status == 'ideation':
            storm.status = 'voting'
        elif storm.status == 'voting':
            storm.status = 'results'
        else:
            return jsonify({'error': 'Cannot advance from results phase'}), 400
        
        storm.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(storm.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@storm_bp.route('/session', methods=['GET'])
def get_session():
    """Get current session info
    ---
    responses:
      200:
        description: Current user and storm
      401:
        description: No active session
      500:
        description: Server error
    """
    user_id = session.get('user_id')
    storm_id = session.get('storm_id')
    
    if not user_id or not storm_id:
        return jsonify({'error': 'No active session'}), 401
    
    try:
        user = AnonymousUser.query.get_or_404(user_id)
        storm = Storm.query.get_or_404(storm_id)
        
        return jsonify({
            'user': user.to_dict(),
            'storm': storm.to_dict()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@storm_bp.route('/session', methods=['DELETE'])
def clear_session():
    """Clear current session
    ---
    responses:
      200:
        description: Session cleared
      500:
        description: Server error
    """
    try:
        session.pop('user_id', None)
        session.pop('storm_id', None)
        return jsonify({'message': 'Session cleared'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


