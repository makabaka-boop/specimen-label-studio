import { useState, useEffect } from 'react';
import { getTemplateById, getDefaultTemplateId } from '../utils';

export default function SpecimenForm({ specimen, templates, onSave, onCancel }) {
  const [formData, setFormData] = useState(specimen);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    specimen.templateId || getDefaultTemplateId()
  );

  useEffect(() => {
    setFormData(specimen);
    setSelectedTemplateId(specimen.templateId || getDefaultTemplateId());
  }, [specimen]);

  const currentTemplate = getTemplateById(templates, selectedTemplateId);
  const visibleFields = currentTemplate
    ? currentTemplate.fields.filter(f => f.visible)
    : [];

  const handleTemplateChange = (e) => {
    const newTemplateId = e.target.value;
    setSelectedTemplateId(newTemplateId);
    setFormData(prev => ({ ...prev, templateId: newTemplateId }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const missingRequired = visibleFields.filter(
      f => f.required && !formData[f.key]?.trim()
    );
    if (missingRequired.length > 0) {
      alert(`请填写必填字段：${missingRequired.map(f => f.label).join('、')}`);
      return;
    }
    onSave({ ...formData, templateId: selectedTemplateId });
  };

  return (
    <form onSubmit={handleSubmit} className="specimen-form">
      <div className="form-group template-select-group">
        <label htmlFor="templateId">所属模板</label>
        <select
          id="templateId"
          value={selectedTemplateId}
          onChange={handleTemplateChange}
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="form-grid">
        {visibleFields.map(field => (
          <div key={field.key} className="form-group">
            <label htmlFor={field.key}>
              {field.label}
              {field.required && <em className="required-mark">*</em>}
            </label>
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
                type={field.type === 'date' ? 'date' : 'text'}
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
