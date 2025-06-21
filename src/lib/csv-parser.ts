import Papa from 'papaparse';

export interface GenericCSVData {
  [key: string]: string;
}

export function parseCSV(csvText: string): GenericCSVData[] {
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim()
  });

  if (results.errors.length > 0) {
    console.warn('CSV parsing warnings:', results.errors);
  }

  const data: GenericCSVData[] = results.data.map((row: any) => {
    const cleanedRow: GenericCSVData = {};
    
    // Process each field and remove empty/null values
    Object.keys(row).forEach(key => {
      const value = row[key] || '';
      if (value && value !== 'null' && value !== '' && value.trim() !== '') {
        cleanedRow[key] = value.trim();
      }
    });

    return cleanedRow;
  });

  return data;
}

export function dataToString(data: GenericCSVData[]): string {
  if (data.length === 0) {
    return 'No data found in the CSV file.';
  }

  // Get all unique column names
  const allColumns = new Set<string>();
  data.forEach(row => {
    Object.keys(row).forEach(key => allColumns.add(key));
  });
  const columns = Array.from(allColumns);

  // Create a summary of the data
  const summary = [
    `Dataset Summary:`,
    `- Total records: ${data.length}`,
    `- Columns: ${columns.join(', ')}`,
    `- Sample data:`,
    ''
  ];

  // Add first few rows as examples
  const sampleSize = Math.min(5, data.length);
  for (let i = 0; i < sampleSize; i++) {
    const row = data[i];
    const rowData = columns.map(col => `${col}: ${row[col] || 'N/A'}`).join(', ');
    summary.push(`Row ${i + 1}: ${rowData}`);
  }

  // If there are more rows, indicate that
  if (data.length > sampleSize) {
    summary.push(`... and ${data.length - sampleSize} more rows`);
  }

  return summary.join('\n');
} 