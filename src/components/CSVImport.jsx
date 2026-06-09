import { useState } from 'react';
import { parseCSV, autoMapFields, generateId, getDefaultTemplateId } from '../utils';

export default function CSVImport({ templates, onImport, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState(getDefaultTemplateId());
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [previewData, setPreviewData] = useState([]);

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const visibleFields = currentTemplate
    ? currentTemplate.fields.filter(f => f.visible)
    : [];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { headers, data } = await parseCSV(file);
      setCsvHeaders(headers);
      setCsvData(data);
      setFieldMap(autoMapFields(headers, currentTemplate));
      setStep(2);
    } catch (error) {
      alert('CSV解析失败: ' + error.message);
    }
  };

  const handleTemplateChange = (e) => {
    const newId = e.target.value;
    setSelectedTemplateId(newId);
    const newTemplate = templates.find(t => t.id === newId) || templates[0];
    if (csvHeaders.length > 0) {
      setFieldMap(autoMapFields(csvHeaders, newTemplate));
    }
  };

  const handleFieldMapChange = (csvHeader, targetField) => {
    setFieldMap(prev => ({
      ...prev,
      [csvHeader]: targetField
    }));
  };

  const generatePreview = () => {
    const preview = csvData.slice(0, 5).map(row => {
      const specimen = { id: generateId(), templateId: selectedTemplateId };
      Object.entries(fieldMap).forEach(([csvHeader, targetField]) => {
        if (targetField) {
          specimen[targetField] = row[csvHeader] || '';
        }
      });
      return specimen;
    });
    setPreviewData(preview);
    setStep(3);
  };

  const handleImport = () => {
    const data = csvData.map(row => {
      const specimen = { id: generateId(), templateId: selectedTemplateId };
      Object.entries(fieldMap).forEach(([csvHeader, targetField]) => {
        if (targetField) {
          specimen[targetField] = row[csvHeader] || '';
        }
      });
      return specimen;
    });
    onImport(data);
  };

  return (
    <div className="csv-import">
      <div className="modal-header">
        <h3>批量导入CSV</h3>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      <div className="form-group template-select-group">
        <label>导入到模板</label>
        <select
          value={selectedTemplateId}
          onChange={handleTemplateChange}
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {step === 1 && (
        <div className="import-step">
          <p>选择CSV文件，第一行为表头</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>
      )}

      {step === 2 && (
        <div className="import-step">
          <h4>字段映射</h4>
          <div className="field-mapping-grid">
            {csvHeaders.map(header => (
              <div key={header} className="field-map-row">
                <span className="csv-header">{header}</span>
                <span>→</span>
                <select
                  value={fieldMap[header] || ''}
                  onChange={(e) => handleFieldMapChange(header, e.target.value)}
                >
                  <option value="">-- 不导入 --</option>
                  {visibleFields.map(field => (
                    <option key={field.key} value={field.key}>{field.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button onClick={generatePreview} className="btn btn-primary">
            预览数据
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="import-step">
          <h4>数据预览 (前5条)</h4>
          <div className="preview-table">
            {previewData.map((specimen, index) => (
              <div key={index} className="preview-row">
                <strong>#{index + 1}</strong>
                {visibleFields.slice(0, 4).map(field => (
                  <span key={field.key}>{specimen[field.key] || '-'}</span>
                ))}
              </div>
            ))}
          </div>
          <p>共 {csvData.length} 条数据，导入到「{currentTemplate?.name}」模板</p>
          <div className="import-actions">
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              返回修改
            </button>
            <button onClick={handleImport} className="btn btn-primary">
              确认导入
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
