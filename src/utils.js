export const STORAGE_KEY = 'specimen-label-draft';
export const TEMPLATES_STORAGE_KEY = 'specimen-label-templates';

export const defaultTemplateFields = [
  { key: 'specimenNo', label: '标本编号', type: 'text', showInLabel: true, order: 0, isTitle: true },
  { key: 'latinName', label: '拉丁名', type: 'text', showInLabel: true, order: 1, isItalic: true },
  { key: 'collector', label: '采集人', type: 'text', showInLabel: true, order: 2 },
  { key: 'collectionDate', label: '采集日期', type: 'date', showInLabel: true, order: 3 },
  { key: 'latitude', label: '纬度', type: 'text', showInLabel: true, order: 4 },
  { key: 'longitude', label: '经度', type: 'text', showInLabel: true, order: 5 },
  { key: 'altitude', label: '海拔', type: 'text', showInLabel: true, order: 6 },
  { key: 'habitat', label: '生境备注', type: 'textarea', showInLabel: true, order: 7 }
];

export const defaultLayoutSettings = {
  labelWidth: 50,
  labelHeight: 30,
  margin: 2,
  fontSize: 8,
  columns: 4,
  rows: 8,
  showQR: true,
  qrSize: 15
};

export const defaultTemplates = [
  {
    id: 'default-plant',
    name: '植物标本模板',
    description: '适用于植物标本的标签模板',
    fields: [
      { key: 'specimenNo', label: '标本编号', type: 'text', showInLabel: true, order: 0, isTitle: true },
      { key: 'latinName', label: '拉丁名', type: 'text', showInLabel: true, order: 1, isItalic: true },
      { key: 'chineseName', label: '中文名', type: 'text', showInLabel: true, order: 2 },
      { key: 'family', label: '科名', type: 'text', showInLabel: true, order: 3 },
      { key: 'collector', label: '采集人', type: 'text', showInLabel: true, order: 4 },
      { key: 'collectionDate', label: '采集日期', type: 'date', showInLabel: true, order: 5 },
      { key: 'location', label: '采集地点', type: 'text', showInLabel: true, order: 6 },
      { key: 'latitude', label: '纬度', type: 'text', showInLabel: false, order: 7 },
      { key: 'longitude', label: '经度', type: 'text', showInLabel: false, order: 8 },
      { key: 'altitude', label: '海拔', type: 'text', showInLabel: true, order: 9 },
      { key: 'habitat', label: '生境', type: 'textarea', showInLabel: true, order: 10 }
    ],
    layoutSettings: { ...defaultLayoutSettings },
    isDefault: true,
    isSystem: true
  },
  {
    id: 'default-insect',
    name: '昆虫标本模板',
    description: '适用于昆虫标本的标签模板',
    fields: [
      { key: 'specimenNo', label: '标本编号', type: 'text', showInLabel: true, order: 0, isTitle: true },
      { key: 'latinName', label: '拉丁名', type: 'text', showInLabel: true, order: 1, isItalic: true },
      { key: 'chineseName', label: '中文名', type: 'text', showInLabel: true, order: 2 },
      { key: 'order', label: '目', type: 'text', showInLabel: true, order: 3 },
      { key: 'family', label: '科', type: 'text', showInLabel: true, order: 4 },
      { key: 'collector', label: '采集人', type: 'text', showInLabel: true, order: 5 },
      { key: 'collectionDate', label: '采集日期', type: 'date', showInLabel: true, order: 6 },
      { key: 'location', label: '采集地点', type: 'text', showInLabel: true, order: 7 },
      { key: 'host', label: '寄主植物', type: 'text', showInLabel: true, order: 8 },
      { key: 'latitude', label: '纬度', type: 'text', showInLabel: false, order: 9 },
      { key: 'longitude', label: '经度', type: 'text', showInLabel: false, order: 10 },
      { key: 'altitude', label: '海拔', type: 'text', showInLabel: false, order: 11 },
      { key: 'remarks', label: '备注', type: 'textarea', showInLabel: true, order: 12 }
    ],
    layoutSettings: { ...defaultLayoutSettings, labelWidth: 60, labelHeight: 35 },
    isDefault: false,
    isSystem: true
  }
];

export const getDefaultTemplate = () => defaultTemplates.find(t => t.isDefault) || defaultTemplates[0];

export const getTemplateById = (templates, id) => templates.find(t => t.id === id) || getDefaultTemplate();

export const getTemplateFields = (template) => {
  return [...template.fields].sort((a, b) => a.order - b.order);
};

export const getVisibleFields = (template) => {
  return getTemplateFields(template).filter(f => f.showInLabel);
};

export const createEmptySpecimen = (templateId) => {
  const template = templateId ? getTemplateById(loadTemplates(), templateId) : getDefaultTemplate();
  const specimen = {
    id: generateId(),
    templateId: template.id
  };
  template.fields.forEach(field => {
    specimen[field.key] = '';
  });
  return specimen;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const saveTemplatesToLocalStorage = (templates) => {
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
};

export const loadTemplatesFromLocalStorage = () => {
  const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse templates from localStorage:', e);
    }
  }
  return [...defaultTemplates];
};

export const saveToLocalStorage = (data, settings, templates, activeTemplateId) => {
  const draft = { 
    data, 
    settings, 
    templates: templates || loadTemplatesFromLocalStorage(),
    activeTemplateId,
    savedAt: new Date().toISOString() 
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const loadFromLocalStorage = () => {
  const draft = localStorage.getItem(STORAGE_KEY);
  return draft ? JSON.parse(draft) : null;
};

export const exportToJSON = (data, settings, templates, activeTemplateId) => {
  const exportData = { 
    data, 
    settings, 
    templates: templates || loadTemplatesFromLocalStorage(),
    activeTemplateId,
    exportedAt: new Date().toISOString() 
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadFile(blob, 'specimen-labels.json');
};

export const migrateSpecimenToTemplate = (specimen, template) => {
  const migrated = { ...specimen, templateId: template.id };
  template.fields.forEach(field => {
    if (migrated[field.key] === undefined) {
      migrated[field.key] = '';
    }
  });
  return migrated;
};

export const handleTemplateDeletion = (specimens, templateId, defaultTemplateId) => {
  return specimens.map(specimen => {
    if (specimen.templateId === templateId) {
      return { ...specimen, templateId: defaultTemplateId };
    }
    return specimen;
  });
};

export const loadTemplates = () => {
  return loadTemplatesFromLocalStorage();
};

const commonFieldAliases = {
  specimenNo: ['标本编号', '编号', 'specimenNo', 'id', 'no', 'specimen_no'],
  latinName: ['拉丁名', '学名', 'latinName', 'scientificName', 'name', 'latin_name'],
  chineseName: ['中文名', '中文名称', 'chineseName', 'chinese_name'],
  collector: ['采集人', '采集者', 'collector', 'collectedBy', 'collected_by'],
  collectionDate: ['采集日期', '日期', 'collectionDate', 'date', 'collection_date'],
  location: ['采集地点', '地点', 'location', 'place'],
  longitude: ['经度', 'longitude', 'lng', 'lon'],
  latitude: ['纬度', 'latitude', 'lat'],
  altitude: ['海拔', 'altitude', 'elev', 'elevation'],
  habitat: ['生境', '生境备注', 'habitat', 'remarks'],
  family: ['科', '科名', 'family'],
  order: ['目', 'order'],
  host: ['寄主植物', '寄主', 'host'],
  remarks: ['备注', 'remarks', 'note']
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
      
      const headers = lines[0].split(',').map(h => h.trim());
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
  const templateFields = template ? template.fields : defaultTemplateFields;
  
  csvHeaders.forEach(header => {
    const lowerHeader = header.toLowerCase();
    for (const field of templateFields) {
      const aliases = commonFieldAliases[field.key] || [];
      const allAliases = [field.label, field.key, ...aliases];
      if (allAliases.some(alias => alias.toLowerCase() === lowerHeader)) {
        mapping[header] = field.key;
        break;
      }
    }
  });
  return mapping;
};
