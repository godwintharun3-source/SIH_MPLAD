import * as XLSX from 'xlsx';

/**
 * Export data array to Microsoft Excel (.xlsx) file with auto-width formatting
 * @param {Array<Object>} data - Array of row objects to export
 * @param {string} filename - Base name of the file (without extension)
 * @param {string} sheetName - Name of the worksheet tab
 */
export const exportToExcel = (data, filename = 'MPLAD_Export', sheetName = 'Audit Data') => {
  if (!data || !data.length) {
    console.warn('No data provided to exportToExcel');
    return;
  }

  // Create worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-calculate column widths
  const keys = Object.keys(data[0] || {});
  const colWidths = keys.map((key) => {
    let maxLen = String(key).length;
    for (let i = 0; i < Math.min(data.length, 100); i++) {
      const val = data[i][key];
      if (val !== undefined && val !== null) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
  });
  worksheet['!cols'] = colWidths;

  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  // Write file
  const dateStr = new Date().toISOString().split('T')[0];
  const safeFilename = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
};
