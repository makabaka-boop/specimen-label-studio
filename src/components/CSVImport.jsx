import { useEffect, useMemo, useState } from 'react';
import { parseCSV, autoMapFieldsByTemplate, generateId, findTemplate } from '../utils';

export default function CSVImport({ templates, defaultTemplateId, onImport, onClose }) {
  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState(defaultTemplateId);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [previewData, setPreviewData] = useState([]);

  const template = useMemo(() => findTemplate(templates, templateId), [templates, templateId]);

  // 切换模板后重新计算自动映射
  useEffect(() => {
    if (csvHeaders.length > 0) {
      setFieldMap(autoMapFieldsByTemplate(csvHeaders, template));
    }
  }, [templateId, csvHeaders, template]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { headers, data } = await parseCSV(file);
      setCsvHeaders(headers);
      setCsvData(data);
      setFieldMap(autoMapFieldsByTemplate(headers, template));
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

  const buildSpecimens = (rows) => {
    return rows.map(row => {
      const specimen = { id: generateId(), templateId: template.id };
      // 初始化模板内所有字段为空字符串
      template.fields.forEach(f => { specimen[f.key] = ''; });
      // 写入映射值
      Object.entries(fieldMap).forEach(([csvHeader, targetField]) => {
        if (targetField && template.fields.some(f => f.key === targetField)) {
          specimen[targetField] = row[csvHeader] || '';
        }
      });
      return specimen;
    });
  };

  const generatePreview = () => {
    setPreviewData(buildSpecimens(csvData.slice(0, 5)));
    setStep(3);
  };

  const handleImport = () => {
    onImport(buildSpecimens(csvData));
  };

  return (
    <div className="csv-import">
      <div className="modal-header">
        <h3>批量导入CSV</h3>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      <div className="csv-template-row">
        <label>导入到模板</label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {step === 1 && (
        <div className="import-step">
          <p>选择CSV文件，第一行为表头。导入后的标本将归属到所选模板。</p>
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
          <h4>字段映射（模板：{template.name}）</h4>
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
                  {template.fields.map((f) => (
                    <option key={f.key} value={f.key}>{f.label}</option>
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
            <div className="preview-row preview-head">
              <strong>#</strong>
              {template.fields.slice(0, 4).map(f => (
                <span key={f.key}>{f.label}</span>
              ))}
            </div>
            {previewData.map((specimen, index) => (
              <div key={index} className="preview-row">
                <strong>#{index + 1}</strong>
                {template.fields.slice(0, 4).map(f => (
                  <span key={f.key}>{specimen[f.key] || '-'}</span>
                ))}
              </div>
            ))}
          </div>
          <p>共 {csvData.length} 条数据，将归属到模板 <strong>{template.name}</strong></p>
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
