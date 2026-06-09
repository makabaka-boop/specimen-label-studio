import { useState } from 'react';

const settingLabels = {
  labelWidth: '标签宽度 (mm)',
  labelHeight: '标签高度 (mm)',
  margin: '标签边距 (mm)',
  fontSize: '字体大小 (pt)',
  columns: '每页列数',
  rows: '每页行数',
  showQR: '显示二维码',
  qrSize: '二维码大小 (mm)'
};

export default function SettingsPanel({ templates, onUpdateTemplates }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates.find(t => t.isDefault)?.id || templates[0]?.id || ''
  );

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  if (!currentTemplate) return null;

  const settings = currentTemplate.settings;

  const handleTemplateSelect = (e) => {
    setSelectedTemplateId(e.target.value);
  };

  const handleChange = (key, value) => {
    const updatedTemplate = {
      ...currentTemplate,
      settings: {
        ...currentTemplate.settings,
        [key]: value
      }
    };
    onUpdateTemplates(templates.map(t =>
      t.id === currentTemplate.id ? updatedTemplate : t
    ));
  };

  return (
    <div className="settings-panel">
      <div className="settings-template-select">
        <h3>排版设置</h3>
        <div className="form-group">
          <label>选择模板</label>
          <select value={selectedTemplateId} onChange={handleTemplateSelect}>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="settings-grid">
        {Object.entries(settingLabels).map(([key, label]) => (
          <div key={key} className="setting-item">
            <label>{label}</label>
            {key === 'showQR' ? (
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => handleChange(key, e.target.checked)}
              />
            ) : (
              <input
                type="number"
                value={settings[key]}
                onChange={(e) => handleChange(key, Number(e.target.value))}
                min={key.includes('Size') || key.includes('Width') || key.includes('Height') ? 10 : 1}
                max={key.includes('columns') || key.includes('rows') ? 20 : 100}
                step={key === 'fontSize' ? 0.5 : 1}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
