# A101 AI Trader - Usage Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env file and fill in your API keys
```

**Required API Keys:**
- `ASTER_API_KEY`: Your AsterDEX API Key
- `ASTER_API_SECRET`: Your AsterDEX API Secret
- `OPENAI_API_KEY`: Your OpenAI API Key

**Get AsterDEX API Key:**
1. Visit https://www.asterdex.com/en/api-management
2. Login to your account
3. Create a new API Key
4. Copy the API Key and Secret

**Start backend service:**
```bash
python app.py
```

Backend will run at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

Frontend will run at `http://localhost:3000`

## Supported Commands

### Trading Commands

#### Open Long Position
```
Open long BTC with 10x leverage, 100 USDT
Buy BTC 100 USDT with 5x leverage
Long BTC 200 USDT 15x
```

#### Open Short Position
```
Open short ETH with 10x leverage, 50 USDT
Short SOL 200 USDT
Sell ETH 100 USDT with 10x leverage
```

#### Close Position
```
Close all BTC positions
Close my ETH position
Exit all positions
```

#### Set Leverage
```
Set BTC leverage to 20x
Set leverage for ETH to 15x
Change SOL leverage to 10x
```

### Query Commands

#### Query Price
```
What's the BTC price?
Show me ETH price
Get current SOL price
```

#### Query Positions
```
Show my positions
What are my open positions?
List all positions
```

#### Query Balance
```
Check my balance
Show account balance
What's my balance?
```

#### Query History
```
Show my BTC trading history
Show recent trades for ETH
Get trade history
```

## Risk Management

The system has built-in multi-layer risk management:

### 1. Trading Limits
- **Single Trade Limit**: Default $1,000 USDT
- **Max Leverage**: Default 20x
- **Confirmation Threshold**: Requires confirmation for trades over $500 USDT

### 2. Daily Limits
- **Max Daily Trades**: 50 trades
- **Max Daily Loss**: $5,000 USDT

### 3. Safety Alerts
- Large trades require double confirmation
- High leverage shows risk warnings
- Alerts when approaching liquidation price

## API Endpoints

### Backend API

**Health Check**
```
GET /api/health
```

**Process Command**
```
POST /api/command
Body: {
  "command": "Open long BTC with 10x leverage, 100 USDT",
  "confirm": false
}
```

**Query Positions**
```
GET /api/positions?symbol=BTCUSDT
```

**Query Balance**
```
GET /api/balance
```

**Risk Statistics**
```
GET /api/risk/stats
```

## FAQ

### Q: How to get OpenAI API Key?
A: Visit https://platform.openai.com/api-keys to create an API Key

### Q: What trading pairs are supported?
A: All perpetual contract trading pairs on AsterDEX, including BTC, ETH, SOL, BNB, etc.

### Q: How to modify risk limits?
A: Edit the following parameters in `.env` file:
- `MAX_SINGLE_TRADE`: Single trade limit
- `MAX_LEVERAGE`: Maximum leverage
- `CONFIRM_THRESHOLD`: Confirmation threshold

### Q: What if command recognition is inaccurate?
A: Use clear, complete commands with all necessary information (trading pair, amount, leverage, etc.)

### Q: How to deploy in production?
A: 
1. Set `DEBUG=False` in `.env` file
2. Use HTTPS
3. Configure appropriate CORS policy
4. Use a process manager (like PM2 or systemd)
5. Consider using Nginx as reverse proxy

## Security Recommendations

⚠️ **Important Security Tips:**

1. **Never share your API Keys**
2. **Use read-only API Keys for testing**
3. **Enable 2FA on your AsterDEX account**
4. **Set reasonable trading limits**
5. **Regularly check trading history**
6. **Don't use on public networks**
7. **Keep software updated**

## Development

### Adding New Features

**Backend - Add new trading actions:**
1. Add new action in `SYSTEM_PROMPT` in `ai/intent_parser.py`
2. Add corresponding handler function in `app.py`
3. Update API documentation

**Frontend - Add new components:**
1. Create new component in `src/components/` directory
2. Import and use in `src/app/page.tsx`

### Testing

**Test Backend API:**
```bash
# Using curl
curl -X POST http://localhost:8000/api/command \
  -H "Content-Type: application/json" \
  -d '{"command": "Show my positions"}'
```

**Test Frontend:**
```bash
cd frontend
npm run build
npm start
```

## Troubleshooting

### Backend won't start
- Check Python version (requires 3.10+)
- Confirm all dependencies are installed
- Check `.env` file configuration

### Frontend can't connect to backend
- Confirm backend is running
- Check `NEXT_PUBLIC_API_URL` configuration
- Check browser console for errors

### API calls failing
- Verify API Keys are correct
- Check AsterDEX API status
- Check backend logs

## Contributing

Issues and Pull Requests are welcome!

## License

MIT License

## Disclaimer

This tool is for educational and research purposes only. Cryptocurrency trading carries significant risk and may result in financial loss. All risks from using this tool for trading are borne by the user. Always practice proper risk management and never invest more than you can afford to lose.
