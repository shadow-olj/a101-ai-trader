# GitHub Upload Guide

## Prerequisites

1. Install Git (if not already installed)
   - Download from: https://git-scm.com/downloads
   - Verify installation: git --version

2. Create GitHub Account
   - Sign up at: https://github.com

## Step-by-Step Guide

### 1. Create a New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: a101-ai-trader
3. Description: AI-powered cryptocurrency trading assistant with natural language interface
4. Choose Public or Private
5. DO NOT initialize with README, .gitignore, or license
6. Click Create repository

### 2. Initialize Local Git Repository

Open PowerShell in your project directory:

```powershell
# Navigate to project directory
cd h:/a402/a101-ai-trader

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: AI Trading Assistant with GPT-5, Claude Sonnet 4.5, Gemini 2.5 Pro"
```

### 3. Connect to GitHub Repository

Replace YOUR_USERNAME with your GitHub username:

```powershell
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/a101-ai-trader.git

# Verify remote
git remote -v
```

### 4. Push to GitHub

```powershell
# Push to main branch
git branch -M main
git push -u origin main
```

If prompted for credentials:
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your account password)

### 5. Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click Generate new token -> Generate new token (classic)
3. Name: a101-ai-trader-upload
4. Select scopes: repo (full control)
5. Click Generate token
6. Copy the token immediately
7. Use this token as your password when pushing

## Important Security Checks

Verify these files are NOT uploaded:
- .env (backend API keys)
- .env.local (frontend config)
- node_modules/ (dependencies)
- __pycache__/ (Python cache)

These are already in .gitignore and will be automatically excluded.

## After Upload

1. Go to: https://github.com/YOUR_USERNAME/a101-ai-trader
2. Verify all files are uploaded
3. Check .env files are NOT visible
4. Add repository description and topics
5. Consider adding a LICENSE file

## Future Updates

When you make changes:

```powershell
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

## Troubleshooting

### Error: remote origin already exists
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/a101-ai-trader.git
```

### Error: failed to push
```powershell
# Pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Authentication failed
- Make sure you're using a Personal Access Token, not your password
- Token must have repo scope enabled
