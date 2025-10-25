# 🚀 A101 AI Trader

An AI-powered cryptocurrency trading assistant for AsterDEX, featuring intelligent market analysis, natural language trading commands, and real-time portfolio management powered by the A101 Protocol.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![Next.js](https://img.shields.io/badge/next.js-14-black)

## ✨ Features

### 🤖 AI Market Prediction
- **Multi-Model Support**: GPT-5, Claude Sonnet 4.5, Gemini 2.5 Pro (coming soon)
- **Real-time Analysis**: AI-driven market trend predictions (Bullish/Bearish/Neutral)
- **Confidence Scoring**: Get prediction confidence levels (0-100%)
- **Price Targets**: 24-hour high/low price forecasts
- **Technical Signals**: Key technical indicators and market signals
- **Market Sentiment**: AI-generated sentiment analysis

### 💬 Natural Language Trading
- **Voice & Text Input**: Interact using natural language commands
- **Smart Intent Recognition**: AI understands your trading intentions
- **Quick Execution**: Fast order placement and management
- **Context Awareness**: Maintains conversation context

### 📊 Portfolio Management
- **Real-time Balance**: Live account balance updates
- **Position Tracking**: Monitor all open positions
- **P&L Calculation**: Real-time profit/loss tracking
- **One-click Refresh**: Instant data synchronization

### 🎨 Modern UI/UX
- **Dark Theme**: Sleek AsterDEX-style interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Fluid transitions and interactions
- **Intuitive Layout**: Three-column layout for optimal workflow

## 🎯 Supported Commands

### Trading Operations
```
"Buy 0.1 BTC"
"Open long position on ETH with 10x leverage"
"Close all BNB positions"
"Set stop loss at 40000"
```

### Market Queries
```
"What's the current BTC price?"
"Show me ETH chart"
"Analyze SOL market"
```

### Account Management
```
"Check my balance"
"Show my positions"
"Display trading history"
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: Python FastAPI
- **AI Integration**: OpenAI API
- **Exchange SDK**: AsterDEX Python SDK
- **Validation**: Pydantic
- **Logging**: Python logging

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- AsterDEX API credentials
- OpenAI API key

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
# AsterDEX API
ASTER_API_KEY=your_aster_api_key
ASTER_API_SECRET=your_aster_api_secret

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Security Settings
MAX_SINGLE_TRADE=1000
MAX_LEVERAGE=20
CONFIRM_THRESHOLD=500
```

4. **Start the backend server**
```bash
python app.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🚀 Quick Start

1. **Launch the Application**
   - Start both backend and frontend servers
   - Open `http://localhost:3000` in your browser

2. **Configure API Keys**
   - Click the Settings icon in the top-right corner
   - Enter your AsterDEX API credentials
   - Enter your OpenAI API key
   - Click "Save Settings"

3. **Use AI Market Prediction**
   - Select a cryptocurrency (BTC, ETH, BNB, SOL)
   - Choose AI model (GPT-5)
   - Click "Analyze Market"
   - View prediction results with confidence scores

4. **Start Trading via Chat**
   - Type commands in the chat input
   - Example: "Check my balance"
   - Example: "What's the BTC price?"
   - Example: "Buy 0.1 BTC"

## 📐 Architecture

```
┌─────────────────────────────────────────────┐
│              User Interface                 │
│         (Next.js + React + Tailwind)        │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│           FastAPI Backend                   │
│  ┌──────────────┬──────────────────────┐   │
│  │  AI Module   │  Trading Module      │   │
│  │  (OpenAI)    │  (AsterDEX SDK)      │   │
│  └──────────────┴──────────────────────┘   │
└─────────────────────────────────────────────┘
                   │
                   ↓
┌──────────────────┬──────────────────────────┐
│   OpenAI API     │      AsterDEX API        │
│   (GPT Models)   │   (Trading Exchange)     │
└──────────────────┴──────────────────────────┘
```

## 🎨 UI Layout

```
┌────────────────────────────────────────────────────┐
│  Header: Logo + Settings Button                   │
├──────────────┬─────────────────┬──────────────────┤
│              │                 │                  │
│  AI Market   │   Chat Trading  │  Account Info    │
│  Prediction  │   Assistant     │  - Balance       │
│  - Symbol    │   - Messages    │  - Positions     │
│  - Model     │   - Input       │                  │
│  - Analysis  │                 │                  │
│              │                 │                  │
└──────────────┴─────────────────┴──────────────────┘
```

## 🔐 Security Best Practices

⚠️ **Important Security Guidelines:**

- ✅ **API Keys**: Store in environment variables, never commit to version control
- ✅ **Local Storage**: API keys stored locally in browser, not sent to server
- ✅ **HTTPS**: Use secure connections in production
- ✅ **2FA**: Enable two-factor authentication on AsterDEX
- ✅ **Trading Limits**: Set maximum trade sizes and leverage limits
- ✅ **Verification**: Always verify large transactions before execution
- ✅ **Regular Updates**: Keep dependencies up to date

## 📊 API Endpoints

### Prediction
- `POST /api/predict` - Get AI market prediction

### Trading
- `POST /api/chat` - Process natural language commands
- `GET /api/balance` - Get account balance
- `GET /api/positions` - Get open positions
- `POST /api/order` - Place an order

### Risk Management
- `GET /api/risk/stats` - Get risk statistics

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend (Production)
```bash
cd backend
gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (Production)
```bash
cd frontend
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**Important Notice:**

- This tool is for educational and research purposes only
- Cryptocurrency trading carries significant financial risk
- Past performance does not guarantee future results
- AI predictions are not financial advice
- Always conduct your own research (DYOR)
- Only trade with funds you can afford to lose
- The developers are not responsible for any financial losses

## 🙏 Acknowledgments

- [AsterDEX](https://asterdex.com) - Trading platform
- [OpenAI](https://openai.com) - AI models
- [Next.js](https://nextjs.org) - React framework
- [FastAPI](https://fastapi.tiangolo.com) - Python web framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ by the A101 AI Trader Team**
