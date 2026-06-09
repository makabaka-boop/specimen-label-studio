export const STORAGE_KEY = 'specimen-label-draft';

export const FIELD_TYPES = {
  TEXT: 'text',
  DATE: 'date',
  TEXTAREA: 'textarea',
  NUMBER: 'number'
};

export const ALL_AVAILABLE_FIELDS = [
  { key: 'specimenNo', label: '标本编号', type: FIELD_TYPES.TEXT, prefix: '', suffix: '', aliases: ['标本编号', '编号', 'specimenNo', 'id', 'no'] },
  { key: 'latinName', label: '拉丁名', type: FIELD_TYPES.TEXT, prefix: '', suffix: '', isItalic: true, aliases: ['拉丁名', '学名', 'latinName', 'scientificName', 'name'] },
  { key: 'chineseName', label: '中文名', type: FIELD_TYPES.TEXT, prefix: '', suffix: '', aliases: ['中文名', '中文名称', 'chineseName'] },
  { key: 'collector', label: '采集人', type: FIELD_TYPES.TEXT, prefix: '采集人: ', suffix: '', aliases: ['采集人', '采集者', 'collector', 'collectedBy'] },
  { key: 'collectionDate', label: '采集日期', type: FIELD_TYPES.DATE, prefix: '日期: ', suffix: '', aliases: ['采集日期', '日期', 'collectionDate', 'date'] },
  { key: 'determiner', label: '鉴定人', type: FIELD_TYPES.TEXT, prefix: '鉴定人: ', suffix: '', aliases: ['鉴定人', '鉴定者', 'determiner', 'identifiedBy'] },
  { key: 'determineDate', label: '鉴定日期', type: FIELD_TYPES.DATE, prefix: '鉴定日期: ', suffix: '', aliases: ['鉴定日期', 'determineDate'] },
  { key: 'locality', label: '采集地点', type: FIELD_TYPES.TEXT, prefix: '地点: ', suffix: '', aliases: ['地点', '采集地点', 'locality', 'location'] },
  { key: 'longitude', label: '经度', type: FIELD_TYPES.NUMBER, prefix: '', suffix: '', aliases: ['经度', 'longitude', 'lng'] },
  { key: 'latitude', label: '纬度', type: FIELD_TYPES.NUMBER, prefix: '', suffix: '', aliases: ['纬度', 'latitude', 'lat'] },
  { key: 'altitude', label: '海拔', type: FIELD_TYPES.NUMBER, prefix: '海拔: ', suffix: 'm', aliases: ['海拔', 'altitude', 'elev'] },
  { key: 'habitat', label: '生境备注', type: FIELD_TYPES.TEXTAREA, prefix: '', suffix: '', aliases: ['生境', '生境备注', 'habitat', 'remarks'] },
  { key: 'family', label: '科名', type: FIELD_TYPES.TEXT, prefix: '', suffix: '', aliases: ['科', '科名', 'family'] },
  { key: 'genus', label: '属名', type: FIELD_TYPES.TEXT, prefix: '', suffix: '', aliases: ['属', '属名', 'genus'] },
  { key: 'sex', label: '性别', type: FIELD_TYPES.TEXT, prefix: '性别: ', suffix: '', aliases: ['性别', 'sex'] },
  { key: 'host', label: '寄主', type: FIELD_TYPES.TEXT, prefix: '寄主: ', suffix: '', aliases: ['寄主', 'host'] },
  { key: 'collectMethod', label: '采集方法', type: FIELD_TYPES.TEXT, prefix: '采集方法: ', suffix: '', aliases: ['采集方法', 'collectMethod'] }
];

export const fieldMapping = ALL_AVAILABLE_FIELDS.reduce((acc, field) => {
  acc[field.key] = field.aliases;
  return acc;
}, {});

export const getFieldConfig = (key) => {
  return ALL_AVAILABLE_FIELDS.find(f => f.key === key) || null;
};

export const defaultTemplateLayout = {
  labelWidth: 50,
  labelHeight: 30,
  margin: 2,
  fontSize: 8,
  columns: 4,
  rows: 8,
  showQR: true,
  qrSize: 15,
  titleFontSize: 10,
  titleBold: true
};

const createDefaultFields = (fieldKeys) => {
  return fieldKeys.map((key, index) => ({
    key,
    order: index,
    visible: true,
    customLabel: '',
    customPrefix: undefined,
    customSuffix: undefined
  }));
};

export const defaultTemplates = [
  {
    id: 'template-plant',
    name: '植物标本模板',
    title: '植物标本标签',
    isDefault: true,
    createdAt: new Date().toISOString(),
    layout: { ...defaultTemplateLayout },
    fields: createDefaultFields([
      'specimenNo', 'chineseName', 'latinName', 'family', 'collector',
      'collectionDate', 'locality', 'altitude', 'habitat'
    ])
  },
  {
    id: 'template-insect',
    name: '昆虫标本模板',
    title: '昆虫标本标签',
    isDefault: false,
    createdAt: new Date().toISOString(),
    layout: { ...defaultTemplateLayout, labelWidth: 40, labelHeight: 25, fontSize: 7 },
    fields: createDefaultFields([
      'specimenNo', 'latinName', 'chineseName', 'family', 'sex',
      'collector', 'collectionDate', 'locality', 'host', 'collectMethod'
    ])
  },
  {
    id: 'template-general',
    name: '通用标本模板',
    title: '标本标签',
    isDefault: false,
    createdAt: new Date().toISOString(),
    layout: { ...defaultTemplateLayout },
    fields: createDefaultFields([
      'specimenNo', 'latinName', 'collector', 'collectionDate',
      'longitude', 'latitude', 'altitude', 'habitat'
    ])
  }
];

export const defaultSpecimen = {
  id: '',
  templateId: 'template-general',
  specimenNo: '',
  latinName: '',
  chineseName: '',
  collector: '',
  collectionDate: '',
  determiner: '',
  determineDate: '',
  locality: '',
  longitude: '',
  latitude: '',
  altitude: '',
  habitat: '',
  family: '',
  genus: '',
  sex: '',
  host: '',
  collectMethod: ''
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateTemplateId = () => 'template-' + generateId();

const getTemplateFieldAliases = (template) => {
  const aliases = {};
  template.fields.forEach(tf => {
    if (tf.visible) {
      const fieldConfig = getFieldConfig(tf.key);
      if (fieldConfig) {
        aliases[tf.key] = fieldConfig.aliases;
      }
    }
  });
  return aliases;
};

export const saveToLocalStorage = (data, templates, activeTemplateId) => {
  const draft = {
    data,
    templates,
    activeTemplateId,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const loadFromLocalStorage = () => {
  const draft = localStorage.getItem(STORAGE_KEY);
  return draft ? JSON.parse(draft) : null;
};

export const initializeTemplates = () => {
  const saved = loadFromLocalStorage();
  if (saved && saved.templates && saved.templates.length > 0) {
    return {
      templates: saved.templates,
      activeTemplateId: saved.activeTemplateId || saved.templates[0].id
    };
  }
  return {
    templates: defaultTemplates,
    activeTemplateId: defaultTemplates[0].id
  };
};

export const getActiveTemplate = (templates, activeTemplateId) => {
  return templates.find(t => t.id === activeTemplateId) || templates[0] || defaultTemplates[0];
};

export const getTemplateVisibleFields = (template) => {
  return template.fields
    .filter(f => f.visible)
    .sort((a, b) => a.order - b.order);
};

export const createEmptySpecimenForTemplate = (template) => {
  const specimen = {
    id: generateId(),
    templateId: template.id
  };
  template.fields.forEach(f => {
    specimen[f.key] = '';
  });
  return specimen;
};

export const ensureSpecimenHasTemplateFields = (specimen, template) => {
  const updated = { ...specimen, templateId: template.id };
  template.fields.forEach(f => {
    if (!(f.key in updated)) {
      updated[f.key] = '';
    }
  });
  return updated;
};

export const getTemplateFieldLabel = (template, fieldKey) => {
  const templateField = template.fields.find(f => f.key === fieldKey);
  if (templateField?.customLabel) return templateField.customLabel;
  const fieldConfig = getFieldConfig(fieldKey);
  return fieldConfig?.label || fieldKey;
};

export const getTemplateFieldPrefix = (template, fieldKey) => {
  const templateField = template.fields.find(f => f.key === fieldKey);
  if (templateField?.customPrefix !== undefined) return templateField.customPrefix;
  const fieldConfig = getFieldConfig(fieldKey);
  return fieldConfig?.prefix || '';
};

export const getTemplateFieldSuffix = (template, fieldKey) => {
  const templateField = template.fields.find(f => f.key === fieldKey);
  if (templateField?.customSuffix !== undefined) return templateField.customSuffix;
  const fieldConfig = getFieldConfig(fieldKey);
  return fieldConfig?.suffix || '';
};

export const isFieldItalic = (fieldKey) => {
  const fieldConfig = getFieldConfig(fieldKey);
  return fieldConfig?.isItalic || false;
};

export const getFieldType = (fieldKey) => {
  const fieldConfig = getFieldConfig(fieldKey);
  return fieldConfig?.type || FIELD_TYPES.TEXT;
};

export const autoMapFieldsForTemplate = (csvHeaders, template) => {
  const templateAliases = getTemplateFieldAliases(template);
  const mapping = {};
  csvHeaders.forEach(header => {
    const lowerHeader = header.toLowerCase();
    for (const [field, aliases] of Object.entries(templateAliases)) {
      if (aliases.some(alias => alias.toLowerCase() === lowerHeader)) {
        mapping[header] = field;
        break;
      }
    }
  });
  return mapping;
};

export const exportToJSON = (data, templates, activeTemplateId) => {
  const exportData = {
    data,
    templates,
    activeTemplateId,
    exportedAt: new Date().toISOString()
  };
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

export const migrateSpecimensForTemplateChange = (specimens, oldTemplate, newTemplate) => {
  return specimens.map(s => {
    if (s.templateId !== oldTemplate.id) return s;
    const updated = { ...s, templateId: newTemplate.id };
    newTemplate.fields.forEach(f => {
      if (!(f.key in updated)) {
        updated[f.key] = '';
      }
    });
    return updated;
  });
};

export const handleTemplateDeleted = (specimens, deletedTemplateId, fallbackTemplateId) => {
  return specimens.map(s => {
    if (s.templateId === deletedTemplateId) {
      return { ...s, templateId: fallbackTemplateId };
    }
    return s;
  });
};
