import React, { useState, useEffect, useRef } from 'react';
import { Droplet, MapPin, Calendar, RefreshCw, Gauge } from 'lucide-react';
import Papa from 'papaparse';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './durablearticles.css'; // ✅ ใช้ CSS ดีไซน์เดิม (Re-use)
import { parseDeviceStatus, statusColors } from './status';
import ReportButton from './ReportButton';

// แก้ไขปัญหา default icon ของ Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ✅ ใส่ลิงก์ CSV ของคุณเรียบร้อยครับ
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQv7p9ib0xXet8Alyik_Fi9CdBVvZO8xz73K4k0wEoNqpwIWAKFGIfbk0IkE8knnp-LXvNA6OceINr1/pub?gid=872918807&single=true&output=csv';

const fallbackData = [
    { HYDRANT_ID: 'รอโหลด...', LOCATION: '-', PRESSURE: '-', STATUS: 'ปกติ', LAT: 12.70, LON: 100.90, LAST_CHECK: '-' },
];

type Props = { selectedId?: string };

const FireHydrant: React.FC<Props> = ({ selectedId }) => {
    const [points, setPoints] = useState<any[]>(fallbackData);
    const [selected, setSelected] = useState<any>(fallbackData[0]);
    const [loading, setLoading] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<L.Marker | null>(null);

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
                    if (selectedId) {
                        const found = validData.find((d: any) => d.HYDRANT_ID === selectedId);
                        setSelected(found || validData[0]);
                    } else {
                        setSelected(validData[0]);
                    }
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

    // สร้างและอัปเดตแผนที่เมื่อเลือกหัวดับเพลิงใหม่
    useEffect(() => {
        if (!mapContainerRef.current || !selected) return;

        const lat = selected.LAT ? parseFloat(selected.LAT) : null;
        const lng = selected.LON || selected.LNG ? parseFloat(selected.LON || selected.LNG) : null;

        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            return;
        }

        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current).setView([lat, lng], 16);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
        } else {
            mapRef.current.setView([lat, lng], 16);
        }

        if (markerRef.current) {
            markerRef.current.remove();
        }

        const markerColor = statusColors[parseDeviceStatus(selected.STATUS)];
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-container" style="background-color: ${markerColor}">
                    <span class="marker-icon">🚒</span>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);
        markerRef.current = marker;

        const popupContent = `
            <div style="padding: 8px;">
                <h4 style="margin: 0 0 8px 0; font-size: 1rem; font-weight: 600;">
                    🚒 ${selected.HYDRANT_ID || '-'}
                </h4>
                <p style="margin: 4px 0; font-size: 0.875rem;">
                    <strong>สถานที่:</strong> ${selected.LOCATION || '-'}
                </p>
                <p style="margin: 4px 0; font-size: 0.875rem;">
                    <strong>พิกัด:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </p>
                <p style="margin: 4px 0; font-size: 0.875rem;">
                    <strong>สถานะ:</strong> ${selected.STATUS || '-'}
                </p>
                <p style="margin: 4px 0; font-size: 0.875rem;">
                    <strong>แรงดัน:</strong> ${selected.PRESSURE || '-'}
                </p>
            </div>
        `;
        marker.bindPopup(popupContent);

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [selected]);

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
                        <div className="sl-map-area" ref={mapContainerRef} style={{ height: '300px', width: '100%', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
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
                          <ReportButton 
                   deviceId={selected?.WIFI_ID || ''} 
                   deviceName={selected?.WIFI_NAME || ''}
                   location={selected?.ADDRESS || ''}
                   status={selected?.WIFI_STATUS || ''}
                />
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .spin-anim { animation: spin 1s linear infinite; } 
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                
                /* Custom Marker Styles */
                .custom-marker {
                    background: transparent;
                    border: none;
                }
                
                .marker-container {
                    width: 40px;
                    height: 40px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                    border: 3px solid white;
                }
                
                .marker-icon {
                    transform: rotate(45deg);
                    font-size: 20px;
                }
            `}</style>
        </div>
    );
};

export default FireHydrant;