export default function SpecimenList({ specimens, templates, onEdit, onDelete }) {
  const templateMap = (templates || []).reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});

  const resolveDisplay = (specimen) => {
    const template = templateMap[specimen.templateId];
    if (!template) {
      return {
        templateName: '未知模板',
        primary: specimen.specimenNo || specimen.id || '未编号',
        secondary: specimen.latinName || specimen.name || '-'
      };
    }
    const fields = template.fields;
    const first = fields[0];
    const second = fields.find(f => f.key === 'latinName') || fields[1];
    return {
      templateName: template.name,
      primary: (first && specimen[first.key]) || specimen.specimenNo || '未编号',
      secondary: (second && specimen[second.key]) || '-'
    };
  };

  return (
    <div className="specimen-list">
      <div className="list-header">
        <h3>标本列表</h3>
        <span className="count-badge">{specimens.length} 条</span>
      </div>
      {specimens.length === 0 ? (
        <p className="empty-state">暂无数据，请添加标本或导入CSV</p>
      ) : (
        <div className="list-content">
          {specimens.map((specimen, index) => {
            const display = resolveDisplay(specimen);
            return (
              <div key={specimen.id} className="list-item">
                <div className="item-info">
                  <span className="item-index">#{index + 1}</span>
                  <span className="item-template">{display.templateName}</span>
                  <span className="item-no">{display.primary}</span>
                  <span className="item-name">{display.secondary}</span>
                </div>
                <div className="item-actions">
                  <button onClick={() => onEdit(specimen)} className="btn-icon">
                    编辑
                  </button>
                  <button onClick={() => onDelete(specimen.id)} className="btn-icon btn-danger">
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
