from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    coins = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Legacy fields (kept for backward compatibility)
    hashed_password = Column(String, nullable=True)
    
    # Relationships
    scans = relationship("Scan", back_populates="owner")
    notifications = relationship("Notification", back_populates="user")
    referrals_sent = relationship("Referral", foreign_keys="Referral.referrer_id", back_populates="referrer")
    coin_transactions = relationship("CoinTransaction", back_populates="user")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    food_name = Column(String)
    confidence = Column(Integer)
    image_path = Column(String, nullable=True)
    nutrition_json = Column(Text) # Storing JSON as text for simplicity in MVP
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="scans")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, default="system")  # system, achievement, referral, etc.
    extra_data = Column(Text, nullable=True)  # JSON string for additional data
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id"))
    referred_phone = Column(String, nullable=False)
    referred_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="pending")  # pending, accepted, registered
    created_at = Column(DateTime, default=datetime.utcnow)

    referrer = relationship("User", foreign_keys=[referrer_id], back_populates="referrals_sent")

class CoinTransaction(Base):
    __tablename__ = "coin_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer, nullable=False)  # positive for earned, negative for spent
    transaction_type = Column(String, nullable=False)  # scan, referral, bonus, etc.
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="coin_transactions")
