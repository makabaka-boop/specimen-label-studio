export const STORAGE_KEY = 'specimen-label-draft';
export const TEMPLATE_STORAGE_KEY = 'specimen-label-templates';

export const defaultSpecimen = {
  id: '',
  templateId: '',
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

export const allFieldDefs = [
  { key: 'specimenNo', label: '标本编号', type: 'text', showOnLabel: true },
  { key: 'latinName', label: '拉丁名', type: 'text', showOnLabel: true },
  { key: 'collector', label: '采集人', type: 'text', showOnLabel: true },
  { key: 'collectionDate', label: '采集日期', type: 'date', showOnLabel: true },
  { key: 'longitude', label: '经度', type: 'text', showOnLabel: true },
  { key: 'latitude', label: '纬度', type: 'text', showOnLabel: true },
  { key: 'altitude', label: '海拔', type: 'text', showOnLabel: true },
  { key: 'habitat', label: '生境备注', type: 'textarea', showOnLabel: true }
];

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

const plantTemplateId = 'tpl_plant_default';
const insectTemplateId = 'tpl_insect_default';

export const defaultTemplates = [
  {
    id: plantTemplateId,
    name: '植物标本模板',
    labelTitle: '植物标本标签',
    isDefault: true,
    fields: [
      { key: 'specimenNo', label: '标本编号', visible: true, required: true, type: 'text', showOnLabel: true },
      { key: 'latinName', label: '拉丁名', visible: true, required: false, type: 'text', showOnLabel: true },
      { key: 'collector', label: '采集人', visible: true, required: false, type: 'text', showOnLabel: true },
      { key: 'collectionDate', label: '采集日期', visible: true, required: false, type: 'date', showOnLabel: true },
      { key: 'longitude', label: '经度', visible: true, required: false, type: 'text', showOnLabel: true },
      { key: 'latitude', label: '纬度', visible: true, required: false, type: 'text', showOnLabel: true },
      { key: 'altitude', label: '海拔', visible: true, required: false, type: 'text', showOnLabel: true },
      { key: 'habitat', label: '生境备注', visible: true, required: false, type: 'textarea', showOnLabel: true }
    ],
    settings: { ...defaultSettings }
  },
  {
    id: insectTemplateId,
    name: '昆虫标本模板',
    labelTitle: '昆虫标本标签',
    isDefault: false,
    fields: [
      { key: 'specimenNo', label: '标本编号', visible: true, required: true, type: 'text', showOnLabel: true },
      { key: 'latinName', label: '拉丁名', visible: true, required: false, type: 'text', showOnLabel: true },
      { key: 'collector', label: '采集人', visible: true, required: false, type: 'text', showOnLabel: true },
      { key: 'collectionDate', label: '采集日期', visible: true, required: false, type: 'date', showOnLabel: true },
      { key: 'longitude', label: '经度', visible: true, required: false, type: 'text', showOnLabel: true },
      { key: 'latitude', label: '纬度', visible: true, required: false, type: 'text', showOnLabel: true },
      { key: 'habitat', label: '生境备注', visible: true, required: false, type: 'textarea', showOnLabel: true }
    ],
    settings: { ...defaultSettings }
  }
];

export const getDefaultTemplateId = () => {
  const t = defaultTemplates.find(t => t.isDefault);
  return t ? t.id : defaultTemplates[0].id;
};

export const createTemplate = (name, labelTitle, fields, settings) => ({
  id: 'tpl_' + generateId(),
  name,
  labelTitle: labelTitle || name,
  isDefault: false,
  fields: fields || allFieldDefs.map(f => ({ ...f, visible: true, required: false })),
  settings: settings || { ...defaultSettings }
});

export const getTemplateById = (templates, id) => {
  return templates.find(t => t.id === id) || templates.find(t => t.isDefault) || templates[0];
};

export const getVisibleFields = (template) => {
  if (!template || !template.fields) return allFieldDefs;
  return template.fields.filter(f => f.visible);
};

export const getLabelFields = (template) => {
  if (!template || !template.fields) return allFieldDefs.filter(f => f.showOnLabel !== false);
  return template.fields.filter(f => f.visible && f.showOnLabel);
};

export const saveTemplatesToLocalStorage = (templates) => {
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
};

export const loadTemplatesFromLocalStorage = () => {
  const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

export const saveToLocalStorage = (data, settings, templates) => {
  const draft = { data, settings, templates, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const loadFromLocalStorage = () => {
  const draft = localStorage.getItem(STORAGE_KEY);
  return draft ? JSON.parse(draft) : null;
};

export const migrateSpecimens = (specimens, templates) => {
  const defaultId = getDefaultTemplateId();
  return specimens.map(s => {
    if (!s.templateId) {
      return { ...s, templateId: defaultId };
    }
    const exists = templates.some(t => t.id === s.templateId);
    if (!exists) {
      return { ...s, templateId: defaultId };
    }
    return s;
  });
};

export const exportToJSON = (data, settings, templates) => {
  const exportData = { data, settings, templates, exportedAt: new Date().toISOString() };
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

export const autoMapFields = (csvHeaders, template) => {
  const mapping = {};
  const allowedKeys = template && template.fields
    ? template.fields.filter(f => f.visible).map(f => f.key)
    : Object.keys(fieldMapping);

  csvHeaders.forEach(header => {
    const lowerHeader = header.toLowerCase();
    for (const [field, aliases] of Object.entries(fieldMapping)) {
      if (allowedKeys.includes(field) && aliases.some(alias => alias.toLowerCase() === lowerHeader)) {
        mapping[header] = field;
        break;
      }
    }
  });
  return mapping;
};
