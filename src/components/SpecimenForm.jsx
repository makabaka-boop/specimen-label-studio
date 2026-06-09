import { useState } from 'react';

const fieldLabels = {
  specimenNo: '标本编号',
  latinName: '拉丁名',
  collector: '采集人',
  collectionDate: '采集日期',
  longitude: '经度',
  latitude: '纬度',
  altitude: '海拔',
  habitat: '生境备注'
};

export default function SpecimenForm({ specimen, onSave, onCancel }) {
  const [formData, setFormData] = useState(specimen);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="specimen-form">
      <div className="form-grid">
        {Object.entries(fieldLabels).map(([field, label]) => (
          <div key={field} className="form-group">
            <label htmlFor={field}>{label}</label>
            {field === 'habitat' ? (
              <textarea
                id={field}
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
                rows={3}
              />
            ) : (
              <input
                type={field === 'collectionDate' ? 'date' : 'text'}
                id={field}
                name={field}
                value={formData[field] || ''}
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
