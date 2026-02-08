# GitHub Setup Guide - Money Manager Pro

## 📋 Steps to Push to GitHub

### 1. Create a New Repository on GitHub

1. Go to [GitHub](https://github.com) and log in
2. Click the **"+"** icon in the top-right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `Money_Manager_Pro`
   - **Description**: "Cloud-based personal finance tracker with budgets and analytics"
   - **Visibility**: Public or Private
   - **DO NOT** initialize with README (we have one)
5. Click **"Create repository"**

### 2. Connect & Push

Copy the repository URL from GitHub (e.g., `https://github.com/YOUR_USERNAME/Money_Manager_Pro.git`)

Run these commands in your project folder (`e:\Website_Development\Money_Management`):

```powershell
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/Money_Manager_Pro.git

# Rename branch to main
git branch -M main

# Push code
git push -u origin main
```

*(Note: If it asks for a password, use your GitHub Personal Access Token)*

### 3. All Set! 🚀
Refresh your GitHub page to see your finance tracker code online.
