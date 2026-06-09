export default function SpecimenList({ specimens, onEdit, onDelete }) {
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
                <span className="item-no">{specimen.specimenNo || '未编号'}</span>
                <span className="item-name">{specimen.latinName || '-'}</span>
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
