# Money Manager Pro 💰

A powerful, cloud-based personal finance tracker built with vanilla JavaScript and Firebase.

## 🚀 Features

### Core Finance Tools
- **Transaction Tracking**: Add income and expenses with categories (Food, Transport, etc).
- **Edit & Delete**: Full control over your transaction history.
- **Smart Filtering**: Filter by Date (This Month, Last Month), Category, or Type.
- **Search**: (Coming soon) Find specific transactions instantly.

### Visual Analytics 📊
- **Dashboard**: Real-time view of Total Balance, Income, Expenses, and Savings Rate.
- **Spending Chart**: Interactive doughnut chart visualizing expenses by category.
- **Monthly Reports**: Month-over-month comparison scorecard with trend indicators.
- **Budget Management**: Set monthly limits per category with visual progress bars (Yellow/Red warnings).

### User Experience ✨
- **Dark Mode**: Fully supported dark theme for night usage.
- **Secure Auth**: Firebase Authentication with Email/Password.
- **Data Export**: Download your entire financial history as CSV.
- **Responsive**: Works perfectly on Desktop, Tablet, and Mobile.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (CSS Variables), JavaScript (ES6 Modules)
- **Backend / Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Visualization**: Chart.js
- **Icons**: SVG & Emoji based UI

## 📦 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Money_Manager_Pro.git
   cd Money_Manager_Pro
   ```

2. **Open the App**
   Simply open `public/index.html` in your browser.
   
   *Note: For ES6 modules to work locally, you might need a local server (e.g., Live Server extension in VS Code).*

3. **Firebase Configuration**
   The app uses a configuration file `public/firebase-config.js`. For production, replace the credentials with your own Firebase project keys.

## 🔒 Privacy & Security

Your data is stored securely in the cloud via Google Firebase. 
- **Authentication**: Encrypted logic handles sign-in/sign-up.
- **Data Isolation**: Firestore security rules ensure you only see your own data.

## 🤝 Contributing

Contributions are welcome!
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
**Manage your money, master your life.** 💸
