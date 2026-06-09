export const STORAGE_KEY = 'specimen-label-draft';

export const defaultSpecimen = {
  id: '',
  specimenNo: '',
  latinName: '',
  collector: '',
  collectionDate: '',
  longitude: '',
  latitude: '',
  altitude: '',
  habitat: ''
};

export const defaultSettings = {
  labelWidth: 50,
  labelHeight: 30,
  margin: 2,
  fontSize: 8,
  columns: 4,
  rows: 8,
  showQR: true,
  qrSize: 15
};

export const fieldMapping = {
  specimenNo: ['标本编号', '编号', 'specimenNo', 'id', 'no'],
  latinName: ['拉丁名', '学名', 'latinName', 'scientificName', 'name'],
  collector: ['采集人', '采集者', 'collector', 'collectedBy'],
  collectionDate: ['采集日期', '日期', 'collectionDate', 'date'],
  longitude: ['经度', 'longitude', 'lng'],
  latitude: ['纬度', 'latitude', 'lat'],
  altitude: ['海拔', 'altitude', 'elev'],
  habitat: ['生境', '生境备注', 'habitat', 'remarks']
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const saveToLocalStorage = (data, settings) => {
  const draft = { data, settings, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const loadFromLocalStorage = () => {
  const draft = localStorage.getItem(STORAGE_KEY);
  return draft ? JSON.parse(draft) : null;
};

export const exportToJSON = (data, settings) => {
  const exportData = { data, settings, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadFile(blob, 'specimen-labels.json');
};

export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        reject(new Error('CSV文件格式不正确'));
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
      
      resolve({ headers, data });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const autoMapFields = (csvHeaders) => {
  const mapping = {};
  csvHeaders.forEach(header => {
    const lowerHeader = header.toLowerCase();
    for (const [field, aliases] of Object.entries(fieldMapping)) {
      if (aliases.some(alias => alias.toLowerCase() === lowerHeader)) {
        mapping[header] = field;
        break;
      }
    }
  });
  return mapping;
};
