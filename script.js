let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expensesEl = document.getElementById('expenses');
const transactionList = document.getElementById('transaction-list');
const addBtn = document.getElementById('add-btn');
const categoryEl = document.getElementById('category');

let incomeExpenseChart;
let categoryChart;
let editId = null;

const categoryEmoji = {
  home_rent: "🏠",
  electricity: "💡",
  water: "🚰",
  maintenance: "🛠️",
  education: "🎓",
  wifi: "📶",
  funds: "💰",
  groceries: "🛒",
  toiletries: "🧴",
  skincare: "🧖‍♀️",
  haircare: "💇‍♀️",
  makeup: "💄",
  snacks: "🍿",
  drinks: "🥤",
  petrol: "⛽",
  diesel: "🚛",
  savings: "💾",
  health: "🩺",
  travel: "✈️"
};

addBtn.addEventListener('click', () => {
  const name = document.getElementById('name').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = categoryEl.value;

  if (!name || isNaN(amount)) {
    alert("Enter valid data");
    return;
  }

  if (editId) {
    transactions = transactions.map(t =>
      t.id === editId ? { ...t, name, amount, type, category } : t
    );
    editId = null;
    addBtn.textContent = "Add Transaction";
  } else {
    transactions.push({ id: Date.now(), name, amount, type, category });
  }

  localStorage.setItem('transactions', JSON.stringify(transactions));
  clearForm();
  updateDOM();
});

function editTransaction(id) {
  const t = transactions.find(t => t.id === id);
  document.getElementById('name').value = t.name;
  document.getElementById('amount').value = t.amount;
  document.getElementById('type').value = t.type;
  categoryEl.value = t.category;
  editId = id;
  addBtn.textContent = "Update Transaction";
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateDOM();
}

function clearForm() {
  document.getElementById('name').value = '';
  document.getElementById('amount').value = '';
}

function updateDOM() {
  transactionList.innerHTML = '';
  let income = 0, expense = 0;

  transactions.forEach(t => {
    const li = document.createElement('li');
    li.classList.add(t.type);
    li.innerHTML = `
      ${categoryEmoji[t.category]} ${t.name} - ₹${t.amount.toLocaleString('en-IN')}
      <div>
        <button class="edit-btn" onclick="editTransaction(${t.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
      </div>
    `;
    transactionList.appendChild(li);
    t.type === 'income' ? income += t.amount : expense += t.amount;
  });

  incomeEl.textContent = income.toLocaleString('en-IN');
  expensesEl.textContent = expense.toLocaleString('en-IN');
  balanceEl.textContent = (income - expense).toLocaleString('en-IN');

  renderCharts(income, expense);
}

function renderCharts(income, expense) {
  if (incomeExpenseChart) incomeExpenseChart.destroy();

  incomeExpenseChart = new Chart(document.getElementById('incomeExpenseChart'), {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#4caf50', '#f44336']
      }]
    },
    options: {
      responsive: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  const sums = {};
  transactions.filter(t => t.type === 'expense')
    .forEach(t => sums[t.category] = (sums[t.category] || 0) + t.amount);

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(sums).map(c => `${categoryEmoji[c]} ${c}`),
      datasets: [{ data: Object.values(sums) }]
    },
    options: { responsive: false, cutout: '70%' }
  });
}

updateDOM();
