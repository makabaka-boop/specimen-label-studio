import { useMemo } from 'react';
import { findTemplate, generateId } from '../utils';

const layoutLabels = {
  labelWidth: '标签宽度 (mm)',
  labelHeight: '标签高度 (mm)',
  margin: '标签边距 (mm)',
  fontSize: '字体大小 (pt)',
  columns: '每页列数',
  rows: '每页行数',
  qrSize: '二维码大小 (mm)'
};

const fieldTypeOptions = [
  { value: 'text', label: '文本' },
  { value: 'date', label: '日期' },
  { value: 'textarea', label: '多行文本' },
  { value: 'number', label: '数字' }
];

const fieldStyleOptions = [
  { value: '', label: '默认' },
  { value: 'bold', label: '粗体' },
  { value: 'italic', label: '斜体' },
  { value: 'muted', label: '弱化' }
];

export default function TemplateManager({
  templates,
  activeTemplateId,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
  onDuplicate
}) {
  const template = useMemo(
    () => findTemplate(templates, activeTemplateId),
    [templates, activeTemplateId]
  );

  const updateTemplate = (patch) => {
    onUpdate({ ...template, ...patch });
  };

  const updateLayout = (key, value) => {
    onUpdate({
      ...template,
      layout: { ...template.layout, [key]: value }
    });
  };

  const updateField = (index, patch) => {
    const fields = template.fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onUpdate({ ...template, fields });
  };

  const moveField = (index, dir) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= template.fields.length) return;
    const fields = [...template.fields];
    const [item] = fields.splice(index, 1);
    fields.splice(newIndex, 0, item);
    onUpdate({ ...template, fields });
  };

  const addField = () => {
    const fields = [
      ...template.fields,
      {
        key: `field_${generateId()}`,
        label: '新字段',
        type: 'text',
        visible: true,
        prefix: '',
        style: '',
        aliases: []
      }
    ];
    onUpdate({ ...template, fields });
  };

  const removeField = (index) => {
    if (!confirm('确定要删除该字段吗？相关已录入的数据将无法在标签中展示。')) return;
    const fields = template.fields.filter((_, i) => i !== index);
    onUpdate({ ...template, fields });
  };

  return (
    <div className="template-manager">
      <div className="template-list-pane">
        <div className="template-list-header">
          <h3>模板列表</h3>
          <button onClick={onAdd} className="btn btn-primary btn-small">+ 新建</button>
        </div>
        <div className="template-list">
          {templates.map(t => (
            <div
              key={t.id}
              className={`template-list-item ${t.id === activeTemplateId ? 'active' : ''}`}
              onClick={() => onSelect(t.id)}
            >
              <div className="template-list-info">
                <strong>{t.name}</strong>
                {t.builtin && <span className="badge">内置</span>}
              </div>
              <div className="template-list-actions">
                <button
                  className="btn-icon"
                  onClick={(e) => { e.stopPropagation(); onDuplicate(t.id); }}
                >
                  复制
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="template-edit-pane">
        <h3>编辑模板：{template.name}</h3>

        <section className="template-section">
          <h4>基本信息</h4>
          <div className="settings-grid">
            <div className="setting-item">
              <label>模板名称</label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => updateTemplate({ name: e.target.value })}
              />
            </div>
            <div className="setting-item">
              <label>标签标题</label>
              <input
                type="text"
                value={template.title || ''}
                onChange={(e) => updateTemplate({ title: e.target.value })}
                placeholder="（可留空，标签上不显示标题）"
              />
            </div>
          </div>
        </section>

        <section className="template-section">
          <h4>排版参数</h4>
          <div className="settings-grid">
            {Object.entries(layoutLabels).map(([key, label]) => (
              <div key={key} className="setting-item">
                <label>{label}</label>
                <input
                  type="number"
                  value={template.layout[key]}
                  onChange={(e) => updateLayout(key, Number(e.target.value))}
                  step={key === 'fontSize' ? 0.5 : 1}
                  min={1}
                />
              </div>
            ))}
            <div className="setting-item">
              <label>显示二维码</label>
              <input
                type="checkbox"
                checked={!!template.layout.showQR}
                onChange={(e) => updateLayout('showQR', e.target.checked)}
              />
            </div>
          </div>
        </section>

        <section className="template-section">
          <div className="template-section-header">
            <h4>字段配置</h4>
            <button onClick={addField} className="btn btn-secondary btn-small">+ 添加字段</button>
          </div>
          <div className="field-config-list">
            <div className="field-config-row field-config-head">
              <span>顺序</span>
              <span>键名</span>
              <span>显示名</span>
              <span>类型</span>
              <span>前缀</span>
              <span>样式</span>
              <span>展示</span>
              <span>操作</span>
            </div>
            {template.fields.map((field, index) => (
              <div key={field.key + index} className="field-config-row">
                <div className="field-order">
                  <button
                    className="btn-icon"
                    onClick={() => moveField(index, -1)}
                    disabled={index === 0}
                  >↑</button>
                  <button
                    className="btn-icon"
                    onClick={() => moveField(index, 1)}
                    disabled={index === template.fields.length - 1}
                  >↓</button>
                </div>
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => updateField(index, { key: e.target.value })}
                />
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                />
                <select
                  value={field.type || 'text'}
                  onChange={(e) => updateField(index, { type: e.target.value })}
                >
                  {fieldTypeOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={field.prefix || ''}
                  onChange={(e) => updateField(index, { prefix: e.target.value })}
                  placeholder="如：采集人: "
                />
                <select
                  value={field.style || ''}
                  onChange={(e) => updateField(index, { style: e.target.value })}
                >
                  {fieldStyleOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="checkbox"
                  checked={field.visible !== false}
                  onChange={(e) => updateField(index, { visible: e.target.checked })}
                />
                <button
                  className="btn-icon btn-danger"
                  onClick={() => removeField(index)}
                >删除</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
