import { useState } from 'react';
import { parseCSV, autoMapFields, generateId, getTemplateFields } from '../utils';

export default function CSVImport({ template, onImport, onClose }) {
  const [step, setStep] = useState(1);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [previewData, setPreviewData] = useState([]);

  const templateFields = template ? getTemplateFields(template) : [];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { headers, data } = await parseCSV(file);
      setCsvHeaders(headers);
      setCsvData(data);
      setFieldMap(autoMapFields(headers, template));
      setStep(2);
    } catch (error) {
      alert('CSV解析失败: ' + error.message);
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
      const specimen = { id: generateId(), templateId: template?.id };
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
      const specimen = { id: generateId(), templateId: template?.id };
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

      {template && (
        <div className="import-template-info">
          当前模板: <strong>{template.name}</strong>
        </div>
      )}

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
                  {templateFields.map(field => (
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
                {templateFields.slice(0, 3).map(field => (
                  <span key={field.key}>{specimen[field.key] || '-'}</span>
                ))}
              </div>
            ))}
          </div>
          <p>共 {csvData.length} 条数据</p>
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
