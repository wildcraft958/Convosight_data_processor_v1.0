/**
 * Category inference from fill_final_category.py
 * EXACT keyword matching logic - NO modifications
 */

const RAW_KEYWORD_MAP = [
  ["Detergent", ["detergent", "detergent powder", "detergent pod", "laundry", "laundry pod", "powder", "bar", "wash"]],
  ["Fabric Enhancer", ["fabric", "softener", "conditioner", "whitener", "scent booster", "fabric enhancer", "fabric cleaner", "scentboost", "scent boost"]],
  ["Kitchen and Bathroom Cleaner", ["kitchen", "bathroom", "bath", "toilet", "dish", "dishwash", "dishwasher", "floor", "surface", "shower", "tap", "bkc", "harpic", "cleaner", "multi[- ]?purpose", "home cleaner", "homecare"]],
  ["Not Relevant", ["insect", "repellent", "ac cleaner", "air[- ]?freshener", "pest", "lizard", "mosquito", "ant repellent"]]
]

function compileKeywordMap(rawMap) {
  const metachars = new Set('\\[]()|?*+{}^$.-')
  const compiled = []

  for (const [label, patterns] of rawMap) {
    const parts = []
    for (const pat of patterns) {
      // Check if pattern contains regex metacharacters
      const hasMetachar = Array.from(pat).some(ch => metachars.has(ch))
      if (hasMetachar) {
        parts.push(pat)
      } else {
        // Escape and use word boundaries
        const escaped = pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        parts.push(`\\b${escaped}\\b`)
      }
    }
    const combined = `(?:${parts.join('|')})`
    try {
      const regex = new RegExp(combined, 'i')
      compiled.push([label, regex])
    } catch (e) {
      console.error(`Regex compilation error for ${label}:`, e)
    }
  }

  return compiled
}

const PATTERN_MAP = compileKeywordMap(RAW_KEYWORD_MAP)

function normalizeText(s) {
  if (!s) return ''
  const t = String(s).trim()
  return t.replace(/\s+/g, ' ')
}

export function inferFinalCategory(categoryText) {
  if (!categoryText) return 'Not Specified'

  const txt = normalizeText(categoryText)
  if (txt === '' || ['nan', 'not mentioned', 'not specified'].includes(txt.toLowerCase())) {
    return 'Not Specified'
  }

  // Try each compiled pattern in order; first match wins
  for (const [label, regex] of PATTERN_MAP) {
    try {
      if (regex.test(txt)) {
        return label
      }
    } catch (e) {
      continue
    }
  }

  // If nothing matched, return original trimmed category
  return txt
}

export function ensureFinalCategoryColumn(data, categoryCol = 'Category') {
  return data.map(row => {
    const finalCategory = row['Final Category']
    if (finalCategory && String(finalCategory).trim() !== '') {
      return row
    }

    const category = row[categoryCol]
    return {
      ...row,
      'Final Category': inferFinalCategory(category)
    }
  })
}

export function getDefaultKeywords() {
  return {
    'Detergent': ["detergent", "detergent powder", "detergent pod", "laundry", "laundry pod", "powder", "bar", "wash"],
    'Fabric Enhancer': ["fabric", "softener", "conditioner", "whitener", "scent booster", "fabric enhancer", "fabric cleaner", "scentboost", "scent boost"],
    'Kitchen and Bathroom Cleaner': ["kitchen", "bathroom", "bath", "toilet", "dish", "dishwash", "dishwasher", "floor", "surface", "shower", "tap", "bkc", "harpic", "cleaner", "multi-purpose", "home cleaner", "homecare"],
    'Not Relevant': ["insect", "repellent", "ac cleaner", "air freshener", "pest", "lizard", "mosquito", "ant repellent"]
  }
}
