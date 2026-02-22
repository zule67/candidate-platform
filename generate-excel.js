const XLSX = require('xlsx');
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet([
    { seniority: 'junior', years: 3, availability: true }
]);
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
XLSX.writeFile(wb, 'test-candidate.xlsx');
console.log('OK: test-candidate.xlsx generated');
