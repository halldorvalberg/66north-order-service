# The following script is a utility to post dummy order data to the backend API for testing purposes. 
# It reads orders from a JSON file and sends POST requests to the API endpoint to create orders in the database.
# Usage:
#
# 1. Ensure the backend API is running locally on http://localhost:5000.
#
# 2. Place the dummy order data in a file named 'dummy-data.json' in
#    the same directory as this script.
#
# 3. Run this script to populate the database with the dummy orders.
#    ~ python post_dummy_data.py


import json
import requests
from pathlib import Path

DATA_PATH = Path(__file__).parent / 'dummy-data.json'
API_URL = 'http://localhost:5000/orders/'

def post_order(order):
    try:
        resp = requests.post(API_URL, json=order)
        if resp.status_code == 201:
            print(f"Posted order {order.get('order_id')}")
        else:
            print(f"Failed to post order {order.get('order_id')}: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"Error posting order {order.get('order_id')}: {e}")

def main():
    with open(DATA_PATH, encoding='utf-8') as f:
        orders = json.load(f)
    for order in orders:
        post_order(order)

if __name__ == '__main__':
    main()
