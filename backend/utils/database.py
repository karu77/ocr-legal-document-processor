import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, ConnectionFailure
from bson import ObjectId
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseManager:
    """MongoDB database manager for user authentication and document storage"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()
        
    def connect(self):
        """Connect to MongoDB"""
        try:
            # Get MongoDB URI from environment variable or use default
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            self.client = MongoClient(mongo_uri)
            self.db = self.client.ocr_legal_processor
            
            # Create indexes for better performance
            self.db.users.create_index("email", unique=True)
            self.db.users.create_index("username", unique=True)
            self.db.documents.create_index("user_id")
            self.db.documents.create_index("created_at")
            
            print("✅ Connected to MongoDB:", self.db.name)
            
        except Exception as e:
            print("❌ Failed to connect to MongoDB:", str(e))
            self.client = None
            self.db = None
    
    def get_db(self):
        """Get database instance"""
        if self.client is None:
            self.connect()
        return self.db
    
    def create_user(self, username: str, email: str, password: str, full_name: str = "") -> Dict[str, Any]:
        """Create a new user account"""
        
        # Validate email format
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return {"success": False, "error": "Invalid email format"}
        
        # Validate password strength
        if len(password) < 8:
            return {"success": False, "error": "Password must be at least 8 characters long"}
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_data = {
            "username": username.lower().strip(),
            "email": email.lower().strip(),
            "password": hashed_password,
            "full_name": full_name.strip(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "profile": {
                "preferences": {
                    "default_language": "English",
                    "theme": "light"
                },
                "stats": {
                    "documents_processed": 0,
                    "total_pages_scanned": 0,
                    "translations_made": 0
                }
            }
        }
        
        try:
            result = self.db.users.insert_one(user_data)
            user_data["_id"] = result.inserted_id
            del user_data["password"]  # Don't return password
            
            return {
                "success": True,
                "user": self._serialize_user(user_data),
                "message": "User created successfully"
            }
            
        except DuplicateKeyError as e:
            if 'email' in str(e):
                return {"success": False, "error": "Email already exists"}
            elif 'username' in str(e):
                return {"success": False, "error": "Username already exists"}
            else:
                return {"success": False, "error": "User already exists"}
        
        except Exception as e:
            print(f"Error creating user: {e}")
            return {"success": False, "error": "Failed to create user"}
    
    def authenticate_user(self, email_or_username: str, password: str) -> Dict[str, Any]:
        """Authenticate user login"""
        
        # Find user by email or username
        query = {
            "$or": [
                {"email": email_or_username.lower().strip()},
                {"username": email_or_username.lower().strip()}
            ],
            "is_active": True
        }
        
        user = self.db.users.find_one(query)
        
        if not user:
            return {"success": False, "error": "Invalid credentials"}
        
        # Check password
        if bcrypt.checkpw(password.encode('utf-8'), user['password']):
            # Update last login
            self.db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            
            return {
                "success": True,
                "user": self._serialize_user(user),
                "message": "Login successful"
            }
        else:
            return {"success": False, "error": "Invalid credentials"}
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            user = self.db.users.find_one({"_id": ObjectId(user_id), "is_active": True})
            return self._serialize_user(user) if user else None
        except Exception as e:
            print(f"Error getting user by ID: {e}")
            return None
    
    def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        try:
            # Filter allowed updates
            allowed_fields = ['full_name', 'profile.preferences', 'profile.stats']
            filtered_updates = {}
            
            for key, value in updates.items():
                if key in allowed_fields:
                    filtered_updates[key] = value
            
            if not filtered_updates:
                return {"success": False, "error": "No valid fields to update"}
            
            filtered_updates['updated_at'] = datetime.utcnow()
            
            result = self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": filtered_updates}
            )
            
            if result.modified_count > 0:
                user = self.get_user_by_id(user_id)
                return {"success": True, "user": user, "message": "Profile updated successfully"}
            else:
                return {"success": False, "error": "No changes made"}
                
        except Exception as e:
            print(f"Error updating user profile: {e}")
            return {"success": False, "error": "Failed to update profile"}
    
    def save_document(self, user_id: str, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save processed document for user"""
        try:
            doc = {
                "user_id": ObjectId(user_id),
                "filename": document_data.get('filename', ''),
                "original_text": document_data.get('original_text', ''),
                "processed_data": {
                    "translated_text": document_data.get('translated_text', ''),
                    "cleaned_text": document_data.get('cleaned_text', ''),
                    "summary": document_data.get('summary', ''),
                    "bullet_points": document_data.get('bullet_points', ''),
                    "language": document_data.get('language', 'English')
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = self.db.documents.insert_one(doc)
            
            # Update user stats
            self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$inc": {"profile.stats.documents_processed": 1}}
            )
            
            return {
                "success": True,
                "document_id": str(result.inserted_id),
                "message": "Document saved successfully"
            }
            
        except Exception as e:
            print(f"Error saving document: {e}")
            return {"success": False, "error": "Failed to save document"}
    
    def get_user_documents(self, user_id: str, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Get user's processed documents"""
        try:
            documents = list(
                self.db.documents.find({"user_id": ObjectId(user_id)})
                .sort("created_at", -1)
                .skip(offset)
                .limit(limit)
            )
            
            # Serialize documents
            serialized_docs = []
            for doc in documents:
                doc["_id"] = str(doc["_id"])
                doc["user_id"] = str(doc["user_id"])
                serialized_docs.append(doc)
            
            total_count = self.db.documents.count_documents({"user_id": ObjectId(user_id)})
            
            return {
                "success": True,
                "documents": serialized_docs,
                "total": total_count,
                "has_more": (offset + limit) < total_count
            }
            
        except Exception as e:
            print(f"Error getting user documents: {e}")
            return {"success": False, "error": "Failed to retrieve documents"}
    
    def _serialize_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Convert user document to serializable format"""
        if not user:
            return None
        
        serialized = {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "created_at": user["created_at"].isoformat(),
            "updated_at": user["updated_at"].isoformat(),
            "profile": user.get("profile", {}),
            "last_login": user.get("last_login").isoformat() if user.get("last_login") else None
        }
        
        return serialized
    
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            print("✅ MongoDB connection closed")

# Create global database manager instance
db_manager = DatabaseManager()

def init_db():
    """Initialize database connection"""
    return db_manager.connect()

def get_db():
    """Get database instance"""
    return db_manager.get_db() 