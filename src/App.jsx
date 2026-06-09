import { useState, useEffect } from 'react';
import SpecimenForm from './components/SpecimenForm';
import SpecimenList from './components/SpecimenList';
import CSVImport from './components/CSVImport';
import SettingsPanel from './components/SettingsPanel';
import LabelGrid from './components/LabelGrid';
import TemplateManager from './components/TemplateManager';
import {
  defaultSpecimen,
  defaultSettings,
  defaultTemplates,
  generateId,
  saveToLocalStorage,
  loadFromLocalStorage,
  exportToJSON,
  downloadFile,
  getTemplateById,
  getDefaultTemplateId,
  migrateSpecimens
} from './utils';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [specimens, setSpecimens] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [templates, setTemplates] = useState(defaultTemplates);
  const [activeTab, setActiveTab] = useState('data');
  const [showForm, setShowForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingSpecimen, setEditingSpecimen] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [previewTemplateId, setPreviewTemplateId] = useState('');

  useEffect(() => {
    const draft = loadFromLocalStorage();
    if (draft) {
      setSpecimens(draft.data || []);
      setSettings(draft.settings || defaultSettings);
      setLastSaved(draft.savedAt);
    }
    if (draft && draft.templates && draft.templates.length > 0) {
      setTemplates(draft.templates);
    }
  }, []);

  useEffect(() => {
    const migrated = migrateSpecimens(specimens, templates);
    const needsMigration = migrated.some((s, i) => s.templateId !== specimens[i]?.templateId);
    if (needsMigration) {
      setSpecimens(migrated);
    }
  }, [templates]);

  useEffect(() => {
    if (!previewTemplateId && templates.length > 0) {
      setPreviewTemplateId(getDefaultTemplateId());
    }
  }, [templates]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage(specimens, settings, templates);
      setLastSaved(new Date().toISOString());
    }, 1000);
    return () => clearTimeout(timer);
  }, [specimens, settings, templates]);

  const handleAddSpecimen = () => {
    setEditingSpecimen({ ...defaultSpecimen, id: generateId(), templateId: getDefaultTemplateId() });
    setShowForm(true);
  };

  const handleEditSpecimen = (specimen) => {
    setEditingSpecimen(specimen);
    setShowForm(true);
  };

  const handleSaveSpecimen = (specimen) => {
    if (specimens.find(s => s.id === specimen.id)) {
      setSpecimens(prev => prev.map(s => s.id === specimen.id ? specimen : s));
    } else {
      setSpecimens(prev => [...prev, specimen]);
    }
    setShowForm(false);
    setEditingSpecimen(null);
  };

  const handleDeleteSpecimen = (id) => {
    if (confirm('确定要删除这个标本吗？')) {
      setSpecimens(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleCSVImport = (data) => {
    setSpecimens(prev => [...prev, ...data]);
    setShowCSVImport(false);
  };

  const handleUpdateTemplates = (newTemplates) => {
    setTemplates(newTemplates);
  };

  const handleDeleteTemplate = (templateId) => {
    const defaultId = getDefaultTemplateId();
    if (templateId === defaultId) {
      alert('不能删除默认模板');
      return;
    }
    const affectedCount = specimens.filter(s => s.templateId === templateId).length;
    if (affectedCount > 0) {
      const confirmed = confirm(
        `该模板下有 ${affectedCount} 条标本数据，删除模板后这些标本将自动归入默认模板。确定要删除吗？`
      );
      if (!confirmed) return;
    }
    const newTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(newTemplates);
    if (previewTemplateId === templateId) {
      setPreviewTemplateId(defaultId);
    }
  };

  const handleExportPNG = async () => {
    const grid = document.getElementById('printable-grid');
    if (!grid) return;

    try {
      const canvas = await html2canvas(grid, {
        scale: 2,
        useCORS: true
      });
      canvas.toBlob((blob) => {
        downloadFile(blob, 'specimen-labels.png');
      });
    } catch (error) {
      alert('导出PNG失败: ' + error.message);
    }
  };

  const handleExportPDF = () => {
    const currentTemplate = getTemplateById(templates, previewTemplateId);
    const filteredSpecimens = specimens.filter(s => s.templateId === previewTemplateId);
    const info = `
标本标签PDF导出说明

当前模板: ${currentTemplate?.name || '默认'}
当前设置:
- 标签尺寸: ${settings.labelWidth} x ${settings.labelHeight} mm
- 边距: ${settings.margin} mm
- 字体大小: ${settings.fontSize} pt
- 每页布局: ${settings.columns}列 x ${settings.rows}行
- 显示二维码: ${settings.showQR ? '是' : '否'}

数据统计:
- 标本数量: ${filteredSpecimens.length}
- 总页数: ${Math.ceil(filteredSpecimens.length / (settings.columns * settings.rows))}

打印说明:
1. 使用浏览器打印功能 (Ctrl+P / Cmd+P)
2. 选择"另存为PDF"
3. 纸张尺寸建议选择A4
4. 边距设置为"无"
5. 确保"背景图形"选项已勾选
    `;
    const blob = new Blob([info], { type: 'text/plain' });
    downloadFile(blob, 'PDF导出说明.txt');
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有数据吗？此操作不可撤销。')) {
      setSpecimens([]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSpecimens = previewTemplateId
    ? specimens.filter(s => s.templateId === previewTemplateId)
    : specimens;

  const currentPreviewTemplate = getTemplateById(templates, previewTemplateId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>标本标签排版工具</h1>
        <div className="header-actions">
          {lastSaved && (
            <span className="save-status">
              已保存: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <button onClick={handlePrint} className="btn btn-print">
            打印预览
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          数据管理
        </button>
        <button
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          标签预览
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          排版设置
        </button>
        <button
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          模板管理
        </button>
        <button
          className={`tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          导出
        </button>
      </nav>

      <main className="content">
        {activeTab === 'data' && (
          <div className="tab-content">
            <div className="action-bar">
              <button onClick={handleAddSpecimen} className="btn btn-primary">
                + 添加标本
              </button>
              <button onClick={() => setShowCSVImport(true)} className="btn btn-secondary">
                导入CSV
              </button>
              <button onClick={handleClearAll} className="btn btn-danger">
                清空全部
              </button>
            </div>
            <SpecimenList
              specimens={specimens}
              templates={templates}
              onEdit={handleEditSpecimen}
              onDelete={handleDeleteSpecimen}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="tab-content">
            <div className="preview-template-selector">
              <label>按模板筛选：</label>
              <select
                value={previewTemplateId}
                onChange={(e) => setPreviewTemplateId(e.target.value)}
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <span className="filter-count">
                共 {filteredSpecimens.length} 条标本
              </span>
            </div>
            <LabelGrid
              specimens={filteredSpecimens}
              settings={currentPreviewTemplate?.settings || settings}
              template={currentPreviewTemplate}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <SettingsPanel
              templates={templates}
              onUpdateTemplates={handleUpdateTemplates}
            />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="tab-content">
            <TemplateManager
              templates={templates}
              onUpdateTemplates={handleUpdateTemplates}
              onDeleteTemplate={handleDeleteTemplate}
            />
          </div>
        )}

        {activeTab === 'export' && (
          <div className="tab-content">
            <div className="export-options">
              <h3>导出选项</h3>
              <div className="export-grid">
                <div className="export-card">
                  <h4>导出 JSON</h4>
                  <p>保存所有数据、设置和模板为JSON格式，便于后续导入编辑</p>
                  <button onClick={() => exportToJSON(specimens, settings, templates)} className="btn btn-primary">
                    导出 JSON
                  </button>
                </div>
                <div className="export-card">
                  <h4>导出 PNG</h4>
                  <p>将当前预览页面导出为高清PNG图片</p>
                  <button onClick={handleExportPNG} className="btn btn-primary">
                    导出 PNG
                  </button>
                </div>
                <div className="export-card">
                  <h4>导出 PDF</h4>
                  <p>使用浏览器打印功能导出PDF，包含完整排版</p>
                  <button onClick={handleExportPDF} className="btn btn-primary">
                    导出说明
                  </button>
                  <button onClick={handlePrint} className="btn btn-secondary mt-2">
                    打开打印对话框
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingSpecimen?.specimenNo ? '编辑标本' : '添加标本'}</h3>
              <button onClick={() => setShowForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <SpecimenForm
              specimen={editingSpecimen}
              templates={templates}
              onSave={handleSaveSpecimen}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {showCSVImport && (
        <div className="modal-overlay">
          <div className="modal">
            <CSVImport
              templates={templates}
              onImport={handleCSVImport}
              onClose={() => setShowCSVImport(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
