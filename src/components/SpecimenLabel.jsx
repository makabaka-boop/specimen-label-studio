import { QRCodeSVG } from 'qrcode.react';

export default function SpecimenLabel({ specimen, settings }) {
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
