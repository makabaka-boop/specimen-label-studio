import { useState, useEffect } from 'react';
import SpecimenForm from './components/SpecimenForm';
import SpecimenList from './components/SpecimenList';
import CSVImport from './components/CSVImport';
import SettingsPanel from './components/SettingsPanel';
import LabelGrid from './components/LabelGrid';
import {
  defaultSpecimen,
  defaultSettings,
  generateId,
  saveToLocalStorage,
  loadFromLocalStorage,
  exportToJSON,
  downloadFile
} from './utils';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [specimens, setSpecimens] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('data');
  const [showForm, setShowForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingSpecimen, setEditingSpecimen] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const draft = loadFromLocalStorage();
    if (draft) {
      setSpecimens(draft.data || []);
      setSettings(draft.settings || defaultSettings);
      setLastSaved(draft.savedAt);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage(specimens, settings);
      setLastSaved(new Date().toISOString());
    }, 1000);
    return () => clearTimeout(timer);
  }, [specimens, settings]);

  const handleAddSpecimen = () => {
    setEditingSpecimen({ ...defaultSpecimen, id: generateId() });
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
              onEdit={handleEditSpecimen}
              onDelete={handleDeleteSpecimen}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="tab-content">
            <LabelGrid specimens={specimens} settings={settings} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />
          </div>
        )}

        {activeTab === 'export' && (
          <div className="tab-content">
            <div className="export-options">
              <h3>导出选项</h3>
              <div className="export-grid">
                <div className="export-card">
                  <h4>导出 JSON</h4>
                  <p>保存所有数据和设置为JSON格式，便于后续导入编辑</p>
                  <button onClick={() => exportToJSON(specimens, settings)} className="btn btn-primary">
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
