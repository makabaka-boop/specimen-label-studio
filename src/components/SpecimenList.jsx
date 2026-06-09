import { getTemplateById } from '../utils';

export default function SpecimenList({ specimens, templates, onEdit, onDelete }) {
  const getTemplateName = (templateId) => {
    if (!templates || !templateId) return '未分类';
    const template = getTemplateById(templates, templateId);
    return template?.name || '未知模板';
  };

  const getSpecimenTitle = (specimen) => {
    if (specimen.specimenNo) return specimen.specimenNo;
    if (specimen.latinName) return specimen.latinName;
    return '未命名标本';
  };

  const getSpecimenSubtitle = (specimen) => {
    if (specimen.latinName && specimen.specimenNo) return specimen.latinName;
    if (specimen.collector) return `采集人: ${specimen.collector}`;
    return '-';
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
          {specimens.map((specimen, index) => (
            <div key={specimen.id} className="list-item">
              <div className="item-info">
                <span className="item-index">#{index + 1}</span>
                <span className="item-no">{getSpecimenTitle(specimen)}</span>
                <span className="item-name">{getSpecimenSubtitle(specimen)}</span>
                <span className="item-template">{getTemplateName(specimen.templateId)}</span>
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
          ))}
        </div>
      )}
    </div>
  );
}
