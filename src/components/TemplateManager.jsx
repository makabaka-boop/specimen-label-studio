import { useState } from 'react';
import { generateId, defaultLayoutSettings } from '../utils';

export default function TemplateManager({ 
  templates, 
  activeTemplateId, 
  onTemplatesChange, 
  onActiveTemplateChange,
  onClose 
}) {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState(-1);

  const handleAddTemplate = () => {
    const newTemplate = {
      id: generateId(),
      name: '新模板',
      description: '',
      fields: [
        { key: 'specimenNo', label: '标本编号', type: 'text', showInLabel: true, order: 0, isTitle: true }
      ],
      layoutSettings: { ...defaultLayoutSettings },
      isDefault: false,
      isSystem: false
    };
    setEditingTemplate(newTemplate);
    setEditingFieldIndex(-1);
    setShowEditor(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate({ ...template, fields: [...template.fields], layoutSettings: { ...template.layoutSettings } });
    setEditingFieldIndex(-1);
    setShowEditor(true);
  };

  const handleDeleteTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isSystem) {
      alert('系统模板不能删除');
      return;
    }
    if (template?.isDefault) {
      alert('默认模板不能删除，请先设置其他模板为默认');
      return;
    }
    if (confirm('确定要删除这个模板吗？使用该模板的标本将迁移到默认模板。')) {
      const newTemplates = templates.filter(t => t.id !== templateId);
      onTemplatesChange(newTemplates);
    }
  };

  const handleSetDefault = (templateId) => {
    const newTemplates = templates.map(t => ({
      ...t,
      isDefault: t.id === templateId
    }));
    onTemplatesChange(newTemplates);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate.name.trim()) {
      alert('请输入模板名称');
      return;
    }
    const exists = templates.find(t => t.id === editingTemplate.id);
    let newTemplates;
    if (exists) {
      newTemplates = templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
    } else {
      newTemplates = [...templates, editingTemplate];
    }
    onTemplatesChange(newTemplates);
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleTemplateChange = (key, value) => {
    setEditingTemplate(prev => ({ ...prev, [key]: value }));
  };

  const handleLayoutChange = (key, value) => {
    setEditingTemplate(prev => ({
      ...prev,
      layoutSettings: { ...prev.layoutSettings, [key]: value }
    }));
  };

  const handleAddField = () => {
    const newField = {
      key: `field_${Date.now()}`,
      label: '新字段',
      type: 'text',
      showInLabel: true,
      order: editingTemplate.fields.length
    };
    setEditingTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setEditingFieldIndex(editingTemplate.fields.length);
  };

  const handleFieldChange = (index, key, value) => {
    setEditingTemplate(prev => {
      const newFields = [...prev.fields];
      newFields[index] = { ...newFields[index], [key]: value };
      return { ...prev, fields: newFields };
    });
  };

  const handleDeleteField = (index) => {
    if (confirm('确定要删除这个字段吗？')) {
      setEditingTemplate(prev => {
        const newFields = prev.fields.filter((_, i) => i !== index);
        newFields.forEach((f, i) => f.order = i);
        return { ...prev, fields: newFields };
      });
      if (editingFieldIndex === index) {
        setEditingFieldIndex(-1);
      } else if (editingFieldIndex > index) {
        setEditingFieldIndex(editingFieldIndex - 1);
      }
    }
  };

  const handleMoveField = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= editingTemplate.fields.length) return;
    
    setEditingTemplate(prev => {
      const newFields = [...prev.fields];
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
      newFields.forEach((f, i) => f.order = i);
      return { ...prev, fields: newFields };
    });
    
    if (editingFieldIndex === index) {
      setEditingFieldIndex(newIndex);
    } else if (editingFieldIndex === newIndex) {
      setEditingFieldIndex(index);
    }
  };

  const sortedFields = [...editingTemplate?.fields || []].sort((a, b) => a.order - b.order);

  return (
    <div className="template-manager">
      <div className="modal-header">
        <h3>模板管理</h3>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      {!showEditor ? (
        <div className="template-list-section">
          <div className="section-header">
            <h4>模板列表</h4>
            <button onClick={handleAddTemplate} className="btn btn-primary btn-small">
              + 新建模板
            </button>
          </div>
          <div className="template-list">
            {templates.map(template => (
              <div 
                key={template.id} 
                className={`template-item ${activeTemplateId === template.id ? 'active' : ''} ${template.isSystem ? 'system' : ''}`}
              >
                <div className="template-info">
                  <div className="template-name">
                    {template.name}
                    {template.isDefault && <span className="badge badge-default">默认</span>}
                    {template.isSystem && <span className="badge badge-system">系统</span>}
                  </div>
                  <div className="template-desc">{template.description || '暂无描述'}</div>
                  <div className="template-meta">
                    {template.fields.length} 个字段
                  </div>
                </div>
                <div className="template-actions">
                  <button 
                    onClick={() => onActiveTemplateChange(template.id)} 
                    className="btn btn-small"
                    disabled={activeTemplateId === template.id}
                  >
                    使用
                  </button>
                  {!template.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(template.id)} 
                      className="btn btn-small btn-secondary"
                    >
                      设为默认
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditTemplate(template)} 
                    className="btn btn-small btn-secondary"
                  >
                    编辑
                  </button>
                  {!template.isSystem && (
                    <button 
                      onClick={() => handleDeleteTemplate(template.id)} 
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
      ) : (
        <div className="template-editor">
          <div className="editor-section">
            <h4>基本信息</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>模板名称</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => handleTemplateChange('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <input
                  type="text"
                  value={editingTemplate.description}
                  onChange={(e) => handleTemplateChange('description', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="editor-section">
            <div className="section-header">
              <h4>字段配置</h4>
              <button onClick={handleAddField} className="btn btn-primary btn-small">
                + 添加字段
              </button>
            </div>
            <div className="fields-list">
              {sortedFields.map((field, index) => (
                <div 
                  key={field.key} 
                  className={`field-item ${editingFieldIndex === index ? 'expanded' : ''}`}
                  onClick={() => setEditingFieldIndex(editingFieldIndex === index ? -1 : index)}
                >
                  <div className="field-header">
                    <div className="field-info">
                      <span className="field-order">{index + 1}</span>
                      <span className="field-label">{field.label}</span>
                      <span className="field-key">({field.key})</span>
                      {field.isTitle && <span className="badge badge-title">标题</span>}
                      {field.isItalic && <span className="badge badge-italic">斜体</span>}
                      {!field.showInLabel && <span className="badge badge-hidden">隐藏</span>}
                    </div>
                    <div className="field-actions">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMoveField(index, -1); }}
                        className="btn-icon"
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMoveField(index, 1); }}
                        className="btn-icon"
                        disabled={index === sortedFields.length - 1}
                      >
                        ↓
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteField(index); }}
                        className="btn-icon btn-danger"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {editingFieldIndex === index && (
                    <div className="field-editor" onClick={(e) => e.stopPropagation()}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>字段名称</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>字段键名</label>
                          <input
                            type="text"
                            value={field.key}
                            onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>字段类型</label>
                          <select
                            value={field.type}
                            onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                          >
                            <option value="text">单行文本</option>
                            <option value="date">日期</option>
                            <option value="textarea">多行文本</option>
                          </select>
                        </div>
                        <div className="form-group checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={field.showInLabel}
                              onChange={(e) => handleFieldChange(index, 'showInLabel', e.target.checked)}
                            />
                            在标签中显示
                          </label>
                        </div>
                        <div className="form-group checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={field.isTitle || false}
                              onChange={(e) => handleFieldChange(index, 'isTitle', e.target.checked)}
                            />
                            作为标题（加粗显示）
                          </label>
                        </div>
                        <div className="form-group checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={field.isItalic || false}
                              onChange={(e) => handleFieldChange(index, 'isItalic', e.target.checked)}
                            />
                            斜体显示
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="editor-section">
            <h4>排版设置</h4>
            <div className="form-grid settings-grid">
              <div className="form-group">
                <label>标签宽度 (mm)</label>
                <input
                  type="number"
                  value={editingTemplate.layoutSettings.labelWidth}
                  onChange={(e) => handleLayoutChange('labelWidth', Number(e.target.value))}
                  min={10}
                  max={200}
                />
              </div>
              <div className="form-group">
                <label>标签高度 (mm)</label>
                <input
                  type="number"
                  value={editingTemplate.layoutSettings.labelHeight}
                  onChange={(e) => handleLayoutChange('labelHeight', Number(e.target.value))}
                  min={10}
                  max={200}
                />
              </div>
              <div className="form-group">
                <label>标签边距 (mm)</label>
                <input
                  type="number"
                  value={editingTemplate.layoutSettings.margin}
                  onChange={(e) => handleLayoutChange('margin', Number(e.target.value))}
                  min={0}
                  max={20}
                />
              </div>
              <div className="form-group">
                <label>字体大小 (pt)</label>
                <input
                  type="number"
                  value={editingTemplate.layoutSettings.fontSize}
                  onChange={(e) => handleLayoutChange('fontSize', Number(e.target.value))}
                  min={4}
                  max={24}
                  step={0.5}
                />
              </div>
              <div className="form-group">
                <label>每页列数</label>
                <input
                  type="number"
                  value={editingTemplate.layoutSettings.columns}
                  onChange={(e) => handleLayoutChange('columns', Number(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>
              <div className="form-group">
                <label>每页行数</label>
                <input
                  type="number"
                  value={editingTemplate.layoutSettings.rows}
                  onChange={(e) => handleLayoutChange('rows', Number(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editingTemplate.layoutSettings.showQR}
                    onChange={(e) => handleLayoutChange('showQR', e.target.checked)}
                  />
                  显示二维码
                </label>
              </div>
              <div className="form-group">
                <label>二维码大小 (mm)</label>
                <input
                  type="number"
                  value={editingTemplate.layoutSettings.qrSize}
                  onChange={(e) => handleLayoutChange('qrSize', Number(e.target.value))}
                  min={5}
                  max={50}
                  disabled={!editingTemplate.layoutSettings.showQR}
                />
              </div>
            </div>
          </div>

          <div className="editor-actions">
            <button 
              onClick={() => { setShowEditor(false); setEditingTemplate(null); }} 
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={handleSaveTemplate} className="btn btn-primary">
              保存模板
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
