import { useState } from 'react';
import {
  ALL_AVAILABLE_FIELDS,
  defaultTemplateLayout,
  generateTemplateId,
  getFieldConfig,
  getTemplateVisibleFields
} from '../utils';

const layoutLabels = {
  labelWidth: '标签宽度 (mm)',
  labelHeight: '标签高度 (mm)',
  margin: '标签边距 (mm)',
  fontSize: '正文字号 (pt)',
  titleFontSize: '标题字号 (pt)',
  columns: '每页列数',
  rows: '每页行数',
  showQR: '显示二维码',
  qrSize: '二维码大小 (mm)',
  titleBold: '标题加粗'
};

export default function TemplateManager({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate
}) {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  const handleCreateNew = () => {
    const newTemplate = {
      id: generateTemplateId(),
      name: '新模板',
      title: '标本标签',
      isDefault: false,
      createdAt: new Date().toISOString(),
      layout: { ...defaultTemplateLayout },
      fields: ALL_AVAILABLE_FIELDS.slice(0, 6).map((f, i) => ({
        key: f.key,
        order: i,
        visible: true,
        customLabel: '',
        customPrefix: undefined,
        customSuffix: undefined
      }))
    };
    setEditingTemplate(newTemplate);
    setShowEditor(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(JSON.parse(JSON.stringify(template)));
    setShowEditor(true);
  };

  const handleDuplicate = (template) => {
    const copy = JSON.parse(JSON.stringify(template));
    copy.id = generateTemplateId();
    copy.name = template.name + ' (副本)';
    copy.isDefault = false;
    copy.createdAt = new Date().toISOString();
    setEditingTemplate(copy);
    setShowEditor(true);
  };

  const handleDelete = (template) => {
    if (template.isDefault) {
      alert('默认模板不能删除');
      return;
    }
    const usingCount = 0;
    if (!confirm(`确定要删除模板"${template.name}"吗？${usingCount > 0 ? `有${usingCount}条标本正在使用此模板，将自动迁移到其他模板。` : ''}`)) {
      return;
    }
    onDeleteTemplate(template.id);
  };

  const handleSave = () => {
    if (!editingTemplate.name.trim()) {
      alert('请输入模板名称');
      return;
    }
    onSaveTemplate(editingTemplate);
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const toggleFieldVisibility = (fieldKey) => {
    setEditingTemplate(prev => {
      const fields = prev.fields.map(f => {
        if (f.key === fieldKey) {
          return { ...f, visible: !f.visible };
        }
        return f;
      });
      const hasField = fields.some(f => f.key === fieldKey);
      if (!hasField) {
        fields.push({
          key: fieldKey,
          order: fields.length,
          visible: true,
          customLabel: '',
          customPrefix: undefined,
          customSuffix: undefined
        });
      }
      return { ...prev, fields };
    });
  };

  const moveField = (fieldKey, direction) => {
    setEditingTemplate(prev => {
      const visibleFields = getTemplateVisibleFields(prev);
      const currentIndex = visibleFields.findIndex(f => f.key === fieldKey);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= visibleFields.length) return prev;

      const swapField = visibleFields[newIndex];
      const fields = prev.fields.map(f => {
        if (f.key === fieldKey) return { ...f, order: swapField.order };
        if (f.key === swapField.key) return { ...f, order: visibleFields[currentIndex].order };
        return f;
      });
      return { ...prev, fields };
    });
  };

  const updateFieldCustom = (fieldKey, prop, value) => {
    setEditingTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(f => {
        if (f.key === fieldKey) {
          return { ...f, [prop]: value };
        }
        return f;
      })
    }));
  };

  const updateLayout = (key, value) => {
    setEditingTemplate(prev => ({
      ...prev,
      layout: { ...prev.layout, [key]: value }
    }));
  };

  return (
    <div className="template-manager">
      <div className="template-section">
        <div className="section-header">
          <h3>当前模板</h3>
        </div>
        {activeTemplate && (
          <div className="active-template-card">
            <div className="template-info">
              <h4>{activeTemplate.name}</h4>
              <p className="template-meta">
                标题: {activeTemplate.title} | 字段数: {getTemplateVisibleFields(activeTemplate).length}
              </p>
            </div>
            <button onClick={() => handleEdit(activeTemplate)} className="btn btn-secondary">
              编辑当前模板
            </button>
          </div>
        )}
      </div>

      <div className="template-section">
        <div className="section-header">
          <h3>所有模板</h3>
          <button onClick={handleCreateNew} className="btn btn-primary btn-small">
            + 新建模板
          </button>
        </div>
        <div className="template-list">
          {templates.map(template => (
            <div
              key={template.id}
              className={`template-card ${template.id === activeTemplateId ? 'active' : ''}`}
            >
              <div className="template-card-info">
                <div className="template-card-name">
                  {template.name}
                  {template.isDefault && <span className="badge badge-default">默认</span>}
                  {template.id === activeTemplateId && <span className="badge badge-active">使用中</span>}
                </div>
                <div className="template-card-desc">
                  {getTemplateVisibleFields(template).length} 个字段 · {template.layout.labelWidth}×{template.layout.labelHeight}mm
                </div>
              </div>
              <div className="template-card-actions">
                {template.id !== activeTemplateId && (
                  <button
                    onClick={() => onSelectTemplate(template.id)}
                    className="btn btn-small btn-primary"
                  >
                    使用
                  </button>
                )}
                <button
                  onClick={() => handleDuplicate(template)}
                  className="btn btn-small btn-secondary"
                >
                  复制
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="btn btn-small btn-secondary"
                >
                  编辑
                </button>
                {!template.isDefault && (
                  <button
                    onClick={() => handleDelete(template)}
                    className="btn btn-small btn-danger"
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEditor && editingTemplate && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>{editingTemplate.id.startsWith('template-') && templates.find(t => t.id === editingTemplate.id) ? '编辑模板' : '新建模板'}</h3>
              <button onClick={() => { setShowEditor(false); setEditingTemplate(null); }} className="close-btn">
                &times;
              </button>
            </div>
            <div className="template-editor">
              <div className="editor-section">
                <h4>基本信息</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>模板名称</label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="例如：植物标本模板"
                    />
                  </div>
                  <div className="form-group">
                    <label>标签标题</label>
                    <input
                      type="text"
                      value={editingTemplate.title}
                      onChange={(e) => setEditingTemplate(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="标签上显示的标题"
                    />
                  </div>
                </div>
              </div>

              <div className="editor-section">
                <h4>排版参数</h4>
                <div className="settings-grid">
                  {Object.entries(layoutLabels).map(([key, label]) => (
                    <div key={key} className="setting-item">
                      <label>{label}</label>
                      {key === 'showQR' || key === 'titleBold' ? (
                        <input
                          type="checkbox"
                          checked={editingTemplate.layout[key]}
                          onChange={(e) => updateLayout(key, e.target.checked)}
                        />
                      ) : (
                        <input
                          type="number"
                          value={editingTemplate.layout[key]}
                          onChange={(e) => updateLayout(key, Number(e.target.value))}
                          min={key.includes('Size') || key.includes('Width') || key.includes('Height') || key.includes('fontSize') || key.includes('FontSize') ? 1 : 1}
                          max={key.includes('columns') || key.includes('rows') ? 20 : 200}
                          step={key === 'fontSize' || key === 'titleFontSize' ? 0.5 : 1}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-section">
                <h4>字段配置</h4>
                <p className="editor-hint">勾选需要显示的字段，拖动调整顺序，可自定义显示标签和前后缀</p>
                <div className="field-selector">
                  <div className="field-available">
                    <h5>可用字段</h5>
                    <div className="field-checkbox-list">
                      {ALL_AVAILABLE_FIELDS.map(fieldConfig => {
                        const templateField = editingTemplate.fields.find(f => f.key === fieldConfig.key);
                        const isChecked = templateField?.visible || false;
                        return (
                          <label key={fieldConfig.key} className="field-checkbox-item">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFieldVisibility(fieldConfig.key)}
                            />
                            <span>{fieldConfig.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="field-active">
                    <h5>已选字段（按显示顺序排列）</h5>
                    <div className="field-order-list">
                      {getTemplateVisibleFields(editingTemplate).map((field, idx) => {
                        const fieldConfig = getFieldConfig(field.key);
                        return (
                          <div key={field.key} className="field-order-item">
                            <div className="field-order-header">
                              <span className="field-order-num">{idx + 1}</span>
                              <span className="field-order-name">{fieldConfig?.label || field.key}</span>
                              <div className="field-order-move">
                                <button
                                  type="button"
                                  onClick={() => moveField(field.key, 'up')}
                                  disabled={idx === 0}
                                  className="btn-icon"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveField(field.key, 'down')}
                                  disabled={idx === getTemplateVisibleFields(editingTemplate).length - 1}
                                  className="btn-icon"
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
                            <div className="field-custom-options">
                              <div className="form-group form-group-inline">
                                <label>显示标签</label>
                                <input
                                  type="text"
                                  value={field.customLabel}
                                  placeholder={fieldConfig?.label}
                                  onChange={(e) => updateFieldCustom(field.key, 'customLabel', e.target.value)}
                                />
                              </div>
                              <div className="form-group form-group-inline">
                                <label>前缀</label>
                                <input
                                  type="text"
                                  value={field.customPrefix ?? ''}
                                  placeholder={fieldConfig?.prefix || ''}
                                  onChange={(e) => updateFieldCustom(field.key, 'customPrefix', e.target.value)}
                                />
                              </div>
                              <div className="form-group form-group-inline">
                                <label>后缀</label>
                                <input
                                  type="text"
                                  value={field.customSuffix ?? ''}
                                  placeholder={fieldConfig?.suffix || ''}
                                  onChange={(e) => updateFieldCustom(field.key, 'customSuffix', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setShowEditor(false); setEditingTemplate(null); }} className="btn btn-secondary">
                取消
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                保存模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
