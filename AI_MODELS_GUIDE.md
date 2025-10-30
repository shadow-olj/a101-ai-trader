# AI Models Integration Guide

## 🤖 Supported AI Models

The A101 AI Trader now supports **5 AI models** for market prediction:

### 1. GPT-5 (OpenAI) ✅
- **Provider**: OpenAI
- **Status**: Available
- **Strengths**: Advanced reasoning, natural language understanding
- **API Key**: OpenAI API Key
- **Cost**: Premium

### 2. Claude Sonnet 4.5 (Anthropic) 🔜
- **Provider**: Anthropic
- **Status**: Coming Soon
- **Strengths**: Long context, ethical reasoning
- **API Key**: OpenAI API Key (compatible)
- **Cost**: Premium

### 3. Gemini 2.5 Pro (Google) 🔜
- **Provider**: Google
- **Status**: Coming Soon
- **Strengths**: Multimodal, fast inference
- **API Key**: OpenAI API Key (compatible)
- **Cost**: Premium

### 4. Qwen Max (Alibaba Cloud) ✅
- **Provider**: Alibaba Cloud
- **Status**: Available
- **Strengths**: Chinese market understanding, cost-effective
- **API Key**: Qwen API Key
- **Cost**: Low
- **API Endpoint**: `https://dashscope.aliyuncs.com/compatible-mode/v1`

### 5. DeepSeek Chat (DeepSeek AI) ✅
- **Provider**: DeepSeek AI
- **Status**: Available
- **Strengths**: Mathematical reasoning, quantitative analysis
- **API Key**: DeepSeek API Key
- **Cost**: Very Low
- **API Endpoint**: `https://api.deepseek.com`

## 📊 Model Comparison

| Model | Provider | Cost | Speed | Reasoning | Chinese Support |
|-------|----------|------|-------|-----------|-----------------|
| GPT-5 | OpenAI | 💰💰💰 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Claude 4.5 | Anthropic | 💰💰💰 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Gemini 2.5 | Google | 💰💰💰 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Qwen Max | Alibaba | 💰 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| DeepSeek | DeepSeek | 💰 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🔑 How to Get API Keys

### OpenAI (GPT-5)
1. Visit: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)
5. **Cost**: ~$0.01-0.03 per prediction

### Qwen (Alibaba Cloud)
#### 方式一：国际版（推荐）

1. 访问 Alibaba Cloud (国际版)
https://www.alibabacloud.com/

2. 注册账号
- 点击右上角 "Free Account"
- 可以使用邮箱或手机注册
- 支持国际信用卡

3. 开通 DashScope 服务
- 访问：https://www.alibabacloud.com/product/dashscope
- 或搜索 "Model Studio" / "DashScope"
- 点击 "Try for Free" 或 "Get Started"

4. 创建 API Key
- 进入控制台：https://bailian.console.aliyun.com/
- 找到 "API Keys" 或 "Access Keys"
- 点击 "Create API Key"
- 复制生成的 Key（格式：`sk-...`）

5. 获取免费额度
- 新用户有免费试用额度
- 价格：约 $0.001-0.007/次调用

**国际版优势**：
- ✅ 支持国际信用卡
- ✅ 英文界面
- ✅ 无需中国手机号
- ✅ 更稳定的国际访问

#### 方式二：中国版（需要中国手机号）

1. 访问阿里云 DashScope
https://dashscope.aliyuncs.com/

2. 注册/登录
- 使用阿里云账号登录
- 需要中国手机号验证
- 可能需要实名认证

3. 创建 API Key
- 控制台：https://dashscope.console.aliyun.com/
- API Key 管理：https://dashscope.console.aliyun.com/apiKey

**注意**：中国版和国际版的 API Key 不通用！

### DeepSeek
1. Visit: https://platform.deepseek.com/
2. Register account
3. Go to API Keys
4. Create new key
5. Copy the key (starts with `sk-...`)
6. **Cost**: ~¥0.001-0.01 per prediction (~$0.0001-0.001)
7. **Free Tier**: 5M tokens free for new users

## 💡 Which Model to Choose?

### For Best Accuracy
- **GPT-5** or **Claude Sonnet 4.5**
- Best for: Complex market analysis, global markets
- Cost: High but worth it for serious trading

### For Cost-Effectiveness
- **Qwen Max** or **DeepSeek Chat**
- Best for: Frequent predictions, testing strategies
- Cost: 10-100x cheaper than GPT-5

### For Chinese Markets
- **Qwen Max**
- Best understanding of Chinese crypto market dynamics
- Native Chinese language support

### For Mathematical Analysis
- **DeepSeek Chat**
- Excellent at quantitative analysis
- Strong in technical indicator interpretation

## 🚀 Setup Instructions

### 1. Add API Keys in Settings

Click the **Settings** button (⚙️) in the top right corner:

```
Settings → API Keys
```

Enter your keys:
- ✅ **AsterDEX API Key** (Required)
- ✅ **AsterDEX API Secret** (Required)
- ⭕ **OpenAI API Key** (Optional - for GPT-5)
- ⭕ **Qwen API Key** (Optional - for Qwen Max)
- ⭕ **DeepSeek API Key** (Optional - for DeepSeek Chat)

### 2. Select Model in Prediction Card

In the **AI Market Prediction** card:

1. Click the **AI Model** dropdown
2. Select your preferred model:
   - GPT-5 (OpenAI)
   - Qwen Max (Alibaba Cloud)
   - DeepSeek Chat (DeepSeek AI)
3. Click **Analyze Market**

### 3. View Results

The prediction will include:
- 📈 Market trend (Bullish/Bearish/Neutral)
- 💯 Confidence level
- 🎯 Price targets
- 📊 Technical indicators (RSI, MACD, EMA)
- ⚡ Trading signals (Entry, Stop-loss, Take-profit)
- 🧠 Historical accuracy

## 🔧 Technical Details

### API Integration

All models use OpenAI-compatible API format:

```python
# OpenAI
client = OpenAI(api_key="sk-...")
model = "gpt-4"

# Qwen
client = OpenAI(
    api_key="sk-...",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)
model = "qwen-max"

# DeepSeek
client = OpenAI(
    api_key="sk-...",
    base_url="https://api.deepseek.com"
)
model = "deepseek-chat"
```

### Response Format

All models return structured JSON:

```json
{
  "prediction": "bullish",
  "confidence": 85,
  "price_high": 68000,
  "price_low": 66000,
  "recommendation": "buy",
  "entry_price": 67000,
  "stop_loss": 65000,
  "take_profit": 71000,
  "position_size": 5,
  "technical_signals": [...],
  "sentiment": "...",
  "analysis": "..."
}
```

## 💰 Cost Comparison Example

For 100 predictions per day:

| Model | Daily Cost | Monthly Cost | Annual Cost |
|-------|-----------|--------------|-------------|
| GPT-5 | $2-3 | $60-90 | $720-1080 |
| Qwen Max | $0.10-0.70 | $3-21 | $36-252 |
| DeepSeek | $0.01-0.10 | $0.30-3 | $3.60-36 |

**Recommendation**: 
- Start with **DeepSeek** or **Qwen** for testing
- Upgrade to **GPT-5** for production trading

## 🎯 Best Practices

1. **Test Multiple Models**: Compare predictions from different models
2. **Use Cost-Effective Models for Testing**: Qwen/DeepSeek for development
3. **Use Premium Models for Real Trading**: GPT-5 for actual trades
4. **Monitor Accuracy**: Check historical performance of each model
5. **Combine Predictions**: Use multiple models and compare results

## 🔒 Security

- API keys are stored locally in browser localStorage
- Keys are never logged or exposed
- HTTPS encryption for all API calls
- Keys can be deleted anytime in Settings

## 📚 Resources

- **OpenAI Docs**: https://platform.openai.com/docs
- **Qwen Docs**: https://help.aliyun.com/zh/dashscope/
- **DeepSeek Docs**: https://platform.deepseek.com/docs
- **A101 Protocol**: See PROTOCOL_COMPARISON.md

## 🆘 Troubleshooting

### "API Key not configured"
- Make sure you've entered the correct API key in Settings
- Check that the key is for the correct provider
- Verify the key hasn't expired

### "Prediction failed"
- Check your API key balance
- Verify network connection
- Try a different model
- Check backend logs for details

### Model not available
- Claude and Gemini are coming soon
- Only GPT-5, Qwen, and DeepSeek are currently available

## 🎉 Summary

You now have access to **5 AI models** for market prediction:
- 🌟 **GPT-5**: Premium accuracy
- 🇨🇳 **Qwen Max**: Cost-effective + Chinese markets
- 🧮 **DeepSeek**: Mathematical analysis + ultra-low cost
- 🔜 **Claude & Gemini**: Coming soon

Choose the model that fits your needs and budget! 🚀
