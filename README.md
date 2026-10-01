# 📚 Kids KDP Activity Studio

> An automated, cloud-ready web application that generates age-appropriate children's activity books (mazes, word searches, dot-to-dot, coloring pages, mini-sudoku) and exports them as print-ready digital products for sale on Amazon KDP.

---

## 🚀 Key Features

### 1. 🧩 Puzzle Generator Module
- **Mazes**: Built with Recursive Backtracking and loopiness/braid calibration. Solved using Breadth-First Search (BFS) to guarantee zero unsolvable labyrinths.
- **Word Searches**: Themed vocabulary lists (Animals, Space, Dinosaurs, Fantasy, Underwater, Jungle). Age-wise orientation rules (Ages 4–6: only left-to-right and top-to-bottom; 7–9: diagonals; 10+: all 8 directions including backwards).
- **Dot-to-Dot**: Parametric vector silhouettes (Rocket, Dinosaur, Butterfly, Whale, Sailboat, Castle, Teddy, Star). Dynamic point density scaling based on age level.
- **Coloring Outlines**: Clean vector line art with preschool bold outlines (3.5px) and intricate scenes for older kids.
- **Kids Sudoku**: 4x4 mini-sudoku (Ages 4–6), 6x6 (Ages 7–9), and 9x9 (Ages 10+) with guaranteed unique solutions.

### 2. 🛡️ Quality Control (QC) Layer
- **Automated Verification**: BFS pathfinding verification for mazes, collision checking for word searches, and duplicate detection across the entire book.
- **Interactive Page Inspector**: Live preview mode allowing human inspection, live answer key overlay toggle, and 1-click single-page regeneration with fresh random seeds.

### 3. 📖 Book Assembly & KDP-Ready PDF Engine
- **Standard 8.5" × 11" Layout**: The #1 selling format for kids' activity books on Amazon.
- **Front Matter**: Title page, "This Book Belongs To" presentation page, and clear instructions.
- **Single-Sided Page Option**: Automatically inserts blank doodle backing pages behind each activity to prevent marker and pen bleed-through.
- **Solutions Appendix**: Condensed 4-per-page answer key section and completion certificate.
- **Print Resolution**: Razor-sharp vector rendering at 300 DPI compliance via `pdf-lib`.

### 4. 🎨 Cover Design Automation
- **KDP Full-Wrap Cover**: Front cover, spine, back cover, and 0.125" standard bleed.
- **Dynamic Spine Calculation**: `Spine = Page Count × 0.002252"` (for standard 55# white paper).
- **Barcode Safe Zone**: Pre-configured 2" × 1.2" reserved area on the lower right of the back cover.
- **3D Mockup & 2D Wrap View**: Instant visual verification before downloading the PDF.

### 5. 🎯 Amazon KDP SEO & Marketing Helper
- **7 Amazon Backend Search Term Boxes**: Formatted to meet Amazon KDP rules (under 50 characters each, high search-volume phrases, non-redundant).
- **HTML Product Description**: Formatted with Amazon-approved tags (`<b>`, `<h3>`, `<ul>`, `<li>`) ready to paste into the KDP dashboard.
- **Recommended Browse Paths & Categories**: Official BISAC / Amazon categories for children's activity books.
- **1-Click Copy & TXT Download**: Export the complete metadata package.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas-Confetti.
- **PDF Engine**: `pdf-lib` with SVG-to-canvas 300 DPI vector rasterization.
- **Test Runner**: `tsx` automated test suite.

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3333`.

### 3. Run Automated Tests
```bash
npm test
```
Executes 47 automated tests verifying puzzle generation, solvability checks, QC engine, spine math, and SEO limits.

### 4. Build for Production
```bash
npm run build
```

---

## 📦 Amazon KDP Upload Checklist

1. **Paperback Details**:
   - Title & Subtitle: Copy from the **Amazon SEO Suite** tab.
   - Author: Use your pen name.
   - Description: Copy the formatted HTML from the SEO tab.
   - 7 Keywords: Paste the 7 search term boxes into KDP's keyword fields.
   - Categories: Select *Children's Books > Activities, Crafts & Games > Activity Books*.
2. **Paperback Content**:
   - Interior & Paper: *Black & white interior with white paper*.
   - Trim Size: *8.5 x 11 in (21.59 x 27.94 cm)*.
   - Bleed Settings: *Bleed (PDF only)*.
   - Cover Finish: *Glossy (Recommended)*.
   - Upload your downloaded Interior PDF and Full-Wrap Cover PDF.
