import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
import joblib
import os

# 1. Define Synthetic Training Data (Indian Civic context)
data = {
    'text': [
        "The street lights in Sector 4 are flickering and many are dead.", 
        "Power cut in our area for the last 6 hours without any notice.",
        "High voltage fluctuations causing damage to electronic appliances.",
        "Broken electric pole near the main market is dangerous.",
        "Transformers sparking and making loud noises during rain.",
        "Underground cable fault leading to widespread blackout.",
        
        "Potholes on the main road towards the airport are causing accidents.",
        "The bridge construction has stalled for 3 months, heavy traffic jam.",
        "Footpath is broken and occupied by illegal vendors.",
        "Road needs relaying after the heavy monsoon rains.",
        "Waterlogging on highway after 10 minutes of rain.",
        "Manhole cover is missing on a busy pedestrian walk.",
        
        "Garbage is not collected for 4 days in our residential society.",
        "Sewage overflow near the community park, smells terrible.",
        "No water supply in the colony since morning.",
        "Water coming from the taps is muddy and contaminated.",
        "Leaking pipeline wasting hundreds of gallons of water.",
        "Drainage system is completely blocked by plastic waste.",
        
        "Stray dog menace is increasing, children are being chased.",
        "The public health center has no medicines and doctor is absent.",
        "Fogging required to prevent dengue and malaria outbreak.",
        "Bio-medical waste dumped in the open behind the hospital.",
        "Vector-borne diseases spreading due to stagnant water.",
        "Pollution from nearby factory causing breathing issues.",
        
        "Illegal parking causing massive traffic jams during peak hours.",
        "Loud music being played in the neighborhood after midnight.",
        "Chain snatching incident reported near the metro station.",
        "Need more police patrolling in the evening for women safety.",
        "Illegal construction on public land reported.",
        "Vandalism of public property in the local park.",
        
        "Enormous fire broke out in the local garment factory.",
        "Fire extinguisher in the complex is expired and needs check.",
        "Short circuit led to a fire in the server room.",
        "Blocked emergency exit in the shopping mall.",
        "Forest fire spreading near the residential hill area.",
        "Gas cylinder leakage and minor fire in the kitchen.",
        
        "Bus drivers are driving rashly and missing the stops.",
        "Auto-rickshaws charging extra fare and refusing to use meters.",
        "Metro station lift is not working for two days.",
        "Cycle track is being used for parking heavy vehicles.",
        "Public transport frequency is very low in the evenings.",
        "Broken railings at the bus stop causing safety hazard."
    ],
    'category': [
        'Electricity', 'Electricity', 'Electricity', 'Electricity', 'Electricity', 'Electricity',
        'PWD', 'PWD', 'PWD', 'PWD', 'PWD', 'PWD',
        'Water & Sewage', 'Water & Sewage', 'Water & Sewage', 'Water & Sewage', 'Water & Sewage', 'Water & Sewage',
        'Health', 'Health', 'Health', 'Health', 'Health', 'Health',
        'Police', 'Police', 'Police', 'Police', 'Police', 'Police',
        'Fire', 'Fire', 'Fire', 'Fire', 'Fire', 'Fire',
        'Transport', 'Transport', 'Transport', 'Transport', 'Transport', 'Transport'
    ],
    'urgency': [
        'MEDIUM', 'HIGH', 'HIGH', 'CRITICAL', 'CRITICAL', 'HIGH',
        'HIGH', 'MEDIUM', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL',
        'MEDIUM', 'HIGH', 'HIGH', 'HIGH', 'MEDIUM', 'MEDIUM',
        'MEDIUM', 'HIGH', 'MEDIUM', 'HIGH', 'HIGH', 'HIGH',
        'MEDIUM', 'LOW', 'HIGH', 'HIGH', 'LOW', 'MEDIUM',
        'CRITICAL', 'MEDIUM', 'CRITICAL', 'CRITICAL', 'CRITICAL', 'CRITICAL',
        'MEDIUM', 'LOW', 'LOW', 'LOW', 'LOW', 'MEDIUM'
    ]
}

df = pd.DataFrame(data)

# 2. Build Classification Model for Category
def train_category_model():
    print("Training Category Classification Model (Random Forest)...")
    X = df['text']
    y = df['category']
    
    # Text processing + Classifier pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english')),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    pipeline.fit(X, y)
    
    # Save the model
    joblib.dump(pipeline, 'models/category_model.joblib')
    print("Category model saved to models/category_model.joblib")

# 3. Build Classification Model for Urgency
def train_urgency_model():
    print("Training Urgency Classification Model (Random Forest)...")
    X = df['text']
    y = df['urgency']
    
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english')),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    pipeline.fit(X, y)
    
    # Save the model
    joblib.dump(pipeline, 'models/urgency_model.joblib')
    print("Urgency model saved to models/urgency_model.joblib")

if __name__ == "__main__":
    if not os.path.exists('models'):
        os.makedirs('models')
    
    train_category_model()
    train_urgency_model()
    
    # Simple test
    test_text = "There is a fire near the gas station, please send help!"
    cat_model = joblib.load('models/category_model.joblib')
    urg_model = joblib.load('models/urgency_model.joblib')
    
    print("\nTest Prediction:")
    print(f"Input: {test_text}")
    print(f"Predicted Category: {cat_model.predict([test_text])[0]}")
    print(f"Predicted Urgency: {urg_model.predict([test_text])[0]}")
