# movie-universe-3d
Movie Universe 3D — Interactive 3D visualization of the highest-grossing films presented as a galaxy. Explore movie data (1997–2025) through stars: hover for titles, double-click for details, compare films. Rotate the galaxy with your mouse, use the timeline to travel through years. 🎬🌌


# 🎬 Cinema Galaxy - 3D Interactive Film Timeline

An interactive 3D visualization of the highest-grossing films (1997–2025) presented as a star galaxy. Explore film data through an immersive 3D space, compare box office earnings, and travel through cinematic history with an interactive timeline.



## 🌟 Live Demo

Visit the live application: [https://iandlama.github.io/movie-universe-3d/](https://iandlama.github.io/movie-universe-3d/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Data Pipeline](#data-pipeline)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Data Schema](#data-schema)
- [Deployment](#deployment)
- [Acknowledgments](#acknowledgments)


---

## 🎯 Overview

Cinema Galaxy transforms box office data into an interactive 3D galaxy where each film is represented as a glowing star. The visualization allows users to:

- **Explore films chronologically** along a spiral galaxy arm
- **Compare box office earnings** with an interactive chart
- **Travel through time** using a dynamic timeline slider
- **Discover film details** through hover tooltips and modal windows
- **Rotate and zoom** the 3D galaxy with mouse/touch controls

The project demonstrates the complete data pipeline from web scraping to interactive visualization, making it a comprehensive portfolio piece for data engineering and front-end development.

---

## ✨ Features

### 🎨 3D Visualization
- **Spiral galaxy layout** – Films arranged chronologically along a spiral arm
- **Color-coded stars** – Size and color based on box office earnings
- **Smooth animations** – Auto-rotation with manual drag control
- **Dynamic visibility** – Films appear/disappear based on selected year

### 🕹️ Interactive Controls
| Control | Function |
|---------|----------|
| **Year Slider** | Navigate through time (1997–2025) |
| **Play Button** | Auto-play timeline animation |
| **Reset Button** | Jump to 1997 (beginning of timeline) |
| **Reset View Button** | Return camera to default position |
| **Mouse Drag** | Rotate the 3D galaxy |
| **Hover** | Display film title and box office |
| **Double-click** | Open detailed film information |

### 📊 Film Comparison
- **Add up to 50 films** to comparison panel
- **Bar chart visualization** of box office earnings
- **Remove individual films** or clear all at once
- **Comparison panel appears automatically** when first film is added

### 🔍 Search & Navigation
- **Search films** by title with auto-suggest
- **"Now Playing" sidebar** shows films released in current year
- **Click on sidebar items** to view film details

### 📈 Statistics Panel
- Total films up to selected year
- Top-grossing film
- Cumulative box office earnings

---

## 🔄 Data Pipeline

The project follows a complete ETL (Extract, Transform, Load) pipeline:

```
Wikipedia → Web Scraping → CSV → SQLite → JSON → 3D Visualization
```

### Step 1: Web Scraping
- **Source:** [Wikipedia List of Highest-Grossing Films](https://en.wikipedia.org/wiki/List_of_highest-grossing_films)
- **Libraries:** `requests`, `BeautifulSoup`
- **Data extracted:** Title, year, box office, director, country, production companies
- **Features:** Retry logic, random delays, infobox parsing

### Step 2: Data Storage
- **CSV:** Raw scraped data
- **SQLite:** Structured database with schema
- **JSON:** Final format for frontend consumption

### Step 3: Frontend Visualization
- **Load JSON** via Fetch API
- **Render 3D stars** with Three.js
- **Interactive features** with vanilla JavaScript

---

## 🛠️ Technologies Used

### Backend / Data Processing
| Technology | Purpose |
|------------|---------|
| **Python 3** | Web scraping and data processing |
| **BeautifulSoup4** | HTML parsing |
| **Requests** | HTTP requests with retry logic |
| **Pandas** | Data manipulation |
| **SQLite3** | Database storage |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure |
| **CSS3** | Styling with glassmorphism effects |
| **JavaScript (ES6+)** | Dynamic interactions |
| **Three.js** | 3D rendering |
| **Chart.js** | Comparison bar charts |
| **Fetch API** | JSON data loading |

### Deployment
| Technology | Purpose |
|------------|---------|
| **GitHub Pages** | Static hosting |

---

## 💻 Installation

### Prerequisites
- Python 3.8+
- Web browser with WebGL support

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iandlama/movie-universe-3d.git
   cd movie-universe-3d
   ```

2. **Install Python dependencies (for data scraping):**
   ```bash
   pip install requests beautifulsoup4 pandas
   ```

3. **Run the Jupyter Notebook:**
   ```bash
   jupyter notebook DWV_as1.ipynb
   ```
   Execute all cells to scrape data and generate `films.json`

4. **Start a local server:**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using VS Code Live Server
   ```

5. **Open in browser:**
   ```
   http://localhost:8000
   ```

---

## 🎮 Usage Guide

### Navigation

| Action | Result |
|--------|--------|
| **Hover over a star** | See film title and box office |
| **Double-click a star** | Open detailed film modal |
| **Drag mouse** | Rotate the 3D galaxy |
| **Drag timeline slider** | Travel through years (1997–2025) |
| **Click PLAY** | Auto-play timeline animation |
| **Click film in "Now Playing"** | View film details |
| **Click ADD TO COMPARISON** | Add film to comparison panel |

### Film Comparison

1. **Double-click** any film star
2. Click **"ADD TO COMPARISON"** button
3. Add 2–50 films to see the bar chart
4. Compare box office earnings visually
5. Remove individual films with the ✕ button
6. Click **"Clear All"** to reset comparison

### Search

- Type film title in the search bar
- Select from suggestions
- Click **Find** or select from dropdown

---

## 📁 Project Structure

```
movie-universe-3d/
├── index.html              # Main web page
├── styles.css              # All CSS styles
├── script.js               # JavaScript logic (3D, UI, comparison)
├── films.json              # Film data from Wikipedia
├── DWV_as1.ipynb           # Jupyter Notebook with web scraping code
├── films.csv               # Raw scraped data (optional)
├── films.db                # SQLite database (optional)
└── README.md               # This file
```

---

## 📊 Data Schema

### `films.json` Structure

```json
{
  "title": "Avatar",
  "release_year": 2009,
  "director": "James Cameron",
  "box_office": 2923710708,
  "country": "United States; United Kingdom",
  "production_companies": "20th Century Fox; Lightstorm Entertainment"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Film title |
| `release_year` | integer | Year of release |
| `director` | string | Director name(s) |
| `box_office` | float | Worldwide gross in USD |
| `country` | string | Country of origin |
| `production_companies` | string | Production company/studio |

---

## 🚀 Deployment

The site is hosted on **GitHub Pages**:

1. **Push files to GitHub repository**
2. **Enable GitHub Pages** in repository Settings → Pages
3. **Select branch:** `main` and folder: `/ (root)`
4. **Wait 1-2 minutes** for deployment
5. **Access** at: `https://iandlama.github.io/movie-universe-3d/`

---




## 🙏 Acknowledgments

- Data source: [Wikipedia](https://en.wikipedia.org/wiki/List_of_highest-grossing_films)
- 3D library: [Three.js](https://threejs.org/)
- Charts: [Chart.js](https://www.chartjs.org/)
- Fonts: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)



---

**Enjoy exploring the Cinema Galaxy! 🌟🎬**
```
