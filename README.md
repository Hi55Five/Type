# Type ⌨️

**A modern typing practice application to improve your keyboard skills.**

## 🚀 Quick Start

```javascript
// Bookmarklet - Stable Version
javascript:fetch("https://cdn.jsdelivr.net/gh/Hi55Five/Type@main/src/App.js").then(t=>t.text()).then(eval);

// Development Version
javascript:fetch("https://cdn.jsdelivr.net/gh/Hi55Five/Type@dev/src/App.js").then(t=>t.text()).then(eval);

// Minimal Version
javascript:fetch("https://cdn.jsdelivr.net/gh/Hi55Five/Type@main/src/minimal.js").then(t=>t.text()).then(eval);
```

## ✨ Features

- ⏱️ **Timed Tests** - 1, 2, and 5-minute sessions
- 📊 **Real-time Analytics** - WPM, accuracy, and consistency tracking  
- ⌨️ **Visual Keyboard** - Interactive keyboard with highlight effects
- 🌍 **Multi-language** - Support for multiple languages
- 🌙 **Dark/Light Mode** - Adaptive interface themes
- 📈 **Progress Tracking** - Detailed statistics and progress over time
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## 🛠️ Local Development

```bash
git clone https://github.com/Hi55Five/Type.git
cd Type
npm install
npm start
```

Visit `http://localhost:3000` to start typing!

## 🎯 Usage

1. **Start Test** - Click the text area to begin
2. **Type Text** - Type the displayed text as accurately as possible  
3. **Track Metrics** - Watch real-time WPM and accuracy updates
4. **View Results** - See detailed statistics after completion
5. **Customize** - Adjust settings in the options menu

## 📊 Metrics

- **WPM** - Words per minute calculation
- **Accuracy** - Percentage of correct characters
- **Consistency** - Typing speed uniformity  
- **Progress** - Historical performance tracking

## 🏗️ Architecture

```
src/
├── components/          # React Components
│   ├── Header/         # Test information header
│   ├── TextDisplay/    # Typing text display
│   ├── Keyboard/       # Visual keyboard component
│   ├── Results/        # Results screen
│   └── Settings/       # Application settings
├── hooks/              # Custom Hooks
│   ├── useTypingTest.js    # Core typing logic
│   └── useLocalStorage.js  # Local storage management
├── utils/              # Utilities
│   ├── textGenerator.js    # Text generation
│   └── calculations.js     # Metric calculations
└── styles/             # Styling files
```

## 🔧 Technologies

- **React 18** - Core framework
- **CSS3** - Styling and animations
- **JavaScript ES6+** - Application logic
- **Local Storage API** - Data persistence
- **Web Vitals** - Performance metrics

## 🎨 Customization

- **Theme** - Light or dark mode
- **Test Duration** - 1, 2, or 5 minutes
- **Text Language** - Portuguese, English, Spanish
- **Difficulty Level** - Easy, Medium, Hard

---

**By creating this repository, I grant permission for everyone to use my code. However, since it is licensed under the MIT License, please maintain proper attribution.**

Thank you all for your support and contributions to improving typing skills worldwide!

As they say in the typing world:
*"Practice makes perfect, but perfect practice makes permanent."*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (C) 2024 Hi55Five

This program is free software; you can redistribute it and/or modify it under the terms of the MIT License. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the MIT License for more details.

**Happy Typing!** 🎯⌨️
