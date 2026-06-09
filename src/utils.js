export const STORAGE_KEY = 'specimen-label-draft';

export const generateId = () => Math.random().toString(36).substr(2, 9);

// ====== 默认布局参数（模板的排版参数） ======
export const defaultLayout = {
  labelWidth: 50,
  labelHeight: 30,
  margin: 2,
  fontSize: 8,
  columns: 4,
  rows: 8,
  showQR: true,
  qrSize: 15
};

// ====== 内置模板 ======
// 字段定义：
//   key: 字段标识
//   label: 表单/导入界面显示的中文名
//   type: 'text' | 'date' | 'textarea' | 'number'
//   visible: 是否在标签上展示
//   prefix: 标签上展示时的前缀，例如 "采集人: "
//   style: 标签上的额外样式标记，可选 'bold' | 'italic' | 'muted'
//   aliases: CSV 自动映射别名
const plantFields = [
  { key: 'specimenNo', label: '标本编号', type: 'text', visible: true, prefix: '', style: 'bold',
    aliases: ['标本编号', '编号', 'specimenNo', 'id', 'no'] },
  { key: 'latinName', label: '拉丁名', type: 'text', visible: true, prefix: '', style: 'italic',
    aliases: ['拉丁名', '学名', 'latinName', 'scientificName', 'name'] },
  { key: 'family', label: '科名', type: 'text', visible: true, prefix: '科: ',
    aliases: ['科', '科名', 'family'] },
  { key: 'collector', label: '采集人', type: 'text', visible: true, prefix: '采集人: ',
    aliases: ['采集人', '采集者', 'collector', 'collectedBy'] },
  { key: 'collectionDate', label: '采集日期', type: 'date', visible: true, prefix: '日期: ',
    aliases: ['采集日期', '日期', 'collectionDate', 'date'] },
  { key: 'longitude', label: '经度', type: 'text', visible: true, prefix: '经: ',
    aliases: ['经度', 'longitude', 'lng'] },
  { key: 'latitude', label: '纬度', type: 'text', visible: true, prefix: '纬: ',
    aliases: ['纬度', 'latitude', 'lat'] },
  { key: 'altitude', label: '海拔', type: 'text', visible: true, prefix: '海拔: ',
    aliases: ['海拔', 'altitude', 'elev'] },
  { key: 'habitat', label: '生境备注', type: 'textarea', visible: true, prefix: '', style: 'muted',
    aliases: ['生境', '生境备注', 'habitat', 'remarks'] }
];

const insectFields = [
  { key: 'specimenNo', label: '标本编号', type: 'text', visible: true, prefix: '', style: 'bold',
    aliases: ['标本编号', '编号', 'specimenNo', 'id', 'no'] },
  { key: 'latinName', label: '拉丁名', type: 'text', visible: true, prefix: '', style: 'italic',
    aliases: ['拉丁名', '学名', 'latinName', 'scientificName', 'name'] },
  { key: 'order', label: '目', type: 'text', visible: true, prefix: '目: ',
    aliases: ['目', 'order'] },
  { key: 'family', label: '科', type: 'text', visible: true, prefix: '科: ',
    aliases: ['科', '科名', 'family'] },
  { key: 'host', label: '寄主', type: 'text', visible: true, prefix: '寄主: ',
    aliases: ['寄主', 'host'] },
  { key: 'collector', label: '采集人', type: 'text', visible: true, prefix: '采集人: ',
    aliases: ['采集人', '采集者', 'collector', 'collectedBy'] },
  { key: 'collectionDate', label: '采集日期', type: 'date', visible: true, prefix: '日期: ',
    aliases: ['采集日期', '日期', 'collectionDate', 'date'] },
  { key: 'locality', label: '采集地', type: 'text', visible: true, prefix: '地点: ',
    aliases: ['采集地', '地点', 'locality', 'place'] },
  { key: 'altitude', label: '海拔', type: 'text', visible: true, prefix: '海拔: ',
    aliases: ['海拔', 'altitude', 'elev'] },
  { key: 'remarks', label: '备注', type: 'textarea', visible: true, prefix: '', style: 'muted',
    aliases: ['备注', 'remarks', 'note'] }
];

export const builtinTemplates = [
  {
    id: 'plant',
    name: '植物标本模板',
    title: '植物标本',
    builtin: true,
    fields: plantFields,
    layout: { ...defaultLayout }
  },
  {
    id: 'insect',
    name: '昆虫标本模板',
    title: '昆虫标本',
    builtin: true,
    fields: insectFields,
    layout: { ...defaultLayout, labelWidth: 45, labelHeight: 25, fontSize: 7 }
  }
];

export const defaultActiveTemplateId = 'plant';

// 获取模板，找不到时回退第一个
export const findTemplate = (templates, id) => {
  return templates.find(t => t.id === id) || templates[0];
};

// 创建新模板
export const createTemplate = (name) => ({
  id: generateId(),
  name: name || '新模板',
  title: name || '新模板',
  builtin: false,
  fields: [
    { key: 'specimenNo', label: '编号', type: 'text', visible: true, prefix: '', style: 'bold',
      aliases: ['编号', 'specimenNo', 'id'] },
    { key: 'latinName', label: '名称', type: 'text', visible: true, prefix: '', style: 'italic',
      aliases: ['名称', 'name', '学名'] }
  ],
  layout: { ...defaultLayout }
});

// 基于模板生成空标本（仅包含模板字段）
export const buildSpecimenFromTemplate = (template) => {
  const obj = { id: generateId(), templateId: template.id };
  template.fields.forEach(f => { obj[f.key] = ''; });
  return obj;
};

// ====== 本地持久化 ======
export const saveToLocalStorage = ({ specimens, templates, activeTemplateId }) => {
  const draft = {
    data: specimens,
    templates,
    activeTemplateId,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const loadFromLocalStorage = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// 旧版本数据迁移：缺少 templates / 标本未带 templateId 时，套用默认模板
export const migrateDraft = (draft) => {
  if (!draft) {
    return {
      specimens: [],
      templates: cloneTemplates(builtinTemplates),
      activeTemplateId: defaultActiveTemplateId
    };
  }

  let templates = Array.isArray(draft.templates) && draft.templates.length > 0
    ? draft.templates
    : cloneTemplates(builtinTemplates);

  // 确保至少包含一个内置模板
  if (!templates.some(t => t.id === 'plant')) {
    templates = [...cloneTemplates([builtinTemplates[0]]), ...templates];
  }

  let activeTemplateId = draft.activeTemplateId;
  if (!templates.some(t => t.id === activeTemplateId)) {
    activeTemplateId = templates[0].id;
  }

  // 兼容旧 settings 字段：若存在则把它合到 plant 模板的 layout 上
  if (draft.settings && templates[0]) {
    const plant = templates.find(t => t.id === 'plant');
    if (plant) {
      plant.layout = { ...plant.layout, ...draft.settings };
    }
  }

  const specimens = (draft.data || []).map(s => {
    if (s.templateId && templates.some(t => t.id === s.templateId)) return s;
    return { ...s, templateId: activeTemplateId };
  });

  return { specimens, templates, activeTemplateId };
};

const cloneTemplates = (list) => JSON.parse(JSON.stringify(list));

// 当模板被删除时，把使用该模板的标本迁移到 fallback 模板
export const reassignSpecimens = (specimens, deletedTemplateId, fallbackTemplateId) => {
  return specimens.map(s =>
    s.templateId === deletedTemplateId
      ? { ...s, templateId: fallbackTemplateId }
      : s
  );
};

// ====== 导出 ======
export const exportToJSON = (specimens, templates, activeTemplateId) => {
  const exportData = {
    data: specimens,
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

// ====== CSV ======
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

// 根据模板字段进行 CSV 列自动映射
export const autoMapFieldsByTemplate = (csvHeaders, template) => {
  const mapping = {};
  csvHeaders.forEach(header => {
    const lowerHeader = String(header).toLowerCase();
    for (const field of template.fields) {
      const aliases = field.aliases || [field.key, field.label];
      if (aliases.some(alias => String(alias).toLowerCase() === lowerHeader)) {
        mapping[header] = field.key;
        break;
      }
    }
  });
  return mapping;
};
