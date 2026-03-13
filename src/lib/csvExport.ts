/**
 * Sanitize CSV cell values to prevent formula injection attacks
 * Prefixes dangerous characters (=, +, -, @) with a single quote
 */
export const sanitizeCSVCell = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  const str = String(value).trim();
  
  // Prefix formula characters with single quote to prevent execution
  if (str.match(/^[=+\-@]/)) {
    return `'${str}`;
  }
  
  return str;
};

/**
 * Export data to CSV file with proper sanitization
 */
export const exportToCSV = (data: any[], filename: string = 'export.csv') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Sanitize and create CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(obj => 
      headers.map(header => sanitizeCSVCell(obj[header])).join(',')
    )
  ];
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
