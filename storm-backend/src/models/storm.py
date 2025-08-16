from src.models.user import db
from datetime import datetime
import json

class Storm(db.Model):
    __tablename__ = 'storms'
    
    id = db.Column(db.String(20), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='ideation')  # ideation, voting, results
    token_budget_json = db.Column(db.Text)  # JSON string for token budget
    expires_at = db.Column(db.DateTime)
    ideation_time_limit = db.Column(db.Integer)  # minutes
    voting_time_limit = db.Column(db.Integer)  # minutes
    moderator_id = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ideas = db.relationship('Idea', backref='storm', lazy=True, cascade='all, delete-orphan')
    votes = db.relationship('Vote', backref='storm', lazy=True, cascade='all, delete-orphan')
    
    @property
    def token_budget(self):
        if self.token_budget_json:
            return json.loads(self.token_budget_json)
        return {'maxBlue': 5, 'maxRed': 3}
    
    @token_budget.setter
    def token_budget(self, value):
        self.token_budget_json = json.dumps(value)
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'tokenBudget': self.token_budget,
            'expiresAt': self.expires_at.isoformat() if self.expires_at else None,
            'ideationTimeLimit': self.ideation_time_limit,
            'votingTimeLimit': self.voting_time_limit,
            'moderatorId': self.moderator_id,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            'ideas': [idea.to_dict() for idea in self.ideas],
            'votes': [vote.to_dict() for vote in self.votes],
            'participantCount': len(set([idea.author_id for idea in self.ideas] + [vote.user_id for vote in self.votes])),
            'participants': [user.to_dict() for user in AnonymousUser.query.filter_by(storm_id=self.id).all()]
        }


class Idea(db.Model):
    __tablename__ = 'ideas'
    
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    storm_id = db.Column(db.String(20), db.ForeignKey('storms.id'), nullable=False)
    author_id = db.Column(db.String(50), nullable=False)
    author_username = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'stormId': self.storm_id,
            'authorId': self.author_id,
            'authorUsername': self.author_username,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }


class Vote(db.Model):
    __tablename__ = 'votes'
    
    id = db.Column(db.String(50), primary_key=True)
    idea_id = db.Column(db.String(50), db.ForeignKey('ideas.id'), nullable=False)
    storm_id = db.Column(db.String(20), db.ForeignKey('storms.id'), nullable=False)
    user_id = db.Column(db.String(50), nullable=False)
    blue_tokens = db.Column(db.Integer, default=0)
    red_tokens = db.Column(db.Integer, default=0)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'ideaId': self.idea_id,
            'userId': self.user_id,
            'blueTokens': self.blue_tokens,
            'redTokens': self.red_tokens,
            'comment': self.comment,
            'createdAt': self.created_at.isoformat()
        }


class AnonymousUser(db.Model):
    __tablename__ = 'anonymous_users'
    
    session_id = db.Column(db.String(50), primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    storm_id = db.Column(db.String(20), db.ForeignKey('storms.id'), nullable=False)
    role = db.Column(db.String(20), default='participant')  # participant, moderator
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'sessionId': self.session_id,
            'username': self.username,
            'stormId': self.storm_id,
            'role': self.role,
            'createdAt': self.created_at.isoformat()
        }


