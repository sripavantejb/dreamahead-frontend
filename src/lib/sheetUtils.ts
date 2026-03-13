// Utility functions for fetching and parsing Google Sheets data
import { Parser } from 'expr-eval';

// Live data sources - published CSV from Google Sheets
// These URLs auto-refresh with cache: 'no-store' to reflect sheet updates instantly
export const SIGNUP_COLLEGES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7Ww7dz2wsKrJ_hjxBiHeat3Et711C-p30QmtErUtUa_We4BGs0IAbHN3v3qP1DQ/pub?output=csv";
export const COURSE_FIT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZMg06akthiIEf_BBWQGX48Gv9DdzcU1_nV9gFpRLRVq_n74oQ91IKAzgkOa-iSw/pub?output=csv";

/**
 * Parse CSV text into array of objects
 */
export const parseCSV = (csvText: string): any[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }
  
  return rows;
};

/**
 * Fetch colleges data from Google Sheets
 */
export const fetchCollegesData = async () => {
  try {
    const response = await fetch(SIGNUP_COLLEGES_SHEET_URL, { cache: 'no-store' });
    const csvText = await response.text();
    const data = parseCSV(csvText);
    
    // Validate and sanitize data
    const { validateCollegeData } = await import('./sheetValidation');
    const validatedData = validateCollegeData(data);
    
    // Filter by sheet type
    const colleges = validatedData.filter(row => row.type === 'college' || !row.type);
    const states = validatedData.filter(row => row.type === 'state').map(r => r.state);
    const streams = validatedData.filter(row => row.type === 'stream');
    
    return { colleges, states, streams };
  } catch (error) {
    console.error('Error fetching colleges data:', error);
    // Return fallback data
    return {
      colleges: [],
      states: [],
      streams: []
    };
  }
};

/**
 * Fetch course fit test data from flat sheet
 */
export const fetchCourseFitData = async () => {
  try {
    const response = await fetch(COURSE_FIT_SHEET_URL, { cache: 'no-store' });
    const csvText = await response.text();
    const data = parseCSV(csvText);
    
    // Validate and sanitize data
    const { validateCourseFitData } = await import('./sheetValidation');
    const validatedData = validateCourseFitData(data);
    
    // Organize by type
    const questions = validatedData.filter(row => row.type === 'question');
    const options = validatedData.filter(row => row.type === 'option');
    const rules = validatedData.filter(row => row.type === 'rule');
    const courses = validatedData.filter(row => row.type === 'course');
    const uiTexts = validatedData.filter(row => row.type === 'ui_text');
    
    // Create UI copy object
    const uiCopy: Record<string, string> = {};
    uiTexts.forEach(item => {
      if (item.ui_key) {
        uiCopy[item.ui_key] = item.ui_value || '';
      }
    });
    
    return { questions, options, rules, courses, uiCopy };
  } catch (error) {
    console.error('Error fetching course fit data:', error);
    // Return fallback empty data
    return {
      questions: [],
      options: [],
      rules: [],
      courses: [],
      uiCopy: {}
    };
  }
};

/**
 * Parse weights string (e.g., "CSE:+2;Tech:+1") into object
 */
export const parseWeights = (weightsStr: string): Record<string, number> => {
  if (!weightsStr) return {};
  
  const weights: Record<string, number> = {};
  const pairs = weightsStr.split(';').map(s => s.trim());
  
  pairs.forEach(pair => {
    const [trait, value] = pair.split(':').map(s => s.trim());
    if (trait && value) {
      weights[trait] = parseInt(value.replace('+', ''), 10) || 0;
    }
  });
  
  return weights;
};

/**
 * Evaluate rule expression (e.g., "CSE>=2 OR Tech>=2")
 * Uses safe expression parser to prevent code injection
 */
export const evaluateRule = (expression: string, traitScores: Record<string, number>): boolean => {
  if (!expression) return false;
  
  try {
    const parser = new Parser();
    
    // Replace AND/OR with operators the parser understands
    const safeExpr = expression
      .replace(/\bAND\b/g, 'and')
      .replace(/\bOR\b/g, 'or');
    
    // Evaluate with trait scores as variables
    const result = parser.evaluate(safeExpr, traitScores);
    
    return Boolean(result);
  } catch (error) {
    console.error('Error evaluating rule:', expression, error);
    return false;
  }
};
