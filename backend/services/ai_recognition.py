import os
import base64
import requests
from typing import Dict, Any

# Clarifai API configuration
CLARIFAI_API_KEY = os.getenv('CLARIFAI_API_KEY', 'demo_key')  # Will use demo for now
CLARIFAI_USER_ID = 'clarifai'
CLARIFAI_APP_ID = 'main'
CLARIFAI_MODEL_ID = 'food-item-recognition'
CLARIFAI_MODEL_VERSION_ID = 'dfebc169854e429086aceb8368662641'

def recognize_food(image_path: str) -> Dict[str, Any]:
    """
    Recognize food from image using Clarifai API
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dict containing food name and confidence
    """
    try:
        # Read and encode image
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
        
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # Prepare API request
        url = f"https://api.clarifai.com/v2/models/{CLARIFAI_MODEL_ID}/versions/{CLARIFAI_MODEL_VERSION_ID}/outputs"
        
        headers = {
            'Authorization': f'Key {CLARIFAI_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            "user_app_id": {
                "user_id": CLARIFAI_USER_ID,
                "app_id": CLARIFAI_APP_ID
            },
            "inputs": [
                {
                    "data": {
                        "image": {
                            "base64": base64_image
                        }
                    }
                }
            ]
        }
        
        # Make API request
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        
        # Extract top prediction
        if result.get('outputs') and result['outputs'][0].get('data', {}).get('concepts'):
            concepts = result['outputs'][0]['data']['concepts']
            top_concept = concepts[0]
            
            return {
                'name': top_concept['name'].title(),
                'confidence': int(top_concept['value'] * 100)
            }
        else:
            return {
                'name': 'Unknown Food',
                'confidence': 0
            }
            
    except Exception as e:
        print(f"Error recognizing food: {e}")
        return {
            'name': 'Unknown Food',
            'confidence': 0
        }


def get_nutritional_data(food_name: str) -> Dict[str, Any]:
    """
    Get nutritional data for recognized food
    Uses USDA FoodData Central API (free tier)
    
    Args:
        food_name: Name of the food item
        
    Returns:
        Dict containing nutritional information
    """
    # For MVP, return estimated data based on common foods
    # In production, integrate with USDA FoodData Central API
    
    nutrition_db = {
        'pizza': {
            'calories': 266,
            'protein': '11g',
            'carbs': '33g',
            'fat': '10g',
            'healthScore': 45,
            'ingredients': ['Dough', 'Tomato Sauce', 'Cheese', 'Toppings']
        },
        'salad': {
            'calories': 150,
            'protein': '8g',
            'carbs': '12g',
            'fat': '9g',
            'healthScore': 92,
            'ingredients': ['Lettuce', 'Vegetables', 'Dressing']
        },
        'burger': {
            'calories': 540,
            'protein': '25g',
            'carbs': '45g',
            'fat': '28g',
            'healthScore': 38,
            'ingredients': ['Bun', 'Beef Patty', 'Lettuce', 'Tomato', 'Cheese']
        },
        'chicken': {
            'calories': 335,
            'protein': '38g',
            'carbs': '0g',
            'fat': '19g',
            'healthScore': 78,
            'ingredients': ['Chicken Breast', 'Seasonings']
        },
        'rice': {
            'calories': 206,
            'protein': '4g',
            'carbs': '45g',
            'fat': '0.4g',
            'healthScore': 65,
            'ingredients': ['Rice', 'Water']
        },
        'pasta': {
            'calories': 371,
            'protein': '13g',
            'carbs': '74g',
            'fat': '1.5g',
            'healthScore': 55,
            'ingredients': ['Pasta', 'Sauce']
        },
        'sandwich': {
            'calories': 300,
            'protein': '15g',
            'carbs': '40g',
            'fat': '10g',
            'healthScore': 60,
            'ingredients': ['Bread', 'Meat', 'Vegetables', 'Condiments']
        }
    }
    
    # Try to find matching food in database
    food_lower = food_name.lower()
    for key, data in nutrition_db.items():
        if key in food_lower:
            return data
    
    # Default nutritional data if not found
    return {
        'calories': 250,
        'protein': '10g',
        'carbs': '30g',
        'fat': '8g',
        'healthScore': 60,
        'ingredients': ['Various ingredients']
    }
