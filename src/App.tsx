import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';
import { Home, MessageCircle, MapPin, Calendar } from 'lucide-react';
import Complaint from './Complaint';
import StreetLight from './StreetLight';
import WifiSpot from './WifiSpot';
import FireHydrant from './FireHydrant';
import CityMap from './CityMap';

function App() {
  const [page, setPage] = useState('overview');
  const [deviceTab, setDeviceTab] = useState<'streetlight' | 'wifi' | 'hydrant'>('streetlight');

  // ===== State เดิม =====
  const [streetLights, setStreetLights] = useState<any[]>([]);
  const [wifiSpots, setWifiSpots] = useState<any[]>([]);
  const [hydrants, setHydrants] = useState<any[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [selectedStreetId, setSelectedStreetId] = useState<string | null>(null);
  const [selectedWifiId, setSelectedWifiId] = useState<string | null>(null);
  const [selectedHydrantId, setSelectedHydrantId] = useState<string | null>(null);

  // ===== ลิ้ง Google Sheet ของคุณ =====
  const SHEET_STREETLIGHT =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQv7p9ib0xXet8Alyik_Fi9CdBVvZO8xz73K4k0wEoNqpwIWAKFGIfbk0IkE8knnp-LXvNA6OceINr1/pub?gid=0&single=true&output=csv';

  const SHEET_WIFI =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQv7p9ib0xXet8Alyik_Fi9CdBVvZO8xz73K4k0wEoNqpwIWAKFGIfbk0IkE8knnp-LXvNA6OceINr1/pub?gid=123712203&single=true&output=csv';

  const SHEET_HYDRANT =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vQv7p9ib0xXet8Alyik_Fi9CdBVvZO8xz73K4k0wEoNqpwIWAKFGIfbk0IkE8knnp-LXvNA6OceINr1/pub?gid=872918807&single=true&output=csv';

  // ===== โหลดข้อมูลจริง =====
  const fetchSheets = () => {
    setLoadingSheets(true);

    Papa.parse(SHEET_STREETLIGHT, {
      download: true,
      header: true,
      complete: (res) => {
        const data = (res.data || []).filter((r: any) => r.ASSET_ID);
        setStreetLights(data);
      }
    });

    Papa.parse(SHEET_WIFI, {
      download: true,
      header: true,
      complete: (res) => {
        const data = (res.data || []).filter((r: any) => r.WIFI_ID);
        setWifiSpots(data);
      }
    });

    Papa.parse(SHEET_HYDRANT, {
      download: true,
      header: true,
      complete: (res) => {
        const data = (res.data || []).filter((r: any) => r.HYDRANT_ID);
        setHydrants(data);
      }
    });

    setTimeout(() => setLoadingSheets(false), 800);
  };

  useEffect(() => { fetchSheets(); }, []);

  // ===== แปลงข้อมูลสำหรับแผนที่ =====
  const getMapDevices = () => {
    const devices: any[] = [];

    // แปลงไฟส่องสว่าง
    streetLights.forEach((item) => {
      let lat = item.LAT ? parseFloat(item.LAT) : null;
      let lng = (item.LNG || item.LON) ? parseFloat(item.LNG || item.LON) : null;
      
      // ข้ามรายการที่ไม่มีพิกัด
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return;
      }
      
      devices.push({
        id: item.ASSET_ID,
        name: item.LOCATION || `โคมไฟ ${item.ASSET_ID}`,
        type: 'streetlight',
        lat: lat,
        lng: lng,
        status: item.STATUS?.toLowerCase() === 'ปกติ' ? 'normal' : 
                item.STATUS?.toLowerCase() === 'ชำรุด' ? 'damaged' : 'repairing',
        department: 'เทศบาลตำบลพลูตาหลวง',
        description: item.LAMP_TYPE || item.BULB_TYPE || ''
      });
    });

    // แปลงไวไฟ
    wifiSpots.forEach((item) => {
      let lat = item.LAT ? parseFloat(item.LAT) : null;
      let lng = (item.LNG || item.LON) ? parseFloat(item.LNG || item.LON) : null;
      
      // ข้ามรายการที่ไม่มีพิกัด
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return;
      }
      
      devices.push({
        id: item.WIFI_ID,
        name: item.LOCATION || `WiFi ${item.WIFI_ID}`,
        type: 'wifi',
        lat: lat,
        lng: lng,
        status: item.STATUS?.toLowerCase() === 'ปกติ' ? 'normal' : 
                item.STATUS?.toLowerCase() === 'ชำรุด' ? 'damaged' : 'repairing',
        department: 'เทศบาลตำบลพลูตาหลวง',
        description: item.ISP || ''
      });
    });

    // แปลงหัวดับเพลิง/ประปา
    hydrants.forEach((item) => {
      let lat = item.LAT ? parseFloat(item.LAT) : null;
      let lng = (item.LNG || item.LON) ? parseFloat(item.LNG || item.LON) : null;
      
      // ข้ามรายการที่ไม่มีพิกัด
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return;
      }
      
      devices.push({
        id: item.HYDRANT_ID,
        name: item.LOCATION || `ประปา ${item.HYDRANT_ID}`,
        type: 'hydrant',
        lat: lat,
        lng: lng,
        status: item.STATUS?.toLowerCase() === 'ปกติ' ? 'normal' : 
                item.STATUS?.toLowerCase() === 'ชำรุด' ? 'damaged' : 'repairing',
        department: 'เทศบาลตำบลพลูตาหลวง',
        description: item.PRESSURE ? `แรงดัน: ${item.PRESSURE}` : ''
      });
    });

    console.log('Map Devices:', devices); // Debug: ดูข้อมูลที่ส่งไปแผนที่
    console.log('Total devices:', devices.length);
    return devices;
  };

  // ===== หน้าร้องเรียนเดิม =====
  if (page === 'complaint') {
    return <Complaint onBack={() => setPage('overview')} />;
  }

  return (
    <div className="app-container">

      {/* Sidebar ซ้าย */}
      <aside className="shared-sidebar">
        <div className="sidebar-left-header">
          <div className="logo-icon"><Home size={20} color="white" /></div>
          <div>
            <h3>เทศบาลตำบล</h3>
            <p>พลูตาหลวง</p>
          </div>
        </div>

        <div className="menu-list">
          <div className={`menu-item ${page==='overview'?'active':''}`}
            onClick={()=>setPage('overview')}>
            <Home size={18}/> ภาพรวม
          </div>

          <div className={`menu-item ${page==='complaint'?'active':''}`}
            onClick={()=>setPage('complaint')}>
            <MessageCircle size={18}/> ระบบร้องเรียน
          </div>

          <div className={`menu-item ${page==='devices'?'active':''}`}
            onClick={()=>setPage('devices')}>
            <MapPin size={18}/> อุปกรณ์
          </div>
        </div>
      </aside>

      {/* ===== Overview เดิม (ใช้ข้อมูลจริง) ===== */}
      {page === 'overview' && (
        <>
          <div className="map-container">
            <CityMap devices={getMapDevices()} loading={loadingSheets} />
          </div>

          <aside className="sidebar">
            <div className="sidebar-header">
              ข้อมูลอุปกรณ์
            </div>

            <div className="sidebar-content">
              {/* สถิติอุปกรณ์บนแผนที่ */}
              <div className="list-block" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px'}}>
                <h3 style={{color: 'white', marginBottom: '12px'}}>📍 แผนที่ดิจิทัล</h3>
                <div style={{fontSize: '0.9rem', opacity: 0.95}}>
                  <p style={{margin: '4px 0'}}>แสดงอุปกรณ์: <strong>{getMapDevices().length}</strong> รายการ</p>
                  <p style={{margin: '4px 0', fontSize: '0.85rem', opacity: 0.85}}>
                    💡 ไฟ: {getMapDevices().filter(d => d.type === 'streetlight').length} | 
                    📶 WiFi: {getMapDevices().filter(d => d.type === 'wifi').length} | 
                    🚒 ประปา: {getMapDevices().filter(d => d.type === 'hydrant').length}
                  </p>
                </div>
              </div>

              <div className="list-block">
                <h3>ไฟ ({streetLights.length})</h3>
                {streetLights.map((it,i)=>(
                  <div key={i} className="list-card" onClick={() => { setSelectedStreetId(it.ASSET_ID || null); setPage('streetlight'); }}>
                    <div className="card-left">
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <a className="card-id">{it.ASSET_ID}</a>
                        {(it.LAMP_TYPE || it.BULB_TYPE) && (
                          <span className="card-badge">{it.LAMP_TYPE || it.BULB_TYPE}</span>
                        )}
                      </div>
                      <div className="card-sub">{it.LOCATION}{it.MOO ? ` (หมู่ ${it.MOO})` : ''}</div>
                    </div>
                    <div className="card-right">
                      <div className={`status-pill ${it.STATUS ? it.STATUS.toLowerCase() : ''}`}>
                        <span className={`status-dot ${it.STATUS ? it.STATUS.toLowerCase() : ''}`}></span>
                        {it.STATUS || '-'}
                      </div>
                      <div className="card-date"><Calendar size={12} /> {it.IMG_DATE || it.STATUSDATE || ''}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="list-block">
                <h3>ไวไฟ ({wifiSpots.length})</h3>
                {wifiSpots.map((it,i)=>(
                  <div key={i} className="list-card" onClick={() => { setSelectedWifiId(it.WIFI_ID || null); setPage('wifi'); }}>
                    <div className="card-left">
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <a className="card-id">{it.WIFI_ID}</a>
                        {it.ISP && <span className="card-badge">{it.ISP}</span>}
                      </div>
                      <div className="card-sub">{it.LOCATION}</div>
                    </div>
                    <div className="card-right">
                      <div className={`status-pill ${it.STATUS ? it.STATUS.toLowerCase() : ''}`}>
                        <span className={`status-dot ${it.STATUS ? it.STATUS.toLowerCase() : ''}`}></span>
                        {it.STATUS || '-'}
                      </div>
                      <div className="card-date"><Calendar size={12} /> {it.SPEED || ''}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="list-block">
                <h3>ประปา ({hydrants.length})</h3>
                {hydrants.map((it,i)=>(
                  <div key={i} className="list-card" onClick={() => { setSelectedHydrantId(it.HYDRANT_ID || null); setPage('firehydrant'); }}>
                    <div className="card-left">
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <a className="card-id">{it.HYDRANT_ID}</a>
                      </div>
                      <div className="card-sub">{it.LOCATION}</div>
                    </div>
                    <div className="card-right">
                      <div className={`status-pill ${it.STATUS ? it.STATUS.toLowerCase() : ''}`}>
                        <span className={`status-dot ${it.STATUS ? it.STATUS.toLowerCase() : ''}`}></span>
                        {it.STATUS || '-'}
                      </div>
                      <div className="card-date"><Calendar size={12} /> {it.PRESSURE || ''}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </aside>
        </>
      )}

      {/* Render individual device pages when selected from overview */}
      {page === 'streetlight' && <StreetLight selectedId={selectedStreetId ?? undefined} />}
      {page === 'wifi' && <WifiSpot selectedId={selectedWifiId ?? undefined} />}
      {page === 'firehydrant' && <FireHydrant selectedId={selectedHydrantId ?? undefined} />}

      {/* ===== หน้า Devices ใหม่ (ใช้ sheet เดียวกัน) ===== */}
      {page === 'devices' && (
        <div className="device-page">

          <div className="device-tabs">
            <button className={deviceTab==='streetlight'?'active':''}
              onClick={()=>setDeviceTab('streetlight')}>
              ไฟส่องสว่าง
            </button>

            <button className={deviceTab==='wifi'?'active':''}
              onClick={()=>setDeviceTab('wifi')}>
              ไวไฟ
            </button>

            <button className={deviceTab==='hydrant'?'active':''}
              onClick={()=>setDeviceTab('hydrant')}>
              ประปา
            </button>
          </div>

          <div className="device-content">
            {deviceTab==='streetlight' && <StreetLight selectedId={selectedStreetId ?? undefined} />}
            {deviceTab==='wifi' && <WifiSpot selectedId={selectedWifiId ?? undefined} />}
            {deviceTab==='hydrant' && <FireHydrant selectedId={selectedHydrantId ?? undefined} />}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;