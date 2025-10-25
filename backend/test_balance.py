"""Test script to check AsterDEX balance API"""
import os
from dotenv import load_dotenv
from trading.aster_client import AsterDEXClient

# Load environment variables
load_dotenv()

# Get API credentials
api_key = os.getenv("ASTER_API_KEY", "")
api_secret = os.getenv("ASTER_API_SECRET", "")

print(f"API Key: {api_key[:20]}..." if len(api_key) > 20 else f"API Key: {api_key}")
print(f"API Secret: {api_secret[:20]}..." if len(api_secret) > 20 else f"API Secret: {api_secret}")

if not api_key or api_key.startswith("your_"):
    print("\n❌ ERROR: API keys not configured properly in .env file")
    print("Please edit backend/.env and add your real AsterDEX API keys")
    exit(1)

print("\n✅ API keys found, testing connection...")

try:
    # Create client
    client = AsterDEXClient(api_key, api_secret)
    
    # Test connection
    print("Testing server connection...")
    server_time = client.get_server_time()
    print(f"✅ Server time: {server_time}")
    
    # Get balance
    print("\nFetching account balance...")
    balances = client.get_account_balance()
    
    print("\n📊 Account Balance:")
    for balance in balances:
        asset = balance.get('asset')
        total = balance.get('balance', '0')
        available = balance.get('availableBalance', '0')
        if float(total) > 0:
            print(f"  {asset}: {total} (Available: {available})")
    
    print("\n✅ Success! API is working correctly.")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
