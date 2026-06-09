import { useState, useEffect, useMemo } from 'react';
import SpecimenForm from './components/SpecimenForm';
import SpecimenList from './components/SpecimenList';
import CSVImport from './components/CSVImport';
import TemplateManager from './components/TemplateManager';
import LabelGrid from './components/LabelGrid';
import {
  generateId,
  saveToLocalStorage,
  loadFromLocalStorage,
  migrateDraft,
  exportToJSON,
  downloadFile,
  findTemplate,
  buildSpecimenFromTemplate,
  createTemplate,
  reassignSpecimens,
  builtinTemplates,
  defaultActiveTemplateId
} from './utils';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [specimens, setSpecimens] = useState([]);
  const [templates, setTemplates] = useState(() => JSON.parse(JSON.stringify(builtinTemplates)));
  const [activeTemplateId, setActiveTemplateId] = useState(defaultActiveTemplateId);
  const [activeTab, setActiveTab] = useState('data');
  const [showForm, setShowForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingSpecimen, setEditingSpecimen] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // 初始化：加载并迁移本地数据
  useEffect(() => {
    const draft = loadFromLocalStorage();
    const migrated = migrateDraft(draft);
    setSpecimens(migrated.specimens);
    setTemplates(migrated.templates);
    setActiveTemplateId(migrated.activeTemplateId);
    if (draft?.savedAt) setLastSaved(draft.savedAt);
    setHydrated(true);
  }, []);

  // 自动持久化
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      saveToLocalStorage({ specimens, templates, activeTemplateId });
      setLastSaved(new Date().toISOString());
    }, 800);
    return () => clearTimeout(timer);
  }, [specimens, templates, activeTemplateId, hydrated]);

  const activeTemplate = useMemo(
    () => findTemplate(templates, activeTemplateId),
    [templates, activeTemplateId]
  );

  // ====== 模板操作 ======
  const handleAddTemplate = () => {
    const tpl = createTemplate(`自定义模板${templates.length + 1}`);
    setTemplates(prev => [...prev, tpl]);
    setActiveTemplateId(tpl.id);
  };

  const handleUpdateTemplate = (updated) => {
    setTemplates(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTemplate = (id) => {
    if (templates.length <= 1) {
      alert('至少需要保留一个模板');
      return;
    }
    const target = templates.find(t => t.id === id);
    if (target?.builtin) {
      if (!confirm('这是内置模板，删除后将无法恢复，确定继续吗？')) return;
    } else if (!confirm('确定要删除该模板吗？已有标本将被迁移到默认模板。')) {
      return;
    }
    const remaining = templates.filter(t => t.id !== id);
    const fallbackId = remaining[0].id;
    setTemplates(remaining);
    setSpecimens(prev => reassignSpecimens(prev, id, fallbackId));
    if (activeTemplateId === id) setActiveTemplateId(fallbackId);
  };

  const handleDuplicateTemplate = (id) => {
    const tpl = templates.find(t => t.id === id);
    if (!tpl) return;
    const copy = JSON.parse(JSON.stringify(tpl));
    copy.id = generateId();
    copy.name = `${tpl.name} 副本`;
    copy.builtin = false;
    setTemplates(prev => [...prev, copy]);
    setActiveTemplateId(copy.id);
  };

  // ====== 标本操作 ======
  const handleAddSpecimen = () => {
    setEditingSpecimen(buildSpecimenFromTemplate(activeTemplate));
    setShowForm(true);
  };

  const handleEditSpecimen = (specimen) => {
    setEditingSpecimen(specimen);
    setShowForm(true);
  };

  const handleSaveSpecimen = (specimen) => {
    if (specimens.find(s => s.id === specimen.id)) {
      setSpecimens(prev => prev.map(s => (s.id === specimen.id ? specimen : s)));
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

  // ====== 导出/打印 ======
  const handleExportPNG = async () => {
    const grid = document.getElementById('printable-grid');
    if (!grid) return;
    try {
      const canvas = await html2canvas(grid, { scale: 2, useCORS: true });
      canvas.toBlob((blob) => downloadFile(blob, 'specimen-labels.png'));
    } catch (error) {
      alert('导出PNG失败: ' + error.message);
    }
  };

  const handleExportPDF = () => {
    const layout = activeTemplate.layout;
    const info = `
标本标签PDF导出说明

当前模板: ${activeTemplate.name}
标签标题: ${activeTemplate.title}

布局参数:
- 标签尺寸: ${layout.labelWidth} x ${layout.labelHeight} mm
- 边距: ${layout.margin} mm
- 字体大小: ${layout.fontSize} pt
- 每页布局: ${layout.columns}列 x ${layout.rows}行
- 显示二维码: ${layout.showQR ? '是' : '否'}

数据统计:
- 当前模板标本数量: ${specimens.filter(s => s.templateId === activeTemplate.id).length}

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
    if (confirm('确定要清空所有标本数据吗？此操作不可撤销。')) {
      setSpecimens([]);
    }
  };

  const handlePrint = () => window.print();

  // 当前预览只展示活动模板的标本
  const previewSpecimens = useMemo(
    () => specimens.filter(s => s.templateId === activeTemplate.id),
    [specimens, activeTemplate]
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>标本标签排版工具</h1>
        <div className="header-actions">
          <div className="template-switcher">
            <label>当前模板</label>
            <select
              value={activeTemplateId}
              onChange={(e) => setActiveTemplateId(e.target.value)}
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
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
                + 添加标本（{activeTemplate.name}）
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
            <div className="preview-header">
              <p>
                正在预览模板 <strong>{activeTemplate.name}</strong>，
                共 {previewSpecimens.length} 条标本
              </p>
            </div>
            <LabelGrid
              specimens={previewSpecimens}
              template={activeTemplate}
            />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="tab-content">
            <TemplateManager
              templates={templates}
              activeTemplateId={activeTemplateId}
              onSelect={setActiveTemplateId}
              onAdd={handleAddTemplate}
              onUpdate={handleUpdateTemplate}
              onDelete={handleDeleteTemplate}
              onDuplicate={handleDuplicateTemplate}
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
                  <p>保存所有标本数据、模板及活动模板设置为JSON，便于后续导入编辑</p>
                  <button
                    onClick={() => exportToJSON(specimens, templates, activeTemplateId)}
                    className="btn btn-primary"
                  >
                    导出 JSON
                  </button>
                </div>
                <div className="export-card">
                  <h4>导出 PNG</h4>
                  <p>将当前模板预览页面导出为高清PNG图片</p>
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

      {showForm && editingSpecimen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{specimens.find(s => s.id === editingSpecimen.id) ? '编辑标本' : '添加标本'}</h3>
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
              defaultTemplateId={activeTemplateId}
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
