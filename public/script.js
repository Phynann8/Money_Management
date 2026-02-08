import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUser = null;
let allTransactions = []; // Global cache for CSV export and budgets

// Toggle password visibility
window.togglePasswordVisibility = function (inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId + 'Icon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        `;
    } else {
        input.type = 'password';
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        `;
    }
}

// Initialize Firebase
async function initFirebase() {
    try {
        let auth = window.auth;
        let db = window.db;

        if (!auth || !db) {
            showAuthError('Firebase is loading... Please wait a moment and refresh the page.');
            setTimeout(initFirebase, 1000);
            return;
        }

        console.log('Firebase v12 initialized successfully');

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                await autoCreateUserDocument();
                showAppScreen();
            } else {
                showAuthScreen();
            }
        });
    } catch (error) {
        console.error('Firebase initialization error:', error);
        showAuthError('Firebase initialization failed: ' + error.message);
    }
}

async function autoCreateUserDocument() {
    try {
        const db = window.db;
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                email: currentUser.email,
                createdAt: new Date(),
                displayName: currentUser.email.split('@')[0]
            });
            console.log('User document created automatically');
        } else {
            // Check if fullName is missing for existing users
            if (!userDoc.data().fullName) {
                const fullName = prompt('Welcome! Please enter your full name to complete your profile:');

                if (fullName && fullName.trim() !== '') {
                    await setDoc(userRef, {
                        fullName: fullName.trim(),
                        displayName: fullName.trim()
                    }, { merge: true });

                    console.log('Full name added to existing user');
                }
            }
        }
    } catch (error) {
        console.error('Error creating user document:', error);
    }
}



function showAuthScreen() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
}

async function showAppScreen() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';

    // Load user data and display full name
    try {
        const db = window.db;
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().fullName) {
            document.getElementById('userEmail').textContent = userDoc.data().fullName;
        } else {
            document.getElementById('userEmail').textContent = currentUser.email;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userEmail').textContent = currentUser.email;
    }

    document.getElementById('date').valueAsDate = new Date();
    loadTransactions();
}


window.toggleAuthForm = function () {
    document.getElementById('signupForm').style.display =
        document.getElementById('signupForm').style.display === 'none' ? 'block' : 'none';
    document.getElementById('signinForm').style.display =
        document.getElementById('signinForm').style.display === 'none' ? 'block' : 'none';
    clearAuthError();
}

window.handleSignup = async function () {
    const fullName = document.getElementById('signupFullName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!fullName || !email || !password) {
        showAuthError('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }

    try {
        document.getElementById('signupBtn').disabled = true;
        document.getElementById('signupBtn').innerHTML = '<span class="loading"></span>';

        const auth = window.auth;
        const db = window.db;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: email,
            fullName: fullName,
            displayName: email.split('@')[0],
            createdAt: new Date(),
            totalBalance: 0,
            totalIncome: 0,
            totalExpenses: 0
        });

        showAuthError('');
    } catch (error) {
        showAuthError(error.message);
    } finally {
        document.getElementById('signupBtn').disabled = false;
        document.getElementById('signupBtn').innerHTML = 'Create Account';
    }
}

window.handleSignin = async function () {
    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;

    if (!email || !password) {
        showAuthError('Please fill in all fields');
        return;
    }

    try {
        document.getElementById('signinBtn').disabled = true;
        document.getElementById('signinBtn').innerHTML = '<span class="loading"></span>';

        const auth = window.auth;
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        showAuthError(error.message);
    } finally {
        document.getElementById('signinBtn').disabled = false;
        document.getElementById('signinBtn').innerHTML = 'Sign In';
    }
}

window.handleLogout = async function () {
    try {
        const auth = window.auth;
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
    }
}

window.addTransaction = async function () {
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;
    const date = document.getElementById('date').value;

    if (!description || !amount || !category || !type || !date) {
        alert('Please fill in all fields');
        return;
    }

    try {
        document.getElementById('addBtn').disabled = true;
        document.getElementById('addBtn').textContent = 'Adding...';

        const db = window.db;

        await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
            description,
            amount,
            category,
            type,
            date,
            createdAt: new Date()
        });

        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('category').value = '';
        document.getElementById('type').value = 'expense';
        document.getElementById('date').valueAsDate = new Date();

        showSuccess('Transaction added successfully!');
        loadTransactions();
    } catch (error) {
        alert('Error adding transaction: ' + error.message);
    } finally {
        document.getElementById('addBtn').disabled = false;
        document.getElementById('addBtn').textContent = 'Add Transaction';
    }
}

window.deleteTransaction = async function (docId) {
    if (!confirm('Delete this transaction?')) return;

    try {
        const db = window.db;
        await deleteDoc(doc(db, 'users', currentUser.uid, 'transactions', docId));
        loadTransactions();
        showSuccess('Transaction deleted!');
    } catch (error) {
        alert('Error deleting transaction: ' + error.message);
    }
}

async function loadTransactions() {
    try {
        const db = window.db;

        const q = query(
            collection(db, 'users', currentUser.uid, 'transactions'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        let transactions = [];
        snapshot.forEach(doc => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        allTransactions = transactions; // Populate global cache
        updateUI(transactions);
        loadBudgets(); // Validate budget limits
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

function updateUI(transactions) {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;

    document.getElementById('totalBalance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `$${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${expenses.toFixed(2)}`;
    document.getElementById('savingsRate').textContent = `${savingsRate}%`;

    renderTransactions(transactions);
}

function renderTransactions(transactions) {
    if (transactions.length === 0) {
        document.getElementById('transactionsList').innerHTML =
            '<div class="empty-state">No transactions yet. Add one to get started!</div>';
        return;
    }

    const html = transactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${t.description}</div>
                <div class="transaction-meta">
                    <span class="transaction-category">${t.category}</span>
                    ${new Date(t.date).toLocaleDateString()}
                </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <div class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </div>
                <button class="btn-danger" onclick="deleteTransaction('${t.id}')">Delete</button>
            </div>
        </div>
    `).join('');

    document.getElementById('transactionsList').innerHTML = html;
}

function showAuthError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = message ? `<div class="error-message">${message}</div>` : '';
}

function clearAuthError() {
    document.getElementById('errorMessage').innerHTML = '';
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.innerHTML = `<div class="success-message">${message}</div>`;
    setTimeout(() => {
        successDiv.innerHTML = '';
    }, 3000);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}

// THEME UTILS
window.toggleTheme = function () {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('mmp-theme', next);
}

// Init theme on load
const savedTheme = localStorage.getItem('mmp-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// CHART LOGIC
let expenseChart = null;

function updateChart(transactions) {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    // Filter for expenses only
    const expenses = transactions.filter(t => t.type === 'expense');

    // Aggregate by category
    const categoryTotals = {};
    expenses.forEach(t => {
        if (categoryTotals[t.category]) {
            categoryTotals[t.category] += t.amount;
        } else {
            categoryTotals[t.category] = t.amount;
        }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // Colors for categories
    const backgroundColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#E7E9ED', '#764ba2', '#2080a0', '#ef4444'
    ];

    if (expenseChart) {
        expenseChart.destroy();
    }

    if (data.length === 0) {
        return;
    }

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--color-text')
                    }
                }
            }
        }
    });
}

// Hook into updateUI to refresh chart
const originalUpdateUI = updateUI;
updateUI = function (transactions) {
    originalUpdateUI(transactions);
    updateChart(transactions);
}

// EXPORT TO CSV
window.exportToCSV = function () {
    if (allTransactions.length === 0) {
        alert('No transactions to export');
        return;
    }

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'ID'];
    const rows = allTransactions.map(t => [
        t.date,
        `"${(t.description || '').replace(/"/g, '""')}"`, // Escape quotes properly
        t.category,
        t.type,
        t.amount,
        t.id
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `money_manager_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// MONTHLY REPORT LOGIC
window.showMonthlyReport = function () {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter data
    const thisMonthData = allTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthData = allTransactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    // Calculate Totals
    const calcExpenses = (data) => data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const calcIncome = (data) => data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    const thisExp = calcExpenses(thisMonthData);
    const lastExp = calcExpenses(lastMonthData);
    const thisInc = calcIncome(thisMonthData);

    let comparisonText = '';
    let trendClass = '';

    if (lastExp === 0) {
        comparisonText = "No data for last month";
        trendClass = "";
    } else {
        const diff = thisExp - lastExp;
        const percent = ((diff / lastExp) * 100).toFixed(1);
        if (diff > 0) {
            comparisonText = `${percent}% more than last month`;
            trendClass = "trend-up";
        } else {
            comparisonText = `${Math.abs(percent)}% less than last month`;
            trendClass = "trend-down";
        }
    }

    const html = `
        <div class="report-grid">
            <div class="report-card">
                <div class="report-label">This Month Income</div>
                <div class="report-value" style="color: var(--color-success)">+$${thisInc.toFixed(2)}</div>
            </div>
            <div class="report-card">
                <div class="report-label">This Month Spent</div>
                <div class="report-value" style="color: var(--color-danger)">-$${thisExp.toFixed(2)}</div>
            </div>
        </div>
        
        <div class="report-section-title">Analysis</div>
        <p style="text-align: center; margin-bottom: 20px;">
            Spending is <strong class="${trendClass}">${comparisonText}</strong>
        </p>

        <div class="report-section-title">Top Spending Category</div>
        ${getTopCategoryHTML(thisMonthData)}
    `;

    document.getElementById('reportContent').innerHTML = html;
    document.getElementById('reportModal').style.display = 'flex';
}

function getTopCategoryHTML(data) {
    const expenses = data.filter(t => t.type === 'expense');
    if (expenses.length === 0) return '<p class="text-secondary text-center">No expenses this month.</p>';

    const totals = {};
    expenses.forEach(t => totals[t.category] = (totals[t.category] || 0) + t.amount);

    // Sort
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];

    return `
        <div class="transaction-item" style="background: var(--color-bg);">
            <div class="transaction-info">
                <div class="transaction-description">${top[0]}</div>
            </div>
            <div class="transaction-amount expense">
                -$${top[1].toFixed(2)}
            </div>
        </div>
    `;
}

window.closeReportModal = function () {
    document.getElementById('reportModal').style.display = 'none';
}

// BUDGET LOGIC
window.openAddBudgetModal = function () {
    document.getElementById('budgetModal').style.display = 'flex';
}

window.closeBudgetModal = function () {
    document.getElementById('budgetModal').style.display = 'none';
}

window.saveBudget = async function () {
    const category = document.getElementById('budgetCategory').value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);

    if (!limit || limit <= 0) {
        alert("Please enter a valid limit");
        return;
    }

    try {
        const db = window.db;
        // Check if budget exists for this category (update) or add new
        // Ideally we query first. For simplicity, we'll just add/overwrite by using category as ID part or query.
        // Let's us use setDoc with a composite ID or just addDoc.
        // Using addDoc for now but we'll filter unique later or delete old.
        // Better: Use category as doc ID to enforce unique budget per category

        await setDoc(doc(db, 'users', currentUser.uid, 'budgets', category), {
            category,
            limit,
            updatedAt: new Date()
        });

        closeBudgetModal();
        loadBudgets();
        showSuccess('Budget set successfully!');
    } catch (error) {
        console.error(error);
        alert('Error saving budget');
    }
}

async function loadBudgets() {
    if (!currentUser) return;
    const db = window.db;
    try {
        const snapshot = await getDocs(collection(db, 'users', currentUser.uid, 'budgets'));
        let budgets = [];
        snapshot.forEach(doc => {
            budgets.push(doc.data());
        });
        renderBudgets(budgets);
    } catch (error) {
        console.log("No budgets found yet or error", error);
    }
}

function renderBudgets(budgets) {
    if (budgets.length === 0) {
        document.getElementById('budgetList').innerHTML = '<div class="empty-state" style="padding: 10px;">No budgets set.</div>';
        return;
    }

    // Calculate actual spending for this month for each budget category
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expensesThisMonth = allTransactions.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const html = budgets.map(b => {
        const spent = expensesThisMonth
            .filter(t => t.category === b.category)
            .reduce((sum, t) => sum + t.amount, 0);

        const pct = Math.min(100, Math.round((spent / b.limit) * 100));
        let colorClass = '';
        let alertIcon = '';
        if (pct > 100) {
            colorClass = 'danger';
            alertIcon = '🚨 OVER BUDGET!';
        } else if (pct > 90) {
            colorClass = 'danger';
            alertIcon = '⚠️ Almost exceeded';
        } else if (pct > 70) {
            colorClass = 'warning';
        }

        return `
            <div class="budget-item">
                <div class="budget-header">
                    <span class="budget-cat">${b.category}</span>
                    <span class="budget-amount">$${spent.toFixed(0)} / $${b.limit}</span>
                </div>
                <div class="budget-progress-bg">
                    <div class="budget-progress-fill ${colorClass}" style="width: ${pct}%"></div>
                </div>
                ${alertIcon ? `<div class="budget-alert ${colorClass}">${alertIcon}</div>` : ''}
            </div>
        `;
    }).join('');

    document.getElementById('budgetList').innerHTML = html;
}



