import numpy as np
from keras import layers, models
from keras.src.utils import to_categorical
from PyPDF2 import PdfReader
import re

# Load and preprocess sample training data (e.g., dummy data for the AI model)
# In a real scenario, this would be replaced with actual data
X_train = np.random.rand(100, 10)  # Example input features (e.g., PDF data)
y_train = np.random.rand(100, 1)   # Example output (quotation values)

# Define a simple AI model for generating quotations
def create_quotation_model():
    model = models.Sequential()
    model.add(layers.Dense(32, activation='relu', input_shape=(10,)))
    model.add(layers.Dense(16, activation='relu'))
    model.add(layers.Dense(1))  # Output is a single quotation value
    return model

# Create and compile the model
quotation_model = create_quotation_model()
quotation_model.compile(optimizer='adam', loss='mean_squared_error', metrics=['mae'])

# Train the model (using dummy data here)
quotation_model.fit(X_train, y_train, epochs=10, batch_size=8, validation_split=0.2)

# Function to extract relevant details from the proposal PDF
def extract_proposal_details(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text
    
    proposal_data = {}
    patterns = {
        'cedant': r'Cedant\s*:\s*(.*)',
        'broker': r'Broker\s*:\s*(.*)',
        'period_of_cover': r'Period of Cover\s*:\s*(.*)',
        'gross_fees': r'Gross Fees\s*:\s*(.*)',
        # Add other fields as needed
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            proposal_data[key] = match.group(1).strip()
        else:
            proposal_data[key] = 'N/A'
    
    return proposal_data

# Function to generate a quotation using the trained model
def generate_quotation(proposal_data):
    # Convert proposal data to model input format (e.g., normalize and encode)
    # This is an example; customize based on the actual input features
    input_features = np.zeros((1, 10))  # Placeholder for 10 features

    # Example: Convert numeric fields to float and add to input
    gross_fees = proposal_data.get('gross_fees', '0').replace(',', '')
    input_features[0, 0] = float(gross_fees) if gross_fees.isdigit() else 0

    # Make a prediction using the model
    predicted_quotation = quotation_model.predict(input_features)[0, 0]
    return round(predicted_quotation, 2)

# Function to process the proposal and generate the quotation
def process_proposal_and_generate_quotation(file_path):
    proposal_data = extract_proposal_details(file_path)
    quotation = generate_quotation(proposal_data)
    print(f"Generated Quotation: KSh. {quotation}")

# Example usage
input_file_path = 'path/to/your/pdf/proposal.pdf'
process_proposal_and_generate_quotation(input_file_path)
