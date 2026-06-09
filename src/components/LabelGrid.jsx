import { useState } from 'react';
import SpecimenLabel from './SpecimenLabel';

export default function LabelGrid({ specimens, settings, templates }) {
  const [currentPage, setCurrentPage] = useState(0);
  const { columns, rows } = settings;
  const perPage = columns * rows;
  const totalPages = Math.max(1, Math.ceil(specimens.length / perPage));

  const currentSpecimens = specimens.slice(
    currentPage * perPage,
    (currentPage + 1) * perPage
  );

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '2mm',
    padding: '10mm',
    backgroundColor: '#f5f5f5'
  };

  return (
    <div className="label-grid-container">
      <div className="page-controls">
        <button
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="btn btn-small"
        >
          上一页
        </button>
        <span>第 {currentPage + 1} / {totalPages} 页</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage === totalPages - 1}
          className="btn btn-small"
        >
          下一页
        </button>
      </div>

      <div className="label-grid" style={gridStyle} id="printable-grid">
        {currentSpecimens.map((specimen, index) => (
          <SpecimenLabel
            key={specimen.id || index}
            specimen={specimen}
            settings={settings}
            templates={templates}
          />
        ))}
        {currentSpecimens.length < perPage &&
          Array.from({ length: perPage - currentSpecimens.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="empty-label"
              style={{
                width: `${settings.labelWidth}mm`,
                height: `${settings.labelHeight}mm`,
                border: '1px dashed #ddd',
                backgroundColor: '#fafafa'
              }}
            />
          ))}
      </div>

      <div className="page-info">
        <p>共 {specimens.length} 个标签，每页 {perPage} 个，共 {totalPages} 页</p>
      </div>
    </div>
  );
}
