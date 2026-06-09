import { useState, useMemo } from 'react';
import SpecimenLabel from './SpecimenLabel';
import { getActiveTemplate } from '../utils';

export default function LabelGrid({ specimens, templates, settings }) {
  const [currentPage, setCurrentPage] = useState(0);

  const specimensByTemplate = useMemo(() => {
    const groups = {};
    specimens.forEach(s => {
      const tid = s.templateId || templates[0]?.id;
      if (!groups[tid]) groups[tid] = [];
      groups[tid].push(s);
    });
    return groups;
  }, [specimens, templates]);

  const templateOrder = templates.map(t => t.id);
  const allPages = useMemo(() => {
    const pages = [];
    templateOrder.forEach(tid => {
      const template = templates.find(t => t.id === tid);
      if (!template) return;
      const templateSpecimens = specimensByTemplate[tid] || [];
      if (templateSpecimens.length === 0) return;

      const { columns, rows } = template.layout;
      const perPage = columns * rows;
      const pageCount = Math.ceil(templateSpecimens.length / perPage);

      for (let p = 0; p < pageCount; p++) {
        pages.push({
          templateId: tid,
          template,
          specimens: templateSpecimens.slice(p * perPage, (p + 1) * perPage),
          pageIndex: p,
          totalPages: pageCount
        });
      }
    });
    return pages;
  }, [specimensByTemplate, templateOrder, templates]);

  const totalPages = Math.max(1, allPages.length);
  const safePage = Math.min(currentPage, totalPages - 1);
  const currentPageData = allPages[safePage] || null;

  const renderPage = (pageData) => {
    if (!pageData) {
      return (
        <div className="label-grid empty-grid" style={gridStyle}>
          <div className="empty-state">暂无标本数据，请先添加标本</div>
        </div>
      );
    }

    const { template, specimens: pageSpecimens } = pageData;
    const { columns, rows, labelWidth, labelHeight } = template.layout;
    const perPage = columns * rows;

    const pageGridStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '2mm',
      padding: '10mm',
      backgroundColor: '#f5f5f5',
      justifyContent: 'center'
    };

    return (
      <div className="label-grid" style={pageGridStyle} id="printable-grid">
        {pageSpecimens.map((specimen, index) => (
          <SpecimenLabel
            key={specimen.id || index}
            specimen={specimen}
            templates={templates}
            settings={settings}
            forceTemplate={template}
          />
        ))}
        {pageSpecimens.length < perPage &&
          Array.from({ length: perPage - pageSpecimens.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="empty-label"
              style={{
                width: `${labelWidth}mm`,
                height: `${labelHeight}mm`,
                border: '1px dashed #ddd',
                backgroundColor: '#fafafa'
              }}
            />
          ))}
      </div>
    );
  };

  const gridStyle = {};

  return (
    <div className="label-grid-container">
      <div className="page-controls">
        <button
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={safePage === 0}
          className="btn btn-small"
        >
          上一页
        </button>
        <span>
          第 {safePage + 1} / {totalPages} 页
          {currentPageData && (
            <span className="page-template-info">
              {' '}- {currentPageData.template.name} (第{currentPageData.pageIndex + 1}/{currentPageData.totalPages}页)
            </span>
          )}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={safePage >= totalPages - 1}
          className="btn btn-small"
        >
          下一页
        </button>
      </div>

      {renderPage(currentPageData)}

      <div className="page-info">
        <p>共 {specimens.length} 个标签，{totalPages} 页</p>
      </div>
    </div>
  );
}
