# Convosight Data Processor v1.0

A modern web-based data processing tool for analyzing conversation data, creating structured datasets, and generating insights for Convosight analytics.

![Convosight Logo](logo.webp)

## 🚀 Features

### Data Creation
- **Step-by-step data processing pipeline** with 4 comprehensive steps
- **Username extraction** from conversation data
- **Table creation** with structured data formatting
- **Data matching and filling** for completeness
- **Category inference** with customizable keyword mappings
- **Category & Keyword Editor** - Full control over categorization rules

### CVI Creation
- Customer Value Index generation for conversation analysis
- Advanced metrics calculation and visualization

### Analysis Tools
- **Post Matrix** - Visual representation of conversation patterns
- **Missing Posts Detection** - Identify gaps in conversation data
- **Data Points Generation** - Automated insight extraction

### Additional Features
- **Drag & drop file uploads** for CSV and Excel files
- **Real-time progress indicators** and session management
- **Dark/Light theme support** with system preference detection
- **Export capabilities** for processed data
- **Local storage persistence** for user preferences and custom keywords

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + PostCSS
- **Data Processing**: PapaParse (CSV), XLSX (Excel)
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Backend**: Python (optional, for advanced processing)

## 📋 Prerequisites

- Node.js 16+ and npm
- Modern web browser with localStorage support
- Python 3.8+ (for backend features)

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wildcraft958/Convosight_data_processor_v1.0.git
   cd Convosight_data_processor_v1.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:5173` (default Vite port)

### Backend Setup (Optional)

If you need advanced backend processing:

```bash
# Ensure Python 3.8+ is installed
python --version

# Install backend dependencies (if backend/ folder exists)
pip install -r requirements.txt

# Start backend server
npm run backend
```

## 📖 Usage Guide

### Main Interface

The application features three main tabs:

1. **Data Creation** - Process raw conversation data into structured datasets
2. **CVI Creation** - Generate Customer Value Index metrics
3. **Analysis** - Analyze processed data with various tools

### Data Processing Workflow

#### Step 1: Extract Usernames
- Upload conversation data (CSV/Excel)
- Extract unique usernames from conversation threads
- Preview and validate extracted data

#### Step 2: Create Table
- Structure the data into tabular format
- Define column mappings and data types
- Handle missing values and data cleaning

#### Step 3: Match & Fill
- Match conversation entries with user data
- Fill missing information using pattern matching
- Validate data integrity

#### Step 4: Fill Categories
- Apply category inference using keyword mappings
- Customize categories with the built-in editor
- Export categorized data

### File Formats Supported

- **CSV** (.csv) - Comma-separated values
- **Excel** (.xlsx, .xls) - Microsoft Excel spreadsheets
- **JSON** - For keyword configurations

## ⚙️ Category & Keyword Editor Guide

### Overview

The **Category & Keyword Editor** is a powerful feature that allows users to create and customize keyword mappings for category inference. Instead of hardcoded keywords, you now have complete control over:

- **Creating new categories** with custom names
- **Adding/removing keywords** for each category
- **Exporting and importing** keyword configurations
- **Resetting to defaults** at any time

### Accessing the Editor

1. Navigate to **Data Creation** tab
2. Go to **Step 4: Fill Final Category**
3. Click the **⚙️ Edit Keywords** button in the top right

### Features

#### 1. **View Current Keywords**

All your categories and their associated keywords are displayed with:
- Category name
- Number of keywords
- All keywords as blue tags

#### 2. **Add New Category**

In the "Add New Category" section:
1. Enter a category name (e.g., "Hair Care", "Pet Products")
2. Click **Add Category** or press Enter
3. The new category appears in the list with 0 keywords

#### 3. **Edit Keywords**

For each category:

1. Click the **Edit** button
2. You'll see a text area where you can:
   - Enter keywords **comma-separated** or **line-separated**
   - Each keyword is normalized to lowercase
   - Remove individual keywords by clicking the **✕** on keyword tags

Example formats:
```
shampoo, conditioner, hair oil
```
or
```
shampoo
conditioner
hair oil
```

3. Click **Done Editing** to save and collapse the editor

#### 4. **Delete Category**

Click the **Delete** button next to any category to remove it (confirmation required).

#### 5. **Export Keywords**

Save your keyword mapping as a JSON file:
1. Click **📥 Export as JSON**
2. The file `category-keywords.json` will download
3. Share this file with team members or keep as backup

**JSON Format:**
```json
{
  "Detergent": ["detergent", "powder", "laundry"],
  "Hair Care": ["shampoo", "conditioner", "hair oil"],
  "Not Relevant": ["pest", "lizard"]
}
```

#### 6. **Import Keywords**

Load a previously saved keyword configuration:
1. Click **📤 Import from JSON**
2. Select your `category-keywords.json` file
3. Your keywords will be loaded and validated

#### 7. **Reset to Defaults**

Restore the original hardcoded keywords:
1. Click **⟲ Reset to Defaults**
2. Confirm the action
3. All custom keywords are discarded

#### 8. **Save & Close**

After making changes:
1. Click **✓ Save & Close**
2. Keywords are saved to browser's local storage
3. The categorization results are cleared (you'll need to reprocess)
4. Editor closes and returns to Step 4

### How It Works

#### Storage
- Custom keywords are saved in **browser's local storage** under the key `custom_keywords`
- They persist across browser sessions
- Your data is stored locally on your device

#### Categorization
When you click "Fill Final Category":
1. System loads your current keywords (custom or default)
2. Converts them to regex patterns with word boundaries
3. Applies patterns in order to categorize entries
4. First matching pattern wins

#### Example Logic
If your keywords are:
```json
{
  "Detergent": ["detergent", "powder"],
  "Fabric Care": ["fabric", "softener"]
}
```

And input is "fabric softener", it will be categorized as **"Fabric Care"** (first match).

### Best Practices

#### ✅ DO
- Keep keyword lists concise and specific
- Use lowercase (system normalizes automatically)
- Test with sample data before processing large datasets
- Export keywords regularly as backup
- Use common variations of terms

#### ❌ DON'T
- Use regex metacharacters unless necessary: `[`, `]`, `(`, `)`, `|`, `?`, `*`, `+`, `{`, `}`, `^`, `$`, `.`, `-`, `\`
- Have overlapping high-priority keywords (first match wins)
- Create empty categories without keywords
- Trust uncommitted changes (save before closing)

### Troubleshooting

#### Issue: Categorization seems wrong after editing keywords

**Solution:**
1. Edit the keyword map
2. Click Save & Close
3. The previous results are cleared (intentional)
4. Re-upload your data and click "Fill Final Category" again

#### Issue: Keywords aren't persisting

**Solution:**
1. Ensure browser allows localStorage
2. Check if you clicked "Save & Close" in the editor
3. Try exporting keywords as backup and reimporting

#### Issue: Special characters in keywords

**Solution:**
- For patterns with regex characters (`-`, `?`, etc.), the system handles escaping automatically
- For complex patterns, consider simpler keywords instead

### Advanced: Keyword Pattern Examples

#### Word Boundaries
By default, keywords use word boundaries (`\b`), so:
- `dish` matches "**dish**washer" and "**dish**" but not "red**dish**"
- `soap` matches "liquid **soap**" but not "s**oap** water"

#### Regex Patterns
For advanced users, you can use basic regex in keywords:
- `multi[- ]?purpose` matches "multi-purpose" and "multi purpose"
- `air[- ]?freshener` matches both variants

### Workflow Example

#### Scenario: Categorize product mentions

1. **Create categories:**
   - Cleaning Products
   - Personal Care
   - Not Relevant

2. **Add keywords:**
   - Cleaning: "soap", "detergent", "cleaner", "scrub"
   - Personal Care: "shampoo", "conditioner", "lotion", "cream"
   - Not Relevant: "pest", "insect", "price"

3. **Export** for team sharing

4. **Test** with sample CSV

5. **Adjust** keywords based on results

6. **Download** final categorized data

## 🔧 Development

### Project Structure

```
src/
├── components/
│   ├── Analysis/          # Analysis tools
│   ├── common/            # Shared components
│   ├── CVICreation/       # CVI generation
│   └── DataCreation/      # Data processing pipeline
├── context/               # React context providers
├── hooks/                 # Custom React hooks
└── utils/                 # Utility functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run backend` - Start Python backend (if available)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting sections above
2. Ensure browser localStorage is enabled
3. Verify file formats are supported
4. Check browser console for error messages (F12 → Console)

---

**Happy data processing! 🎉**
