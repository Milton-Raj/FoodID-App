from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime

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
    created_at: datetime

# Mock coin transactions database
mock_coin_transactions = []
transaction_id_counter = 1

# Mock user balances
mock_user_balances = {
    1: 0  # Default user starts with 0 coins
}

@router.get("/coins/{user_id}/balance")
async def get_coin_balance(user_id: int):
    """Get current coin balance for a user"""
    balance = mock_user_balances.get(user_id, 0)
    
    return {
        "user_id": user_id,
        "balance": balance
    }

@router.get("/coins/{user_id}/history")
async def get_coin_history(user_id: int, limit: int = 50):
    """Get coin transaction history for a user"""
    user_transactions = [t for t in mock_coin_transactions if t["user_id"] == user_id]
    
    # Sort by created_at descending
    user_transactions.sort(key=lambda x: x["created_at"], reverse=True)
    
    return user_transactions[:limit]

def award_coins(user_id: int, amount: int, transaction_type: str, description: str):
    """Helper function to award coins to a user"""
    global transaction_id_counter
    
    # Create transaction record
    transaction = {
        "id": transaction_id_counter,
        "user_id": user_id,
        "amount": amount,
        "transaction_type": transaction_type,
        "description": description,
        "created_at": datetime.utcnow()
    }
    
    mock_coin_transactions.append(transaction)
    transaction_id_counter += 1
    
    # Update user balance
    if user_id not in mock_user_balances:
        mock_user_balances[user_id] = 0
    
    mock_user_balances[user_id] += amount
    
    return {
        "transaction": transaction,
        "new_balance": mock_user_balances[user_id]
    }
