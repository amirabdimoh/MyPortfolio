# Personal Portfolio Website 🚀

A modern, responsive personal portfolio website built with HTML, CSS, and JavaScript. Perfect for showcasing your projects and skills to potential employers and clients in 2026.

![Portfolio Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Portfolio+Website)

## ✨ Features

- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, professional design with smooth animations
- **Interactive Navigation** - Smooth scrolling and mobile-friendly hamburger menu
- **Project Showcase** - Display your best work with project cards
- **Contact Form** - Fully validated contact form with real-time error checking
- **Social Links** - Direct links to GitHub and LinkedIn profiles
- **Performance Optimized** - Fast loading and smooth animations

## 🛠 Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, animations, and custom properties
- **JavaScript (ES6+)** - Form validation, smooth scrolling, and interactive features

## 📂 Project Structure

```
portfolio-website/
│
├── index.html          # Main HTML file
├── styles.css          # All styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code, Sublime Text, etc.)
- Git installed on your computer

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portfolio-website.git
```

2. Navigate to the project directory:
```bash
cd portfolio-website
```

3. Open `index.html` in your browser:
   - Double-click the file, or
   - Right-click and select "Open with" your preferred browser, or
   - Use a local development server (recommended)

### Using a Local Development Server

**Option 1: VS Code Live Server**
- Install the "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

**Option 2: Python HTTP Server**
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

**Option 3: Node.js HTTP Server**
```bash
npx http-server
```

## 🎨 Customization

### 1. Personal Information

Edit `index.html` to add your personal details:

- **Line 31**: Change "Your Name" to your actual name
- **Line 32**: Update your title/role
- **Lines 38-39**: Add your GitHub and LinkedIn URLs
- **Lines 95-96**: Update your skills
- **Lines 110+**: Replace project information with your actual projects
- **Line 195**: Add your email address
- **Line 202**: Add your location

### 2. Color Scheme

Modify the CSS variables in `styles.css` (lines 9-18):

```css
:root {
    --primary-color: #6366f1;      /* Main brand color */
    --secondary-color: #8b5cf6;    /* Accent color */
    --text-color: #1f2937;         /* Main text color */
    /* ... more colors */
}
```

### 3. Projects

Replace the placeholder projects with your actual work:

1. Update project titles, descriptions, and tags
2. Add real project images (replace `.placeholder-image` divs)
3. Update GitHub repository links
4. Add live demo links

### 4. Profile Image (Optional)

Add your photo to the About section:

```html
<div class="about-image">
    <img src="your-photo.jpg" alt="Your Name">
</div>
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🌐 Deployment

### GitHub Pages (Recommended)

1. Create a new repository on GitHub named `yourusername.github.io`

2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

3. Your site will be live at `https://yourusername.github.io`

### Alternative Deployment Options

- **Netlify**: Drag and drop your folder to [Netlify](https://www.netlify.com/)
- **Vercel**: Connect your GitHub repo to [Vercel](https://vercel.com/)
- **Cloudflare Pages**: Deploy via [Cloudflare Pages](https://pages.cloudflare.com/)

## ✅ Features Checklist

- [x] Responsive navigation with mobile menu
- [x] Hero section with call-to-action buttons
- [x] About section with skills showcase
- [x] Projects grid with hover effects
- [x] Contact form with validation
- [x] Social media links
- [x] Smooth scrolling
- [x] Active navigation highlighting
- [x] Form validation with error messages
- [x] Scroll animations
- [x] Cross-browser compatibility

## 🎯 Future Enhancements

- [ ] Add dark mode toggle
- [ ] Integrate with a backend for contact form
- [ ] Add blog section
- [ ] Include testimonials
- [ ] Add project filtering by technology
- [ ] Implement loading animations
- [ ] Add analytics tracking

## 📸 Screenshots

### Desktop View
![Desktop View](https://via.placeholder.com/800x400/667eea/ffffff?text=Desktop+View)

### Mobile View
![Mobile View](https://via.placeholder.com/400x800/667eea/ffffff?text=Mobile+View)

### Projects Section
![Projects](https://via.placeholder.com/800x400/667eea/ffffff?text=Projects+Section)

## 🤝 Contributing

Feel free to fork this project and customize it for your own use. If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Design inspiration from modern portfolio trends
- Icons from inline SVG for better performance
- Color palette inspired by modern UI frameworks

---

⭐ If you found this helpful, please give it a star on GitHub!

**Built with ❤️ for the 2026 developer community**
