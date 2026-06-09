import { useState, useEffect, useMemo } from 'react';
import { findTemplate } from '../utils';

export default function SpecimenForm({ specimen, templates, onSave, onCancel }) {
  const [formData, setFormData] = useState(specimen);

  // 切换模板时，重新构造表单字段，保留同名字段值
  useEffect(() => {
    setFormData(specimen);
  }, [specimen]);

  const template = useMemo(
    () => findTemplate(templates, formData.templateId),
    [templates, formData.templateId]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (e) => {
    const newTemplateId = e.target.value;
    const newTemplate = findTemplate(templates, newTemplateId);
    // 仅保留新模板包含的字段值
    const next = { id: formData.id, templateId: newTemplateId };
    newTemplate.fields.forEach(f => {
      next[f.key] = formData[f.key] ?? '';
    });
    setFormData(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="specimen-form">
      <div className="form-template-row">
        <label htmlFor="templateId">所属模板</label>
        <select
          id="templateId"
          value={formData.templateId || ''}
          onChange={handleTemplateChange}
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="form-grid">
        {template.fields.map((field) => (
          <div key={field.key} className="form-group">
            <label htmlFor={field.key}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.key}
                name={field.key}
                value={formData[field.key] || ''}
                onChange={handleChange}
                rows={3}
              />
            ) : (
              <input
                type={field.type === 'date' ? 'date' : (field.type === 'number' ? 'number' : 'text')}
                id={field.key}
                name={field.key}
                value={formData[field.key] || ''}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          取消
        </button>
        <button type="submit" className="btn btn-primary">
          保存
        </button>
      </div>
    </form>
  );
}
