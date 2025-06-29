import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from .database import db_manager

class AuthManager:
    """JWT Authentication manager"""
    
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-super-secret-key-change-in-production')
        self.algorithm = 'HS256'
        self.access_token_expires = timedelta(hours=24)
        self.refresh_token_expires = timedelta(days=30)
    
    def generate_tokens(self, user_id: str) -> dict:
        """Generate access and refresh tokens"""
        now = datetime.utcnow()
        
        # Access token payload
        access_payload = {
            'user_id': user_id,
            'type': 'access',
            'exp': now + self.access_token_expires,
            'iat': now
        }
        
        # Refresh token payload
        refresh_payload = {
            'user_id': user_id,
            'type': 'refresh',
            'exp': now + self.refresh_token_expires,
            'iat': now
        }
        
        access_token = jwt.encode(access_payload, self.secret_key, algorithm=self.algorithm)
        refresh_token = jwt.encode(refresh_payload, self.secret_key, algorithm=self.algorithm)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_at': (now + self.access_token_expires).isoformat(),
            'token_type': 'Bearer'
        }
    
    def decode_token(self, token: str) -> dict:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return {'success': True, 'payload': payload}
        except jwt.ExpiredSignatureError:
            return {'success': False, 'error': 'Token has expired'}
        except jwt.InvalidTokenError:
            return {'success': False, 'error': 'Invalid token'}
    
    def refresh_access_token(self, refresh_token: str) -> dict:
        """Generate new access token using refresh token"""
        result = self.decode_token(refresh_token)
        
        if not result['success']:
            return result
        
        payload = result['payload']
        
        if payload.get('type') != 'refresh':
            return {'success': False, 'error': 'Invalid token type'}
        
        # Check if user still exists
        user = db_manager.get_user_by_id(payload['user_id'])
        if not user:
            return {'success': False, 'error': 'User not found'}
        
        # Generate new tokens
        tokens = self.generate_tokens(payload['user_id'])
        return {'success': True, 'tokens': tokens}

# Global auth manager instance
auth_manager = AuthManager()

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Remove 'Bearer ' prefix
            except IndexError:
                return jsonify({'error': 'Invalid authorization header format'}), 401
        
        if not token:
            return jsonify({'error': 'Authentication token required'}), 401
        
        # Decode token
        result = auth_manager.decode_token(token)
        if not result['success']:
            return jsonify({'error': result['error']}), 401
        
        payload = result['payload']
        
        if payload.get('type') != 'access':
            return jsonify({'error': 'Invalid token type'}), 401
        
        # Get user information
        user = db_manager.get_user_by_id(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 401
        
        # Add user to request context
        request.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated_function

def optional_auth(f):
    """Decorator for routes that can work with or without authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        request.current_user = None
        
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                result = auth_manager.decode_token(token)
                
                if result['success']:
                    payload = result['payload']
                    if payload.get('type') == 'access':
                        user = db_manager.get_user_by_id(payload['user_id'])
                        if user:
                            request.current_user = user
            except:
                pass  # Ignore auth errors for optional auth
        
        return f(*args, **kwargs)
    
    return decorated_function 