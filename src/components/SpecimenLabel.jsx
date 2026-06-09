import { QRCodeSVG } from 'qrcode.react';

const styleClassMap = {
  bold: 'label-field-bold',
  italic: 'label-field-italic',
  muted: 'label-field-muted'
};

export default function SpecimenLabel({ specimen, template }) {
  const layout = template.layout;
  const { labelWidth, labelHeight, margin, fontSize, showQR, qrSize } = layout;
  const qrPixelSize = qrSize * 3.78;

  const labelStyle = {
    width: `${labelWidth}mm`,
    height: `${labelHeight}mm`,
    padding: `${margin}mm`,
    fontSize: `${fontSize}pt`,
    border: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'column',
    gap: '1mm',
    boxSizing: 'border-box',
    backgroundColor: 'white'
  };

  const labelContentStyle = {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden'
  };

  const qrContent = specimen.specimenNo || specimen.id || '';
  const visibleFields = template.fields.filter(f => f.visible !== false);

  return (
    <div className="specimen-label" style={labelStyle}>
      {template.title && (
        <div className="label-title">{template.title}</div>
      )}
      <div className="label-content" style={labelContentStyle}>
        {visibleFields.map((field) => {
          const raw = specimen[field.key];
          if (raw === undefined || raw === null || raw === '') return null;
          const cls = ['label-field', styleClassMap[field.style] || ''].join(' ').trim();
          return (
            <div key={field.key} className={cls}>
              {field.prefix || ''}{raw}
            </div>
          );
        })}
      </div>
      {showQR && qrContent && (
        <div className="qr-placeholder" style={{ alignSelf: 'flex-end', flexShrink: 0, marginTop: 'auto' }}>
          <QRCodeSVG
            value={qrContent}
            size={qrPixelSize}
            level="M"
            includeMargin={false}
          />
        </div>
      )}
    </div>
  );
}
