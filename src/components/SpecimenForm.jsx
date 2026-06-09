import { useState, useEffect } from 'react';
import {
  getTemplateVisibleFields,
  getTemplateFieldLabel,
  getFieldType,
  FIELD_TYPES,
  ensureSpecimenHasTemplateFields
} from '../utils';

export default function SpecimenForm({ specimen, templates, activeTemplateId, onSave, onCancel }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(specimen.templateId || activeTemplateId);
  const [formData, setFormData] = useState(specimen);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  useEffect(() => {
    if (specimen.templateId !== selectedTemplateId) {
      const newFormData = ensureSpecimenHasTemplateFields(formData, selectedTemplate);
      setFormData(newFormData);
    }
  }, [selectedTemplateId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (e) => {
    const newTemplateId = e.target.value;
    setSelectedTemplateId(newTemplateId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData, templateId: selectedTemplateId };
    onSave(finalData);
  };

  const visibleFields = getTemplateVisibleFields(selectedTemplate);

  const renderField = (field) => {
    const fieldType = getFieldType(field.key);
    const label = getTemplateFieldLabel(selectedTemplate, field.key);
    const value = formData[field.key] || '';

    if (fieldType === FIELD_TYPES.TEXTAREA) {
      return (
        <textarea
          id={field.key}
          name={field.key}
          value={value}
          onChange={handleChange}
          rows={3}
        />
      );
    }

    return (
      <input
        type={fieldType === FIELD_TYPES.DATE ? 'date' : fieldType === FIELD_TYPES.NUMBER ? 'number' : 'text'}
        id={field.key}
        name={field.key}
        value={value}
        onChange={handleChange}
        step={fieldType === FIELD_TYPES.NUMBER ? 'any' : undefined}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="specimen-form">
      <div className="form-group template-select-group">
        <label htmlFor="template-select">所属模板</label>
        <select
          id="template-select"
          value={selectedTemplateId}
          onChange={handleTemplateChange}
          className="template-select"
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="form-grid">
        {visibleFields.map(field => (
          <div key={field.key} className={`form-group ${getFieldType(field.key) === FIELD_TYPES.TEXTAREA ? 'form-group-full' : ''}`}>
            <label htmlFor={field.key}>{getTemplateFieldLabel(selectedTemplate, field.key)}</label>
            {renderField(field)}
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
