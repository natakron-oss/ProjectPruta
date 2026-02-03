import React, { useState, useEffect } from 'react';
import { Wifi, MapPin, Signal, Users, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import './durablearticles.css'; // ✅ ใช้ CSS ตัวเดียวกับหน้าไฟส่องสว่าง

// ✅ ใส่ลิงก์ CSV ของคุณให้แล้วครับ
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQv7p9ib0xXet8Alyik_Fi9CdBVvZO8xz73K4k0wEoNqpwIWAKFGIfbk0IkE8knnp-LXvNA6OceINr1/pub?gid=123712203&single=true&output=csv';

const fallbackData = [
    { WIFI_ID: 'รอโหลด...', LOCATION: '-', ISP: '-', STATUS: 'ปกติ', LAT: 12.70, LON: 100.90, SPEED: '-', DEVICE_COUNT: 0 },
];

const WifiSpot: React.FC = () => {
    const [points, setPoints] = useState<any[]>(fallbackData);
    const [selected, setSelected] = useState<any>(fallbackData[0]);
    const [loading, setLoading] = useState(false);

    const fetchData = () => {
        setLoading(true);
        Papa.parse(GOOGLE_SHEET_URL, {
            download: true,
            header: true,
            complete: (results) => {
                // กรองเอาเฉพาะแถวที่มี WIFI_ID
                const validData = results.data.filter((item: any) => item.WIFI_ID && item.WIFI_ID.trim() !== '');

                if (validData.length > 0) {
                    setPoints(validData);
                    setSelected(validData[0]);
                } else {
                    console.warn('ไม่พบข้อมูล หรือชื่อหัวตารางไม่ตรง (ต้องเป็น WIFI_ID, LOCATION...)');
                }
                setLoading(false);
            },
            error: (err) => {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusClass = (status: string) => {
        if (!status) return '';
        if (status.includes('ออนไลน์') || status.includes('Online') || status.includes('ปกติ')) return 'status-normal';
        if (status.includes('ออฟไลน์') || status.includes('Offline') || status.includes('เสีย')) return 'status-broken';
        return 'status-fix';
    };

    return (
        <div className="sl-container">
            <div className="sl-header">
                <div className="header-row">
                    <div>
                        <h2>ไวไฟชุมชน</h2>
                        <p>จุดกระจายสัญญาณอินเทอร์เน็ตฟรี</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="btn-update"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
                        {loading ? 'กำลังโหลด...' : 'อัปเดตข้อมูล'}
                    </button>
                </div>
            </div>

            <div className="sl-layout">
                {/* --- Left Panel --- */}
                <div className="sl-panel">
                    <div className="sl-panel-header">
                        <Wifi size={20} color="#2563eb" />
                        <h3>จุดติดตั้ง ({points.length})</h3>
                    </div>
                    <div className="sl-list-content">
                        {points.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => setSelected(item)}
                                className={`sl-card ${selected?.WIFI_ID === item.WIFI_ID ? 'active' : ''}`}
                            >
                                <div className="sl-card-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="sl-id">{item.WIFI_ID}</span>
                                        <span className="sl-badge-type">{item.ISP}</span>
                                    </div>
                                    <span className={`sl-status ${getStatusClass(item.STATUS)}`}>{item.STATUS}</span>
                                </div>
                                <p className="sl-location">{item.LOCATION}</p>
                                <div className="sl-date">
                                    <Signal size={12} /><span>Speed: {item.SPEED}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Right Panel --- */}
                <div className="sl-panel">
                    <div className="sl-panel-header">
                        <MapPin size={20} color="#2563eb" />
                        <h3>รายละเอียด</h3>
                    </div>
                    <div className="sl-scrollable-content">
                        <div className="sl-map-area">
                            <div className="sl-map-bg"></div>
                            <div className="sl-pin-container">
                                <div className="sl-pin" style={{ backgroundColor: '#3b82f6' }}>
                                    <Wifi size={24} color="white" />
                                </div>
                                <div className="sl-pin-label">{selected?.WIFI_ID || '-'}</div>
                            </div>
                        </div>
                        <div className="sl-detail-box">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
                                {selected?.WIFI_ID || '-'}
                            </h2>
                            <div className="sl-detail-grid">
                                <div><span className="sl-field-label">จุดติดตั้ง</span><p className="sl-field-value">{selected?.LOCATION || '-'}</p></div>
                                <div><span className="sl-field-label">ผู้ให้บริการ (ISP)</span><p className="sl-field-value">{selected?.ISP || '-'}</p></div>
                                <div><span className="sl-field-label">ความเร็ว (Speed)</span><p className="sl-field-value">{selected?.SPEED || '-'}</p></div>
                                <div>
                                    <span className="sl-field-label">ผู้ใช้งานขณะนี้</span>
                                    <p className="sl-field-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={16} /> {selected?.DEVICE_COUNT || 0} เครื่อง
                                    </p>
                                </div>
                                <div><span className="sl-field-label">พิกัด GPS</span><p className="sl-field-value">{selected?.LAT}, {selected?.LON}</p></div>
                                <div>
                                    <span className="sl-field-label">สถานะ</span>
                                    <span className={`sl-status ${getStatusClass(selected?.STATUS)}`}>{selected?.STATUS || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`.spin-anim { animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default WifiSpot;