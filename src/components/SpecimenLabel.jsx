import { QRCodeSVG } from 'qrcode.react';
import {
  getTemplateVisibleFields,
  getTemplateFieldLabel,
  getTemplateFieldPrefix,
  getTemplateFieldSuffix,
  isFieldItalic,
  getActiveTemplate
} from '../utils';

export default function SpecimenLabel({ specimen, templates, settings, forceTemplate }) {
  const template = forceTemplate || getActiveTemplate(templates, specimen.templateId);
  const layout = template?.layout || settings;
  const { labelWidth, labelHeight, margin, fontSize, showQR, qrSize, titleFontSize, titleBold } = layout;
  const qrPixelSize = (qrSize || 15) * 3.78;

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

  const visibleFields = getTemplateVisibleFields(template);
  const qrContent = specimen.specimenNo || specimen.id || '';

  const coordinateFields = ['longitude', 'latitude'];
  const hasCoordinates = coordinateFields.some(f => specimen[f]);

  const renderFieldValue = (fieldKey, value) => {
    if (!value && value !== 0) return null;

    const prefix = getTemplateFieldPrefix(template, fieldKey);
    const suffix = getTemplateFieldSuffix(template, fieldKey);
    const isItalic = isFieldItalic(fieldKey);

    if (fieldKey === 'latitude' || fieldKey === 'longitude') return null;

    return (
      <div className={`label-field label-field-${fieldKey}`}>
        {isItalic ? (
          <em>{prefix}{value}{suffix}</em>
        ) : (
          <>{prefix}{value}{suffix}</>
        )}
      </div>
    );
  };

  return (
    <div className="specimen-label" style={labelStyle}>
      {template?.title && (
        <div
          className="label-title"
          style={{
            fontSize: `${titleFontSize || fontSize + 2}pt`,
            fontWeight: titleBold ? 'bold' : 'normal',
            textAlign: 'center',
            borderBottom: '0.5pt solid #999',
            paddingBottom: '1mm',
            marginBottom: '1mm',
            flexShrink: 0
          }}
        >
          {template.title}
        </div>
      )}
      <div className="label-content" style={{ flex: 1, minHeight: 0, overflow: 'hidden', lineHeight: 1.3 }}>
        {visibleFields.map(field => {
          if (coordinateFields.includes(field.key)) return null;
          return renderFieldValue(field.key, specimen[field.key]);
        })}
        {hasCoordinates && (
          <div className="label-field">
            坐标: {specimen.latitude || ''}, {specimen.longitude || ''}
          </div>
        )}
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
