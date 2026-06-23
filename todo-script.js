const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const clearBtn = document.getElementById('clearBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTasksSpan = document.getElementById('totalTasks');
const activeTasksSpan = document.getElementById('activeTasks');
const completedTasksSpan = document.getElementById('completedTasks');

let todos = [];
let currentFilter = 'all';

const STORAGE_KEY = 'todos';

// Load todos from local storage
function loadTodos() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        todos = JSON.parse(saved);
    }
    renderTodos();
    updateStats();
}

// Save todos to local storage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };
    
    todos.unshift(todo);
    saveTodos();
    todoInput.value = '';
    todoInput.focus();
    renderTodos();
    updateStats();
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Clear all completed todos
function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) {
        alert('No completed tasks to clear!');
        return;
    }
    
    if (confirm(`Delete ${completedCount} completed task(s)?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Filter todos based on current filter
function getFilteredTodos() {
    switch(currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Render todos to the DOM
function renderTodos() {
    todoList.innerHTML = '';
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No tasks yet. Add one to get started!</div>';
        return;
    }
    
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
        `;
        todoList.appendChild(li);
    });
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    
    totalTasksSpan.textContent = total;
    activeTasksSpan.textContent = active;
    completedTasksSpan.textContent = completed;
    
    clearBtn.disabled = completed === 0;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

clearBtn.addEventListener('click', clearCompleted);

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Initialize app
loadTodos();
