import { QRCodeSVG } from 'qrcode.react';

const fieldFormatters = {
  specimenNo: (val) => <strong>{val}</strong>,
  latinName: (val) => <em>{val}</em>,
  collector: (val) => `采集人: ${val}`,
  collectionDate: (val) => `日期: ${val}`,
  habitat: (val) => val,
};

const coordinateKeys = ['latitude', 'longitude'];

export default function SpecimenLabel({ specimen, settings, template }) {
  const { labelWidth, labelHeight, margin, fontSize, showQR, qrSize } = settings;
  const qrPixelSize = qrSize * 3.78;

  const labelStyle = {
    width: `${labelWidth}mm`,
    height: `${labelHeight}mm`,
    padding: `${margin}mm`,
    fontSize: `${fontSize}pt`,
    border: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'column',
    gap: '2mm',
    boxSizing: 'border-box',
    backgroundColor: 'white'
  };

  const labelContentStyle = {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden'
  };

  const qrContent = specimen.specimenNo || specimen.id || '';

  const labelFields = template
    ? template.fields.filter(f => f.visible && f.showOnLabel)
    : null;

  const hasCoordinates = specimen.latitude || specimen.longitude;

  const renderField = (field) => {
    const val = specimen[field.key];
    if (!val && field.key !== 'latitude' && field.key !== 'longitude') return null;

    if (field.key === 'latitude' || field.key === 'longitude') {
      return null;
    }

    if (field.key === 'latinName') {
      return val ? (
        <div key={field.key} className="label-field latin-name">
          {fieldFormatters.latinName(val)}
        </div>
      ) : null;
    }

    if (field.key === 'habitat') {
      return val ? (
        <div key={field.key} className="label-field habitat">
          {val}
        </div>
      ) : null;
    }

    const formatter = fieldFormatters[field.key];
    return val ? (
      <div key={field.key} className="label-field">
        {formatter ? formatter(val) : val}
      </div>
    ) : null;
  };

  if (labelFields) {
    const hasLat = labelFields.some(f => f.key === 'latitude');
    const hasLng = labelFields.some(f => f.key === 'longitude');
    const showCoordLine = (hasLat || hasLng) && hasCoordinates;

    return (
      <div className="specimen-label" style={labelStyle}>
        {template.labelTitle && (
          <div className="label-title">{template.labelTitle}</div>
        )}
        <div className="label-content" style={labelContentStyle}>
          {labelFields
            .filter(f => f.key !== 'latitude' && f.key !== 'longitude')
            .map(renderField)}
          {showCoordLine && (
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

  return (
    <div className="specimen-label" style={labelStyle}>
      <div className="label-content" style={labelContentStyle}>
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
