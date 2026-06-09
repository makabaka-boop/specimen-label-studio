import { useState, useEffect } from 'react';
import SpecimenForm from './components/SpecimenForm';
import SpecimenList from './components/SpecimenList';
import CSVImport from './components/CSVImport';
import TemplateManager from './components/TemplateManager';
import LabelGrid from './components/LabelGrid';
import {
  defaultSpecimen,
  defaultTemplateLayout,
  initializeTemplates,
  saveToLocalStorage,
  loadFromLocalStorage,
  exportToJSON,
  downloadFile,
  getActiveTemplate,
  createEmptySpecimenForTemplate,
  handleTemplateDeleted,
  migrateSpecimensForTemplateChange
} from './utils';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [specimens, setSpecimens] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [activeTab, setActiveTab] = useState('data');
  const [showForm, setShowForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingSpecimen, setEditingSpecimen] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const activeTemplate = getActiveTemplate(templates, activeTemplateId);
  const settings = activeTemplate?.layout || defaultTemplateLayout;

  useEffect(() => {
    const init = initializeTemplates();
    setTemplates(init.templates);
    setActiveTemplateId(init.activeTemplateId);

    const saved = loadFromLocalStorage();
    if (saved) {
      setSpecimens(saved.data || []);
      if (saved.templates && saved.templates.length > 0) {
        setTemplates(saved.templates);
        setActiveTemplateId(saved.activeTemplateId || saved.templates[0].id);
      }
      setLastSaved(saved.savedAt);
    }
  }, []);

  useEffect(() => {
    if (templates.length === 0) return;
    const timer = setTimeout(() => {
      saveToLocalStorage(specimens, templates, activeTemplateId);
      setLastSaved(new Date().toISOString());
    }, 1000);
    return () => clearTimeout(timer);
  }, [specimens, templates, activeTemplateId]);

  const handleAddSpecimen = () => {
    const newSpecimen = createEmptySpecimenForTemplate(activeTemplate);
    setEditingSpecimen(newSpecimen);
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

  const handleSelectTemplate = (templateId) => {
    setActiveTemplateId(templateId);
  };

  const handleSaveTemplate = (template) => {
    const existingIndex = templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      const oldTemplate = templates[existingIndex];
      const newTemplates = [...templates];
      newTemplates[existingIndex] = template;
      setTemplates(newTemplates);
      setSpecimens(prev => migrateSpecimensForTemplateChange(prev, oldTemplate, template));
    } else {
      setTemplates(prev => [...prev, template]);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template || template.isDefault) return;

    const fallbackTemplate = templates.find(t => t.id !== templateId && t.isDefault) || templates.find(t => t.id !== templateId);
    if (!fallbackTemplate) return;

    setTemplates(prev => prev.filter(t => t.id !== templateId));
    setSpecimens(prev => handleTemplateDeleted(prev, templateId, fallbackTemplate.id));

    if (activeTemplateId === templateId) {
      setActiveTemplateId(fallbackTemplate.id);
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
    const info = `
标本标签PDF导出说明

当前模板: ${activeTemplate?.name || '默认'}
标签标题: ${activeTemplate?.title || '标本标签'}

当前设置:
- 标签尺寸: ${settings.labelWidth} x ${settings.labelHeight} mm
- 边距: ${settings.margin} mm
- 字体大小: ${settings.fontSize} pt
- 每页布局: ${settings.columns}列 x ${settings.rows}行
- 显示二维码: ${settings.showQR ? '是' : '否'}

数据统计:
- 标本数量: ${specimens.length}
- 总页数: ${Math.ceil(specimens.length / (settings.columns * settings.rows))}

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>标本标签排版工具</h1>
        <div className="header-actions">
          <span className="template-indicator">
            当前模板: <strong>{activeTemplate?.name}</strong>
          </span>
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
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          标签模板
        </button>
        <button
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          标签预览
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

        {activeTab === 'templates' && (
          <div className="tab-content">
            <TemplateManager
              templates={templates}
              activeTemplateId={activeTemplateId}
              onSelectTemplate={handleSelectTemplate}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="tab-content">
            <div className="preview-controls">
              <span>当前显示: 所有标本（按模板自动分组排版）</span>
            </div>
            <LabelGrid
              specimens={specimens}
              templates={templates}
              settings={settings}
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
                  <p>保存所有数据、模板和设置为JSON格式，便于后续导入编辑</p>
                  <button onClick={() => exportToJSON(specimens, templates, activeTemplateId)} className="btn btn-primary">
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
              <h3>{editingSpecimen?.specimenNo || editingSpecimen?.id ? '编辑标本' : '添加标本'}</h3>
              <button onClick={() => setShowForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <SpecimenForm
              specimen={editingSpecimen}
              templates={templates}
              activeTemplateId={activeTemplateId}
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
              activeTemplateId={activeTemplateId}
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
