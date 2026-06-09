import { useState } from 'react';
import { getTemplateFields } from '../utils';

export default function SpecimenForm({ specimen, template, onSave, onCancel }) {
  const [formData, setFormData] = useState(specimen);
  
  const fields = template ? getTemplateFields(template) : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      templateId: template.id
    });
  };

  return (
    <form onSubmit={handleSubmit} className="specimen-form">
      <div className="form-grid">
        {fields.map(field => (
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
