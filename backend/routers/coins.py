from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from backend.services.supabase_client import (
    get_user_by_id,
    get_user_coin_history,
    create_coin_transaction,
    transfer_coins
)

router = APIRouter()

# Pydantic Models
class CoinBalance(BaseModel):
    user_id: int
    balance: int

class CoinTransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: int
    transaction_type: str
    description: str
    created_at: str

@router.get("/coins/{user_id}/balance")
async def get_coin_balance(user_id: int):
    """Get current coin balance for a user from Supabase"""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user_id,
        "balance": user.get('coins', 0)
    }

@router.get("/coins/{user_id}/history")
async def get_coin_history(user_id: int, limit: int = 50):
    """Get coin transaction history for a user from Supabase"""
    # Verify user exists
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get transaction history from Supabase
    transactions = get_user_coin_history(user_id, limit)
    return transactions

def award_coins(user_id: int, amount: int, transaction_type: str, description: str):
    """Helper function to award coins to a user in Supabase"""
    # Create transaction and update balance in Supabase
    transaction = create_coin_transaction(user_id, amount, transaction_type, description)
    
    if not transaction:
        return {
            "transaction": None,
            "new_balance": 0
        }
    
    # Get updated balance
    user = get_user_by_id(user_id)
    new_balance = user.get('coins', 0) if user else 0
    
    return {
        "transaction": transaction,
        "new_balance": new_balance
    }

@router.post("/transfer")
async def transfer_coins_endpoint(sender_id: int, receiver_phone: str, amount: int):
    """Transfer coins from sender to receiver.
    Returns new balances.
    """
    # Verify sender exists
    sender = get_user_by_id(sender_id)
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")
    # Perform transfer via service function
    result = transfer_coins(sender_id, receiver_phone, amount)
    if not result:
        raise HTTPException(status_code=400, detail="Transfer failed")
    return {
        "success": True,
        "sender_new_balance": result["sender_new_balance"],
        "receiver_new_balance": result["receiver_new_balance"]
    }
