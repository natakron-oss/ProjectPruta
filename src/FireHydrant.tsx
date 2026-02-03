import React, { useState, useEffect } from 'react';
import { Droplet, MapPin, Calendar, RefreshCw, Gauge } from 'lucide-react';
import Papa from 'papaparse';
import './durablearticles.css'; // ✅ ใช้ CSS ดีไซน์เดิม (Re-use)

// ✅ ใส่ลิงก์ CSV ของคุณเรียบร้อยครับ
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQv7p9ib0xXet8Alyik_Fi9CdBVvZO8xz73K4k0wEoNqpwIWAKFGIfbk0IkE8knnp-LXvNA6OceINr1/pub?gid=872918807&single=true&output=csv';

const fallbackData = [
    { HYDRANT_ID: 'รอโหลด...', LOCATION: '-', PRESSURE: '-', STATUS: 'ปกติ', LAT: 12.70, LON: 100.90, LAST_CHECK: '-' },
];

const FireHydrant: React.FC = () => {
    const [points, setPoints] = useState<any[]>(fallbackData);
    const [selected, setSelected] = useState<any>(fallbackData[0]);
    const [loading, setLoading] = useState(false);

    const fetchData = () => {
        setLoading(true);
        Papa.parse(GOOGLE_SHEET_URL, {
            download: true,
            header: true,
            complete: (results) => {
                // กรองเอาเฉพาะแถวที่มี HYDRANT_ID
                const validData = results.data.filter((item: any) => item.HYDRANT_ID && item.HYDRANT_ID.trim() !== '');

                if (validData.length > 0) {
                    setPoints(validData);
                    setSelected(validData[0]);
                } else {
                    console.warn('โหลดได้ แต่ไม่พบข้อมูล หรือหัวตารางไม่ตรง (ต้องเป็น HYDRANT_ID, LOCATION...)');
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
        if (status.includes('พร้อม') || status.includes('Ready') || status.includes('ปกติ')) return 'status-normal'; // เขียว
        if (status.includes('ต่ำ') || status.includes('Low') || status.includes('ตก')) return 'status-fix'; // เหลือง
        return 'status-broken'; // แดง
    };

    return (
        <div className="sl-container">
            <div className="sl-header">
                <div className="header-row">
                    <div>
                        <h2>ประปาหัวแดง</h2>
                        <p>จุดจ่ายน้ำดับเพลิงและแรงดันน้ำ</p>
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
                        <Droplet size={20} color="#dc2626" />
                        <h3>จุดติดตั้ง ({points.length})</h3>
                    </div>
                    <div className="sl-list-content">
                        {points.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => setSelected(item)}
                                className={`sl-card ${selected?.HYDRANT_ID === item.HYDRANT_ID ? 'active' : ''}`}
                            >
                                <div className="sl-card-row">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="sl-id" style={{ color: '#dc2626' }}>{item.HYDRANT_ID}</span>
                                    </div>
                                    <span className={`sl-status ${getStatusClass(item.STATUS)}`}>{item.STATUS}</span>
                                </div>
                                <p className="sl-location">{item.LOCATION}</p>
                                <div className="sl-date">
                                    <Gauge size={12} /><span>แรงดัน: {item.PRESSURE}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Right Panel --- */}
                <div className="sl-panel">
                    <div className="sl-panel-header">
                        <MapPin size={20} color="#dc2626" />
                        <h3>รายละเอียด</h3>
                    </div>
                    <div className="sl-scrollable-content">
                        <div className="sl-map-area" style={{ backgroundColor: '#fef2f2' }}>
                            <div className="sl-map-bg"></div>
                            <div className="sl-pin-container">
                                <div className="sl-pin" style={{ backgroundColor: '#ef4444', borderColor: 'white' }}>
                                    <Droplet size={24} color="white" />
                                </div>
                                <div className="sl-pin-label">{selected?.HYDRANT_ID || '-'}</div>
                            </div>
                        </div>
                        <div className="sl-detail-box">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
                                {selected?.HYDRANT_ID || '-'}
                            </h2>
                            <div className="sl-detail-grid">
                                <div><span className="sl-field-label">สถานที่ตั้ง</span><p className="sl-field-value">{selected?.LOCATION || '-'}</p></div>
                                <div><span className="sl-field-label">ระดับแรงดันน้ำ</span><p className="sl-field-value">{selected?.PRESSURE || '-'}</p></div>
                                <div>
                                    <span className="sl-field-label">ตรวจสอบล่าสุด</span>
                                    <p className="sl-field-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={16} /> {selected?.LAST_CHECK || '-'}
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

export default FireHydrant;