from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import supabase_client
from typing import Optional
import csv
import io
from fastapi.responses import StreamingResponse
import json

router = APIRouter()

# Pydantic models for request validation
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    status: Optional[str] = None

class CoinAdjustment(BaseModel):
    user_id: int
    amount: int
    adjustment_type: str  # 'add' or 'subtract'
    reason: str
    admin_id: str = "admin"

@router.get("/stats")
def get_stats():
    """Get dashboard statistics"""
    return supabase_client.get_dashboard_stats()

@router.get("/users")
def get_users():
    """Get all users"""
    return supabase_client.get_all_users()

@router.get("/users/{user_id}")
def get_user(user_id: int):
    """Get specific user by ID"""
    try:
        response = supabase_client.client.table('users').select('*').eq('id', user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}")
def update_user(user_id: int, user_data: UserUpdate):
    """Update user information"""
    try:
        update_data = {k: v for k, v in user_data.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        response = supabase_client.client.table('users').update(update_data).eq('id', user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User updated successfully", "user": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    """Delete a user"""
    try:
        # Check if user exists
        user = supabase_client.client.table('users').select('*').eq('id', user_id).execute()
        if not user.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete user
        supabase_client.client.table('users').delete().eq('id', user_id).execute()
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/coins/adjust")
def adjust_user_coins(adjustment: CoinAdjustment):
    """Adjust user coins (add or subtract)"""
    try:
        # Get current user coins
        user = supabase_client.client.table('users').select('coins').eq('id', adjustment.user_id).execute()
        if not user.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        current_coins = user.data[0].get('coins', 0)
        
        # Calculate new coin balance
        if adjustment.adjustment_type == 'add':
            new_coins = current_coins + adjustment.amount
        elif adjustment.adjustment_type == 'subtract':
            new_coins = max(0, current_coins - adjustment.amount)  # Don't go below 0
        else:
            raise HTTPException(status_code=400, detail="Invalid adjustment type")
        
        # Update user coins
        supabase_client.client.table('users').update({'coins': new_coins}).eq('id', adjustment.user_id).execute()
        
        # Log the adjustment (create coin_adjustments table entry)
        try:
            supabase_client.client.table('coin_adjustments').insert({
                'user_id': adjustment.user_id,
                'amount': adjustment.amount,
                'adjustment_type': adjustment.adjustment_type,
                'reason': adjustment.reason,
                'admin_id': adjustment.admin_id,
                'previous_balance': current_coins,
                'new_balance': new_coins
            }).execute()
        except:
            pass  # Table might not exist, continue anyway
        
        return {
            "message": "Coins adjusted successfully",
            "previous_balance": current_coins,
            "new_balance": new_coins,
            "adjustment": adjustment.amount
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/coins/history")
def get_coin_adjustment_history(limit: int = 50):
    """Get recent coin adjustments"""
    try:
        response = supabase_client.client.table('coin_adjustments').select('*, users(name, phone_number)').order('created_at', desc=True).limit(limit).execute()
        return response.data
    except:
        # Return empty if table doesn't exist
        return []

@router.get("/users/export/{format}")
def export_users(format: str = "csv"):
    """Export users in CSV or JSON format"""
    try:
        users = supabase_client.get_all_users()
        
        if format == "csv":
            # Create CSV
            output = io.StringIO()
            if users:
                fieldnames = ['id', 'name', 'phone_number', 'email', 'coins', 'created_at']
                writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                for user in users:
                    writer.writerow({k: user.get(k, '') for k in fieldnames})
            
            output.seek(0)
            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=users_export.csv"}
            )
        
        elif format == "json":
            # Return JSON
            json_str = json.dumps(users, indent=2, default=str)
            return StreamingResponse(
                iter([json_str]),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=users_export.json"}
            )
        
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use 'csv' or 'json'")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scans")
def get_scans(limit: int = 50):
    """Get recent scans"""
    return supabase_client.get_all_scans(limit)

@router.get("/scans/analytics")
def get_scan_analytics():
    """Get comprehensive scan analytics"""
    try:
        # Get all scans
        scans = supabase_client.get_all_scans(1000)  # Get more for analytics
        
        if not scans:
            return {
                "total_scans": 0,
                "scans_today": 0,
                "scans_this_week": 0,
                "scans_this_month": 0,
                "average_confidence": 0,
                "popular_foods": [],
                "scan_trends": [],
                "hourly_distribution": [],
                "top_users": [],
                "nutrition_insights": {}
            }
        
        from datetime import datetime, timedelta
        
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        month_start = now - timedelta(days=30)
        
        # Calculate basic stats
        total_scans = len(scans)
        scans_today = 0
        scans_this_week = 0
        scans_this_month = 0
        
        for s in scans:
            try:
                scan_date = datetime.fromisoformat(s['created_at'].replace('Z', ''))
                if scan_date >= today_start:
                    scans_today += 1
                if scan_date >= week_start:
                    scans_this_week += 1
                if scan_date >= month_start:
                    scans_this_month += 1
            except:
                pass
        
        # Average confidence
        confidences = [s.get('confidence', 0) for s in scans if s.get('confidence')]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Popular foods (top 10)
        food_counts = {}
        for scan in scans:
            food_name = scan.get('food_name', 'Unknown')
            food_counts[food_name] = food_counts.get(food_name, 0) + 1
        
        popular_foods = [
            {"name": name, "count": count, "percentage": (count / total_scans * 100) if total_scans > 0 else 0}
            for name, count in sorted(food_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        # Scan trends (last 7 days)
        daily_scans = {}
        for i in range(7):
            day = now - timedelta(days=i)
            day_key = day.strftime('%Y-%m-%d')
            daily_scans[day_key] = 0
        
        for scan in scans:
            try:
                scan_date = datetime.fromisoformat(scan['created_at'].replace('Z', ''))
                day_key = scan_date.strftime('%Y-%m-%d')
                if day_key in daily_scans:
                    daily_scans[day_key] += 1
            except:
                pass
        
        scan_trends = [
            {"date": date, "count": count}
            for date, count in sorted(daily_scans.items())
        ]
        
        # Hourly distribution
        hourly_dist = [0] * 24
        for scan in scans:
            try:
                scan_date = datetime.fromisoformat(scan['created_at'].replace('Z', ''))
                hourly_dist[scan_date.hour] += 1
            except:
                pass
        
        hourly_distribution = [
            {"hour": i, "count": count}
            for i, count in enumerate(hourly_dist)
        ]
        
        # Top users by scan count
        user_scans = {}
        for scan in scans:
            user_id = scan.get('user_id')
            if user_id:
                user_scans[user_id] = user_scans.get(user_id, 0) + 1
        
        top_users = [
            {"user_id": user_id, "scan_count": count}
            for user_id, count in sorted(user_scans.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        # Nutrition insights (average values)
        total_calories = sum(s.get('calories', 0) for s in scans if s.get('calories'))
        total_protein = sum(s.get('protein', 0) for s in scans if s.get('protein'))
        total_carbs = sum(s.get('carbs', 0) for s in scans if s.get('carbs'))
        total_fat = sum(s.get('fat', 0) for s in scans if s.get('fat'))
        
        nutrition_insights = {
            "avg_calories": total_calories / total_scans if total_scans > 0 else 0,
            "avg_protein": total_protein / total_scans if total_scans > 0 else 0,
            "avg_carbs": total_carbs / total_scans if total_scans > 0 else 0,
            "avg_fat": total_fat / total_scans if total_scans > 0 else 0,
            "total_calories_scanned": total_calories,
            "total_protein_scanned": total_protein
        }
        
        return {
            "total_scans": total_scans,
            "scans_today": scans_today,
            "scans_this_week": scans_this_week,
            "scans_this_month": scans_this_month,
            "average_confidence": round(avg_confidence, 2),
            "popular_foods": popular_foods,
            "scan_trends": scan_trends,
            "hourly_distribution": hourly_distribution,
            "top_users": top_users,
            "nutrition_insights": nutrition_insights
        }
    except Exception as e:
        print(f"Analytics error: {str(e)}")  # Debug logging
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scans/categories")
def get_scan_categories():
    """Get scan distribution by food categories"""
    try:
        scans = supabase_client.get_all_scans(1000)
        
        # Categorize foods (simple categorization based on common patterns)
        categories = {
            "Fruits": ["apple", "banana", "orange", "grape", "mango", "strawberry"],
            "Vegetables": ["carrot", "broccoli", "spinach", "tomato", "lettuce"],
            "Grains": ["rice", "bread", "pasta", "wheat", "oats"],
            "Proteins": ["chicken", "beef", "fish", "egg", "tofu"],
            "Dairy": ["milk", "cheese", "yogurt", "butter"],
            "Snacks": ["chips", "cookie", "candy", "chocolate"],
            "Beverages": ["juice", "soda", "coffee", "tea", "water"]
        }
        
        category_counts = {cat: 0 for cat in categories.keys()}
        category_counts["Other"] = 0
        
        for scan in scans:
            food_name = scan.get('food_name', '').lower()
            categorized = False
            
            for category, keywords in categories.items():
                if any(keyword in food_name for keyword in keywords):
                    category_counts[category] += 1
                    categorized = True
                    break
            
            if not categorized:
                category_counts["Other"] += 1
        
        total = sum(category_counts.values())
        
        return [
            {
                "category": cat,
                "count": count,
                "percentage": (count / total * 100) if total > 0 else 0
            }
            for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scans/confidence-distribution")
def get_confidence_distribution():
    """Get distribution of scan confidence levels"""
    try:
        scans = supabase_client.get_all_scans(1000)
        
        # Categorize by confidence ranges
        ranges = {
            "Very High (90-100%)": 0,
            "High (80-89%)": 0,
            "Medium (70-79%)": 0,
            "Low (60-69%)": 0,
            "Very Low (<60%)": 0
        }
        
        for scan in scans:
            confidence = scan.get('confidence', 0)
            if confidence >= 90:
                ranges["Very High (90-100%)"] += 1
            elif confidence >= 80:
                ranges["High (80-89%)"] += 1
            elif confidence >= 70:
                ranges["Medium (70-79%)"] += 1
            elif confidence >= 60:
                ranges["Low (60-69%)"] += 1
            else:
                ranges["Very Low (<60%)"] += 1
        
        total = sum(ranges.values())
        
        return [
            {
                "range": range_name,
                "count": count,
                "percentage": (count / total * 100) if total > 0 else 0
            }
            for range_name, count in ranges.items()
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions")
def get_transactions(limit: int = 50):
    """Get recent transactions"""
    return supabase_client.get_all_transactions(limit)

# ==================== COIN SYSTEM MANAGEMENT ====================

# Pydantic models for coin system
class CoinRule(BaseModel):
    rule_type: str  # 'earning' or 'spending'
    action_name: str
    coin_amount: int
    description: Optional[str] = None
    is_active: bool = True
    conditions: Optional[dict] = None

class CoinRuleUpdate(BaseModel):
    action_name: Optional[str] = None
    coin_amount: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    conditions: Optional[dict] = None

# Coin Rules Management
@router.get("/coins/rules")
def get_coin_rules():
    """Get all coin rules"""
    try:
        response = supabase_client.client.table('coin_rules').select('*').order('created_at', desc=True).execute()
        
        # Separate by type
        earning_rules = [r for r in response.data if r.get('rule_type') == 'earning']
        spending_rules = [r for r in response.data if r.get('rule_type') == 'spending']
        
        return {
            "earning_rules": earning_rules,
            "spending_rules": spending_rules,
            "total_rules": len(response.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coins/rules")
def create_coin_rule(rule: CoinRule):
    """Create a new coin rule"""
    try:
        from datetime import datetime
        
        rule_data = {
            "rule_type": rule.rule_type,
            "action_name": rule.action_name,
            "coin_amount": rule.coin_amount,
            "description": rule.description,
            "is_active": rule.is_active,
            "conditions": rule.conditions,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase_client.client.table('coin_rules').insert(rule_data).execute()
        
        return {
            "message": "Coin rule created successfully",
            "rule": response.data[0] if response.data else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/coins/rules/{rule_id}")
def update_coin_rule(rule_id: int, rule_update: CoinRuleUpdate):
    """Update a coin rule"""
    try:
        from datetime import datetime
        
        update_data = {k: v for k, v in rule_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = supabase_client.client.table('coin_rules').update(update_data).eq('id', rule_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        return {
            "message": "Coin rule updated successfully",
            "rule": response.data[0]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/coins/rules/{rule_id}")
def delete_coin_rule(rule_id: int):
    """Delete a coin rule"""
    try:
        response = supabase_client.client.table('coin_rules').delete().eq('id', rule_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        return {"message": "Coin rule deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/coins/rules/{rule_id}/toggle")
def toggle_coin_rule(rule_id: int):
    """Toggle coin rule active status"""
    try:
        from datetime import datetime
        
        # Get current status
        current = supabase_client.client.table('coin_rules').select('is_active').eq('id', rule_id).execute()
        
        if not current.data:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        new_status = not current.data[0]['is_active']
        
        response = supabase_client.client.table('coin_rules').update({
            "is_active": new_status,
            "updated_at": datetime.utcnow().isoformat()
        }).eq('id', rule_id).execute()
        
        return {
            "message": f"Rule {'activated' if new_status else 'deactivated'} successfully",
            "is_active": new_status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Coin Adjustments Statistics
@router.get("/coins/adjustments/stats")
def get_adjustment_stats():
    """Get coin adjustment statistics"""
    try:
        from datetime import datetime, timedelta
        
        # Get all adjustments
        adjustments = supabase_client.client.table('coin_adjustments').select('*').execute().data
        
        if not adjustments:
            return {
                "total_adjustments": 0,
                "total_added": 0,
                "total_subtracted": 0,
                "adjustments_today": 0,
                "adjustments_this_week": 0,
                "adjustments_this_month": 0
            }
        
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        month_start = now - timedelta(days=30)
        
        total_added = sum(a['amount'] for a in adjustments if a.get('adjustment_type') == 'add')
        total_subtracted = sum(a['amount'] for a in adjustments if a.get('adjustment_type') == 'subtract')
        
        adjustments_today = 0
        adjustments_this_week = 0
        adjustments_this_month = 0
        
        for adj in adjustments:
            try:
                adj_date = datetime.fromisoformat(adj['created_at'].replace('Z', ''))
                if adj_date >= today_start:
                    adjustments_today += 1
                if adj_date >= week_start:
                    adjustments_this_week += 1
                if adj_date >= month_start:
                    adjustments_this_month += 1
            except:
                pass
        
        return {
            "total_adjustments": len(adjustments),
            "total_added": total_added,
            "total_subtracted": total_subtracted,
            "net_adjustment": total_added - total_subtracted,
            "adjustments_today": adjustments_today,
            "adjustments_this_week": adjustments_this_week,
            "adjustments_this_month": adjustments_this_month
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Transaction Logs
@router.get("/coins/transactions")
def get_coin_transactions(limit: int = 100, transaction_type: Optional[str] = None):
    """Get all coin transactions with optional filtering"""
    try:
        # Get coin adjustments
        adjustments_query = supabase_client.client.table('coin_adjustments').select('*, users(name, phone_number)')
        
        if limit:
            adjustments_query = adjustments_query.limit(limit)
        
        adjustments = adjustments_query.order('created_at', desc=True).execute().data
        
        # Format transactions
        transactions = []
        for adj in adjustments:
            transaction = {
                "id": adj['id'],
                "transaction_type": adj.get('adjustment_type', 'adjustment'),
                "user_id": adj.get('user_id'),
                "user_name": adj.get('users', {}).get('name', 'Unknown') if adj.get('users') else 'Unknown',
                "user_phone": adj.get('users', {}).get('phone_number', '') if adj.get('users') else '',
                "coins": adj.get('amount', 0) if adj.get('adjustment_type') == 'add' else -adj.get('amount', 0),
                "description": adj.get('reason', ''),
                "admin_id": adj.get('admin_id', ''),
                "created_at": adj.get('created_at')
            }
            
            # Filter by type if specified
            if transaction_type and transaction_type != adj.get('adjustment_type'):
                continue
            
            transactions.append(transaction)
        
        return {
            "transactions": transactions,
            "total": len(transactions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/coins/transactions/stats")
def get_transaction_stats():
    """Get transaction statistics"""
    try:
        from datetime import datetime, timedelta
        
        # Get all transactions (adjustments for now)
        transactions = supabase_client.client.table('coin_adjustments').select('*').execute().data
        
        if not transactions:
            return {
                "total_transactions": 0,
                "total_coins_added": 0,
                "total_coins_removed": 0,
                "net_coins": 0,
                "transactions_today": 0,
                "transactions_this_week": 0
            }
        
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now - timedelta(days=7)
        
        total_added = sum(t['amount'] for t in transactions if t.get('adjustment_type') == 'add')
        total_removed = sum(t['amount'] for t in transactions if t.get('adjustment_type') == 'subtract')
        
        transactions_today = 0
        transactions_this_week = 0
        
        for txn in transactions:
            try:
                txn_date = datetime.fromisoformat(txn['created_at'].replace('Z', ''))
                if txn_date >= today_start:
                    transactions_today += 1
                if txn_date >= week_start:
                    transactions_this_week += 1
            except:
                pass
        
        return {
            "total_transactions": len(transactions),
            "total_coins_added": total_added,
            "total_coins_removed": total_removed,
            "net_coins": total_added - total_removed,
            "transactions_today": transactions_today,
            "transactions_this_week": transactions_this_week
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/coins/transactions/export/{format}")
def export_transactions(format: str = "csv"):
    """Export transaction logs"""
    try:
        transactions_data = get_coin_transactions(limit=10000)
        transactions = transactions_data["transactions"]
        
        if format == "csv":
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=['id', 'transaction_type', 'user_name', 'user_phone', 'coins', 'description', 'admin_id', 'created_at'])
            writer.writeheader()
            writer.writerows(transactions)
            
            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=coin_transactions.csv"}
            )
        elif format == "json":
            return StreamingResponse(
                iter([json.dumps(transactions, indent=2)]),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=coin_transactions.json"}
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use 'csv' or 'json'")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
