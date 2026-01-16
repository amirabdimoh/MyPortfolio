# JavaScript To-Do App 📝

A modern, feature-rich to-do list application built with vanilla JavaScript, demonstrating DOM manipulation, event handling, and LocalStorage integration.

![To-Do App Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=To-Do+App)

## ✨ Features

- ✅ **Add Tasks** - Create new tasks with a simple input
- ✏️ **Edit Tasks** - Modify existing tasks with a modal interface
- 🗑️ **Delete Tasks** - Remove tasks with confirmation
- ✔️ **Mark Complete** - Toggle task completion status
- 🔍 **Filter Tasks** - View all, active, or completed tasks
- 💾 **LocalStorage** - Persist tasks across browser sessions
- 🧹 **Clear Completed** - Bulk delete all completed tasks
- 📱 **Responsive Design** - Works on all device sizes
- 🎨 **Modern UI** - Clean, intuitive interface with animations
- 🔔 **Notifications** - Success and error feedback messages

## 🛠 Technologies Used

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with animations and transitions
- **JavaScript (ES6+)** - Object-oriented programming with classes
- **LocalStorage API** - Client-side data persistence

## 📂 Project Structure

```
todo-app/
│
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── script.js           # JavaScript logic and DOM manipulation
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required!

### Installation

1. Clone or download the project:
```bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app
```

2. Open `index.html` in your browser:
   - Double-click the file, or
   - Right-click and select "Open with" your browser, or
   - Use a local development server

### Using a Local Server (Optional)

**VS Code Live Server:**
```bash
# Install Live Server extension
# Right-click index.html > Open with Live Server
```

**Python:**
```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Node.js:**
```bash
npx http-server
```

## 💡 How to Use

### Adding Tasks
1. Type your task in the input field
2. Click "Add Task" or press Enter
3. Task appears at the top of the list

### Editing Tasks
1. Click the ✏️ edit icon on any task
2. Modify the text in the modal
3. Click "Save Changes" or press Enter

### Completing Tasks
1. Click the checkbox next to a task
2. Task gets marked with a strikethrough
3. Task moves to "Completed" filter

### Filtering Tasks
- **All** - Shows all tasks
- **Active** - Shows only incomplete tasks
- **Completed** - Shows only completed tasks

### Deleting Tasks
1. Click the 🗑️ delete icon
2. Confirm the deletion
3. Task is permanently removed

### Clearing Completed
1. Click "Clear Completed" button
2. Confirm bulk deletion
3. All completed tasks are removed

## 🎯 Key JavaScript Concepts Demonstrated

### 1. Object-Oriented Programming
```javascript
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
    }
}
```

### 2. LocalStorage Integration
```javascript
// Save tasks
saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
}

// Load tasks
loadTasks() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}
```

### 3. DOM Manipulation
```javascript
createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    // ... dynamic content creation
}
```

### 4. Event Handling
```javascript
attachEventListeners() {
    this.addTaskBtn.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addTask();
    });
}
```

### 5. Array Methods
```javascript
// Filter tasks
getFilteredTasks() {
    return this.tasks.filter(t => !t.completed);
}

// Delete task
deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
}
```

## 🎨 Features Breakdown

### Task Management
- Unique ID generation using timestamp and random string
- Task object structure: `{ id, text, completed, createdAt }`
- CRUD operations (Create, Read, Update, Delete)

### Data Persistence
- Automatic save to LocalStorage on every change
- Load tasks on page initialization
- Data survives browser refresh and closure

### User Experience
- Real-time task counter for each filter
- Smooth animations and transitions
- Confirmation dialogs for destructive actions
- Toast notifications for user feedback
- Empty state when no tasks exist

### Security
- XSS prevention with HTML escaping
- Input validation and sanitization
- Maximum character limit (100 chars)

## 📱 Responsive Design

- **Desktop** (> 640px): Full layout with side-by-side elements
- **Mobile** (≤ 640px): Stacked layout, optimized touch targets

## 🔧 Customization

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;
    --success-color: #10b981;
    --danger-color: #ef4444;
}
```

### Modify Task Limit
Change `maxlength` in `index.html`:
```html
<input maxlength="100" ...>
```

### Add New Features
Extend the `TaskManager` class in `script.js`:
```javascript
class TaskManager {
    // Add your custom methods here
}
```

## 🌐 Deployment

### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/todo-app.git
git push -u origin main
```

Enable GitHub Pages in repository settings.

### Other Options
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your GitHub repository
- **Surge**: `npm install -g surge && surge`

## ✅ Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ DOM manipulation and traversal
- ✅ Event handling and delegation
- ✅ LocalStorage API usage
- ✅ Object-oriented JavaScript
- ✅ Array methods (filter, map, find)
- ✅ ES6+ features (classes, arrow functions, template literals)
- ✅ Responsive design principles
- ✅ User experience best practices

## 🚀 Future Enhancements

- [ ] Drag and drop to reorder tasks
- [ ] Task categories/tags
- [ ] Due dates and reminders
- [ ] Priority levels
- [ ] Search functionality
- [ ] Dark mode toggle
- [ ] Export/import tasks
- [ ] Task statistics dashboard

## 📸 Screenshots

### Desktop View
![Desktop](https://via.placeholder.com/800x400/667eea/ffffff?text=Desktop+View)

### Mobile View
![Mobile](https://via.placeholder.com/400x800/667eea/ffffff?text=Mobile+View)

### Edit Modal
![Edit Modal](https://via.placeholder.com/600x400/667eea/ffffff?text=Edit+Modal)

## 🤝 Contributing

Feel free to fork this project and add your own features. Pull requests are welcome!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourusername)

## 🙏 Acknowledgments

- Inspired by modern task management applications
- Built as part of a portfolio project series
- Demonstrates fundamental JavaScript skills for 2026

---

⭐ If you found this helpful, please give it a star on GitHub!

**Built with ❤️ using vanilla JavaScript**
