import React from 'react';

interface ReportButtonProps {
  deviceId: string;
  deviceName?: string;
  location?: string;
  status?: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({ 
  deviceId, 
  deviceName = '-', 
  location = '-', 
  status = '-' 
}) => {

  const handleReportClick = () => {
    alert(`เตรียมส่งข้อมูลเข้า Database ศูนย์กลาง!\n\nรหัสอุปกรณ์: ${deviceId}\nชื่อ/สถานที่: ${deviceName}\nพิกัด/โซน: ${location}\nสถานะปัจจุบัน: ${status}`);
 };

  return (
    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
      <button
        onClick={handleReportClick}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: '0.2s',
          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
      >
        📢 แจ้งซ่อมแซม / ร้องเรียน
      </button>
    </div>
  );
};

export default ReportButton;