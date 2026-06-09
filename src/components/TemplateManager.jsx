import { useState } from 'react';
import { allFieldDefs, createTemplate, getDefaultTemplateId } from '../utils';

const fieldTypeOptions = [
  { value: 'text', label: '文本' },
  { value: 'date', label: '日期' },
  { value: 'textarea', label: '多行文本' }
];

function TemplateEditor({ template, onSave, onCancel }) {
  const [name, setName] = useState(template.name);
  const [labelTitle, setLabelTitle] = useState(template.labelTitle);
  const [fields, setFields] = useState(
    template.fields.map(f => ({ ...f }))
  );

  const handleToggleVisible = (index) => {
    setFields(prev => prev.map((f, i) =>
      i === index ? { ...f, visible: !f.visible } : f
    ));
  };

  const handleToggleRequired = (index) => {
    setFields(prev => prev.map((f, i) =>
      i === index ? { ...f, required: !f.required } : f
    ));
  };

  const handleToggleShowOnLabel = (index) => {
    setFields(prev => prev.map((f, i) =>
      i === index ? { ...f, showOnLabel: !f.showOnLabel } : f
    ));
  };

  const handleLabelChange = (index, newLabel) => {
    setFields(prev => prev.map((f, i) =>
      i === index ? { ...f, label: newLabel } : f
    ));
  };

  const handleTypeChange = (index, newType) => {
    setFields(prev => prev.map((f, i) =>
      i === index ? { ...f, type: newType } : f
    ));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setFields(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const handleMoveDown = (index) => {
    if (index === fields.length - 1) return;
    setFields(prev => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('请输入模板名称');
      return;
    }
    onSave({
      ...template,
      name: name.trim(),
      labelTitle: labelTitle.trim() || name.trim(),
      fields
    });
  };

  return (
    <form onSubmit={handleSubmit} className="template-editor">
      <div className="form-grid">
        <div className="form-group">
          <label>模板名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：植物标本模板"
          />
        </div>
        <div className="form-group">
          <label>标签标题</label>
          <input
            type="text"
            value={labelTitle}
            onChange={(e) => setLabelTitle(e.target.value)}
            placeholder="打印在标签上的标题"
          />
        </div>
      </div>

      <div className="field-config-section">
        <h4>字段配置</h4>
        <div className="field-config-list">
          {fields.map((field, index) => (
            <div key={field.key} className={`field-config-item ${field.visible ? '' : 'field-hidden'}`}>
              <div className="field-config-order">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="btn-icon-sm"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === fields.length - 1}
                  className="btn-icon-sm"
                >
                  ↓
                </button>
              </div>
              <div className="field-config-key">{field.key}</div>
              <div className="field-config-input">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  placeholder="字段标签"
                />
              </div>
              <div className="field-config-input">
                <select
                  value={field.type}
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                >
                  {fieldTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="field-config-toggles">
                <label className="toggle-label" title="在表单中显示">
                  <input
                    type="checkbox"
                    checked={field.visible}
                    onChange={() => handleToggleVisible(index)}
                  />
                  <span>显示</span>
                </label>
                <label className="toggle-label" title="必填字段">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={() => handleToggleRequired(index)}
                    disabled={!field.visible}
                  />
                  <span>必填</span>
                </label>
                <label className="toggle-label" title="在标签上显示">
                  <input
                    type="checkbox"
                    checked={field.showOnLabel}
                    onChange={() => handleToggleShowOnLabel(index)}
                    disabled={!field.visible}
                  />
                  <span>标签</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          取消
        </button>
        <button type="submit" className="btn btn-primary">
          保存模板
        </button>
      </div>
    </form>
  );
}

export default function TemplateManager({ templates, onUpdateTemplates, onDeleteTemplate }) {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    const newTemplate = createTemplate('新模板', '新模板标签', allFieldDefs.map(f => ({ ...f, visible: true, required: false, showOnLabel: true })));
    setEditingTemplate(newTemplate);
    setIsCreating(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate({ ...template, fields: template.fields.map(f => ({ ...f })) });
    setIsCreating(false);
  };

  const handleSave = (savedTemplate) => {
    if (isCreating) {
      onUpdateTemplates([...templates, savedTemplate]);
    } else {
      onUpdateTemplates(templates.map(t => t.id === savedTemplate.id ? savedTemplate : t));
    }
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleSetDefault = (templateId) => {
    onUpdateTemplates(templates.map(t => ({
      ...t,
      isDefault: t.id === templateId
    })));
  };

  const defaultId = getDefaultTemplateId();

  if (editingTemplate) {
    return (
      <div className="template-manager">
        <div className="template-manager-header">
          <h3>{isCreating ? '新建模板' : '编辑模板'}</h3>
        </div>
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="template-manager">
      <div className="template-manager-header">
        <h3>模板管理</h3>
        <button onClick={handleCreate} className="btn btn-primary">
          + 新建模板
        </button>
      </div>

      <div className="template-list">
        {templates.map(template => (
          <div key={template.id} className={`template-card ${template.isDefault ? 'template-default' : ''}`}>
            <div className="template-card-header">
              <div className="template-card-title">
                <h4>{template.name}</h4>
                {template.isDefault && <span className="default-badge">默认</span>}
              </div>
              <div className="template-card-actions">
                <button onClick={() => handleEdit(template)} className="btn btn-small btn-secondary">
                  编辑
                </button>
                {!template.isDefault && (
                  <>
                    <button
                      onClick={() => handleSetDefault(template.id)}
                      className="btn btn-small btn-secondary"
                    >
                      设为默认
                    </button>
                    <button
                      onClick={() => onDeleteTemplate(template.id)}
                      className="btn btn-small btn-danger"
                    >
                      删除
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="template-card-body">
              <div className="template-meta">
                <span>标签标题：{template.labelTitle}</span>
                <span>可见字段：{template.fields.filter(f => f.visible).length} / {template.fields.length}</span>
              </div>
              <div className="template-fields-preview">
                {template.fields.filter(f => f.visible).map(f => (
                  <span key={f.key} className={`field-tag ${f.showOnLabel ? '' : 'field-tag-label-hidden'}`}>
                    {f.label}
                    {f.required && <em>*</em>}
                    {!f.showOnLabel && <small> (仅表单)</small>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
