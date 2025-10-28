# Category & Keyword Editor Guide

## Overview

The **Category & Keyword Editor** is a powerful new feature that allows users to create and customize keyword mappings for category inference. Instead of hardcoded keywords, you now have complete control over:

- **Creating new categories** with custom names
- **Adding/removing keywords** for each category
- **Exporting and importing** keyword configurations
- **Resetting to defaults** at any time

## Accessing the Editor

1. Navigate to **Data Creation** tab
2. Go to **Step 4: Fill Final Category**
3. Click the **⚙️ Edit Keywords** button in the top right

## Features

### 1. **View Current Keywords**

All your categories and their associated keywords are displayed with:
- Category name
- Number of keywords
- All keywords as blue tags

### 2. **Add New Category**

In the "Add New Category" section:
1. Enter a category name (e.g., "Hair Care", "Pet Products")
2. Click **Add Category** or press Enter
3. The new category appears in the list with 0 keywords

### 3. **Edit Keywords**

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

### 4. **Delete Category**

Click the **Delete** button next to any category to remove it (confirmation required).

### 5. **Export Keywords**

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

### 6. **Import Keywords**

Load a previously saved keyword configuration:
1. Click **📤 Import from JSON**
2. Select your `category-keywords.json` file
3. Your keywords will be loaded and validated

### 7. **Reset to Defaults**

Restore the original hardcoded keywords:
1. Click **⟲ Reset to Defaults**
2. Confirm the action
3. All custom keywords are discarded

### 8. **Save & Close**

After making changes:
1. Click **✓ Save & Close**
2. Keywords are saved to browser's local storage
3. The categorization results are cleared (you'll need to reprocess)
4. Editor closes and returns to Step 4

## How It Works

### Storage
- Custom keywords are saved in **browser's local storage** under the key `custom_keywords`
- They persist across browser sessions
- Your data is stored locally on your device

### Categorization
When you click "Fill Final Category":
1. System loads your current keywords (custom or default)
2. Converts them to regex patterns with word boundaries
3. Applies patterns in order to categorize entries
4. First matching pattern wins

### Example Logic
If your keywords are:
```json
{
  "Detergent": ["detergent", "powder"],
  "Fabric Care": ["fabric", "softener"]
}
```

And input is "fabric softener", it will be categorized as **"Fabric Care"** (first match).

## Best Practices

### ✅ DO
- Keep keyword lists concise and specific
- Use lowercase (system normalizes automatically)
- Test with sample data before processing large datasets
- Export keywords regularly as backup
- Use common variations of terms

### ❌ DON'T
- Use regex metacharacters unless necessary: `[`, `]`, `(`, `)`, `|`, `?`, `*`, `+`, `{`, `}`, `^`, `$`, `.`, `-`, `\`
- Have overlapping high-priority keywords (first match wins)
- Create empty categories without keywords
- Trust uncommitted changes (save before closing)

## Troubleshooting

### Issue: Categorization seems wrong after editing keywords

**Solution:** 
1. Edit the keyword map
2. Click Save & Close
3. The previous results are cleared (intentional)
4. Re-upload your data and click "Fill Final Category" again

### Issue: Keywords aren't persisting

**Solution:**
1. Ensure browser allows localStorage
2. Check if you clicked "Save & Close" in the editor
3. Try exporting keywords as backup and reimporting

### Issue: Special characters in keywords

**Solution:**
- For patterns with regex characters (`-`, `?`, etc.), the system handles escaping automatically
- For complex patterns, consider simpler keywords instead

## Advanced: Keyword Pattern Examples

### Word Boundaries
By default, keywords use word boundaries (`\b`), so:
- `dish` matches "**dish**washer" and "**dish**" but not "red**dish**"
- `soap` matches "liquid **soap**" but not "s**oap** water"

### Regex Patterns
For advanced users, you can use basic regex in keywords:
- `multi[- ]?purpose` matches "multi-purpose" and "multi purpose"
- `air[- ]?freshener` matches both variants

## Workflow Example

### Scenario: Categorize product mentions

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

## Technical Details

### Files Modified
- `src/components/DataCreation/CategoryKeywordEditor.jsx` - New editor component
- `src/components/DataCreation/Step4FillCategory.jsx` - Integrated editor
- `src/utils/categoryInference.js` - Added dynamic keyword loading

### Storage Mechanism
- localStorage key: `custom_keywords`
- Format: JSON object
- Automatic fallback to defaults if not found

### Performance
- Regex compilation is cached for performance
- Cache invalidates when keywords change
- Suitable for datasets with thousands of entries

## Support

For issues or suggestions:
1. Check that browser localStorage is enabled
2. Try resetting to defaults
3. Verify JSON format if importing
4. Check browser console for error messages (F12 → Console)

---

**Happy categorizing! 🎉**
