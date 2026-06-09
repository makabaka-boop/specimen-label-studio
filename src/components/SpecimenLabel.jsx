import { QRCodeSVG } from 'qrcode.react';
import { getVisibleFields, getTemplateById } from '../utils';

export default function SpecimenLabel({ specimen, settings, templates }) {
  const { labelWidth, labelHeight, margin, fontSize, showQR, qrSize } = settings;
  const qrPixelSize = qrSize * 3.78;

  let template = null;
  if (templates && specimen.templateId) {
    template = getTemplateById(templates, specimen.templateId);
  }
  
  const visibleFields = template ? getVisibleFields(template) : [];

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
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '1mm'
  };

  const qrContent = specimen.specimenNo || specimen.id || '';

  const renderFieldValue = (field, value) => {
    if (!value) return null;
    
    let content = value;
    
    if (field.isTitle) {
      return <strong>{content}</strong>;
    }
    if (field.isItalic) {
      return <em>{content}</em>;
    }
    
    return content;
  };

  return (
    <div className="specimen-label" style={labelStyle}>
      <div className="label-content" style={labelContentStyle}>
        {visibleFields.length > 0 ? (
          visibleFields.map(field => {
            const value = specimen[field.key];
            if (!value) return null;
            
            return (
              <div key={field.key} className={`label-field ${field.isTitle ? 'label-title' : ''} ${field.isItalic ? 'label-italic' : ''}`}>
                {!field.isTitle && !field.isItalic && field.type !== 'textarea' ? (
                  <span className="field-label">{field.label}: </span>
                ) : null}
                {renderFieldValue(field, value)}
              </div>
            );
          })
        ) : (
          <>
            {specimen.specimenNo && (
              <div className="label-field">
                <strong>{specimen.specimenNo}</strong>
              </div>
            )}
            {specimen.latinName && (
              <div className="label-field latin-name">
                <em>{specimen.latinName}</em>
              </div>
            )}
            {specimen.collector && (
              <div className="label-field">
                采集人: {specimen.collector}
              </div>
            )}
            {specimen.collectionDate && (
              <div className="label-field">
                日期: {specimen.collectionDate}
              </div>
            )}
            {(specimen.latitude || specimen.longitude) && (
              <div className="label-field">
                坐标: {specimen.latitude || ''}, {specimen.longitude || ''}
              </div>
            )}
            {specimen.altitude && (
              <div className="label-field">
                海拔: {specimen.altitude}m
              </div>
            )}
            {specimen.habitat && (
              <div className="label-field habitat">
                {specimen.habitat}
              </div>
            )}
          </>
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
