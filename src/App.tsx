import { useState, useEffect, useRef, useMemo } from 'react';
// @ts-ignore
import Papa from 'papaparse';
import './App.css';
import { Home, MapPin, List, GripHorizontal } from 'lucide-react';
import StreetLight from './StreetLight';
import WifiSpot from './WifiSpot';
import FireHydrant from './FireHydrant';
import CityMap from './CityMap';

function App() {
  const [page, setPage] = useState('overview');
  const [deviceTab, setDeviceTab] = useState<'streetlight' | 'wifi' | 'hydrant'>('streetlight');

  // ===== 1. ระบบ Drag Panel (ปรับความสูง) =====
  const [panelHeight, setPanelHeight] = useState(400); 
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // ===== 2. Data States =====
  const [streetLights, setStreetLights] = useState<any[]>([]);
  const [wifiSpots, setWifiSpots] = useState<any[]>([]);
  const [hydrants, setHydrants] = useState<any[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  
  // Selection States
  const [selectedStreetId, setSelectedStreetId] = useState<string | null>(null);
  const [selectedWifiId, setSelectedWifiId] = useState<string | null>(null);
  const [selectedHydrantId, setSelectedHydrantId] = useState<string | null>(null);

  // ===== 3. Google Sheet Links =====
  const SHEET_STREETLIGHT = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQv7p9ib0xXet8Alyik_Fi9CdBVvZO8xz73K4k0wEoNqpwIWAKFGIfbk0IkE8knnp-LXvNA6OceINr1/pub?gid=0&single=true&output=csv';
  const SHEET_WIFI = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQv7p9ib0xXet8Alyik_Fi9CdBVvZO8xz73K4k0wEoNqpwIWAKFGIfbk0IkE8knnp-LXvNA6OceINr1/pub?gid=123712203&single=true&output=csv';
  const SHEET_HYDRANT = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQv7p9ib0xXet8Alyik_Fi9CdBVvZO8xz73K4k0wEoNqpwIWAKFGIfbk0IkE8knnp-LXvNA6OceINr1/pub?gid=872918807&single=true&output=csv';

  // ===== 4. Fetch Data =====
  const fetchSheets = () => {
    setLoadingSheets(true);
    Papa.parse(SHEET_STREETLIGHT, { download: true, header: true, complete: (res: any) => { setStreetLights((res.data || []).filter((r: any) => r.ASSET_ID)); } });
    Papa.parse(SHEET_WIFI, { download: true, header: true, complete: (res: any) => { setWifiSpots((res.data || []).filter((r: any) => r.WIFI_ID)); } });
    Papa.parse(SHEET_HYDRANT, { download: true, header: true, complete: (res: any) => { setHydrants((res.data || []).filter((r: any) => r.HYDRANT_ID)); } });
    setTimeout(() => setLoadingSheets(false), 800);
  };
  useEffect(() => { fetchSheets(); }, []);

  // ===== 5. Logic การลาก (Drag Logic) =====
  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = dragStartY.current - e.clientY;
      const newHeight = dragStartHeight.current + deltaY;
      const maxHeight = window.innerHeight * 0.9; 
      
      if (newHeight >= 60 && newHeight <= maxHeight) {
        setPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const startDragging = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  // ===== 6. Helper: สร้างพิกัดสุ่ม =====
  const generateRandomCoords = (centerLat: number, centerLng: number, radiusKm: number = 2) => {
    const radiusInDegrees = radiusKm / 111;
    const u = Math.random(); const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u); const t = 2 * Math.PI * v;
    const x = w * Math.cos(t); const y = w * Math.sin(t);
    return { lat: centerLat + y, lng: centerLng + x / Math.cos(centerLat * Math.PI / 180) };
  };

  // ===== 7. useMemo: ล็อคข้อมูลแผนที่ =====
  const mapDevices = useMemo(() => {
    const devices: any[] = [];
    const CENTER_LAT = 12.7011; const CENTER_LNG = 100.9674;

    streetLights.forEach((item) => {
      let lat = parseFloat(item.LAT); let lng = parseFloat(item.LNG);
      if (!lat || !lng || isNaN(lat)) { const c = generateRandomCoords(CENTER_LAT, CENTER_LNG, 1.5); lat = c.lat; lng = c.lng; }
      devices.push({ id: item.ASSET_ID, name: item.LOCATION || `โคมไฟ`, type: 'streetlight', lat, lng, status: item.STATUS?.toLowerCase() === 'ปกติ' ? 'normal' : item.STATUS?.toLowerCase() === 'ชำรุด' ? 'damaged' : 'repairing', department: 'เทศบาลตำบลพลูตาหลวง', description: item.LAMP_TYPE || '' });
    });

    wifiSpots.forEach((item) => {
      let lat = parseFloat(item.LAT); let lng = parseFloat(item.LNG);
      if (!lat || !lng || isNaN(lat)) { const c = generateRandomCoords(CENTER_LAT, CENTER_LNG, 2); lat = c.lat; lng = c.lng; }
      devices.push({ id: item.WIFI_ID, name: item.LOCATION || `WiFi`, type: 'wifi', lat, lng, status: item.STATUS?.toLowerCase() === 'ปกติ' ? 'normal' : item.STATUS?.toLowerCase() === 'ชำรุด' ? 'damaged' : 'repairing', department: 'เทศบาลตำบลพลูตาหลวง', description: item.ISP || '' });
    });

    hydrants.forEach((item) => {
      let lat = parseFloat(item.LAT); let lng = parseFloat(item.LNG);
      if (!lat || !lng || isNaN(lat)) { const c = generateRandomCoords(CENTER_LAT, CENTER_LNG, 2); lat = c.lat; lng = c.lng; }
      devices.push({ id: item.HYDRANT_ID, name: item.LOCATION || `ประปา`, type: 'hydrant', lat, lng, status: item.STATUS?.toLowerCase() === 'ปกติ' ? 'normal' : item.STATUS?.toLowerCase() === 'ชำรุด' ? 'damaged' : 'repairing', department: 'เทศบาลตำบลพลูตาหลวง', description: item.PRESSURE || '' });
    });

    return devices;
  }, [streetLights, wifiSpots, hydrants]); 

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>

      {/* --- 1. Sidebar ซ้าย (เหลือแค่ 2 เมนู) --- */}
      <aside className="shared-sidebar" style={{ width: '250px', flexShrink: 0, zIndex: 20 }}>
        <div className="sidebar-left-header">
          <div className="logo-icon"><Home size={20} color="white" /></div>
          <div><h3>เทศบาลเมือง</h3><p>พลูตาหลวง</p></div>
        </div>
        <div className="menu-list">
          <div className={`menu-item ${page==='overview'?'active':''}`} onClick={()=>setPage('overview')}><Home size={18}/> ภาพรวม</div>
          <div className={`menu-item ${page==='devices'?'active':''}`} onClick={()=>setPage('devices')}><MapPin size={18}/> อุปกรณ์</div>
        </div>
      </aside>

      {/* --- 2. พื้นที่หลัก (ขวา) --- */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* กรณีหน้า Overview */}
        {page === 'overview' && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            
            {/* A. แผนที่ */}
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
              <CityMap devices={mapDevices} loading={loadingSheets} />
            </div>

            {/* B. Floating Panel (ลากได้) */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,       
                right: '20px',   
                width: '380px',  
                height: `${panelHeight}px`,
                zIndex: 1000,
                backgroundColor: 'white',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: isDragging ? 'none' : 'height 0.2s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              {/* Header ของ Panel */}
              <div 
                onMouseDown={startDragging}
                style={{
                  minHeight: '54px',
                  background: 'white',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 1rem',
                  cursor: 'row-resize',
                  userSelect: 'none',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#3b82f6', padding: '6px', borderRadius: '8px', color: 'white' }}>
                    <List size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>รายการอุปกรณ์</h3>
                  </div>
                </div>

                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8', display: 'flex' }}>
                  <GripHorizontal size={20} />
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {streetLights.length + wifiSpots.length + hydrants.length} จุด
                </div>
              </div>

              {/* Content List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc', opacity: panelHeight < 100 ? 0 : 1 }}>
                
                {/* ไฟส่องสว่าง */}
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>💡 ไฟส่องสว่าง ({streetLights.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {streetLights.map((it,i)=>(
                    <div key={`sl-${i}`} className="list-card" onClick={() => { setSelectedStreetId(it.ASSET_ID || null); setPage('streetlight'); }}>
                      <div className="card-left">
                        <div style={{fontWeight:600, fontSize:'0.9rem'}}>#{it.ASSET_ID}</div>
                        <div className="card-sub">{it.LOCATION}</div>
                      </div>
                      <div className={`status-pill ${it.STATUS ? it.STATUS.toLowerCase() : ''}`}>
                         {it.STATUS || '-'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* WiFi */}
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>📶 Wi-Fi ({wifiSpots.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {wifiSpots.map((it,i)=>(
                    <div key={`wf-${i}`} className="list-card" onClick={() => { setSelectedWifiId(it.WIFI_ID || null); setPage('wifi'); }}>
                       <div className="card-left">
                        <div style={{fontWeight:600, fontSize:'0.9rem'}}>#{it.WIFI_ID}</div>
                        <div className="card-sub">{it.LOCATION}</div>
                      </div>
                      <div className={`status-pill ${it.STATUS ? it.STATUS.toLowerCase() : ''}`}>
                         {it.STATUS || '-'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ประปา */}
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>🚒 ประปา/ดับเพลิง ({hydrants.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {hydrants.map((it,i)=>(
                    <div key={`hd-${i}`} className="list-card" onClick={() => { setSelectedHydrantId(it.HYDRANT_ID || null); setPage('firehydrant'); }}>
                      <div className="card-left">
                        <div style={{fontWeight:600, fontSize:'0.9rem'}}>#{it.HYDRANT_ID}</div>
                        <div className="card-sub">{it.LOCATION}</div>
                      </div>
                      <div className={`status-pill ${it.STATUS ? it.STATUS.toLowerCase() : ''}`}>
                         {it.STATUS || '-'}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* กรณีหน้า Detail (กดจากการ์ด) */}
        {page === 'streetlight' && <StreetLight selectedId={selectedStreetId ?? undefined} />}
        {page === 'wifi' && <WifiSpot selectedId={selectedWifiId ?? undefined} />}
        {page === 'firehydrant' && <FireHydrant selectedId={selectedHydrantId ?? undefined} />}
        
        {/* กรณีหน้า Devices (เมนูซ้าย) */}
        {page === 'devices' && (
          <div className="device-page" style={{ padding: '20px', background: 'white', height: '100%', overflowY: 'auto' }}>
            <div className="device-tabs">
              <button className={deviceTab==='streetlight'?'active':''} onClick={()=>setDeviceTab('streetlight')}>ไฟส่องสว่าง</button>
              <button className={deviceTab==='wifi'?'active':''} onClick={()=>setDeviceTab('wifi')}>ไวไฟ</button>
              <button className={deviceTab==='hydrant'?'active':''} onClick={()=>setDeviceTab('hydrant')}>ประปา</button>
            </div>
            <div className="device-content">
              {deviceTab==='streetlight' && <StreetLight selectedId={selectedStreetId ?? undefined} />}
              {deviceTab==='wifi' && <WifiSpot selectedId={selectedWifiId ?? undefined} />}
              {deviceTab==='hydrant' && <FireHydrant selectedId={selectedHydrantId ?? undefined} />}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;