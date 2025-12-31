import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

let currentUser = null;

// Toggle password visibility
window.togglePasswordVisibility = function(inputId) {
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


window.toggleAuthForm = function() {
    document.getElementById('signupForm').style.display = 
        document.getElementById('signupForm').style.display === 'none' ? 'block' : 'none';
    document.getElementById('signinForm').style.display = 
        document.getElementById('signinForm').style.display === 'none' ? 'block' : 'none';
    clearAuthError();
}

window.handleSignup = async function() {
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

window.handleSignin = async function() {
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

window.handleLogout = async function() {
    try {
        const auth = window.auth;
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
    }
}

window.addTransaction = async function() {
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

window.deleteTransaction = async function(docId) {
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

        updateUI(transactions);
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

