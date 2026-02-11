import { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import Papa from 'papaparse';
import './App.css';
import { Home, MapPin, List, ChevronUp, ChevronDown, Plus } from 'lucide-react'; 

// --- Import Components ---
import StreetLight from './StreetLight';
import WifiSpot from './WifiSpot';
import FireHydrant from './FireHydrant';
import CityMap from './CityMap';
import AddPositionModal, { NewPositionData } from './AddPositionModal';
// import Complaint from './Complaint'; 

function App() {
  const [page, setPage] = useState('overview');
  const [deviceTab, setDeviceTab] = useState<'streetlight' | 'wifi' | 'hydrant'>('streetlight');

  // ===== 1. Toggle Panel (เปิด/ปิด) =====
  const [isPanelOpen, setIsPanelOpen] = useState(false); 

  // ===== Add Position States =====
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [tempLat, setTempLat] = useState(0);
  const [tempLng, setTempLng] = useState(0);
  const [newPositions, setNewPositions] = useState<any[]>([]); 

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

  // ===== 5. แปลงข้อมูล (ตัดระบบสุ่มออกแล้ว!) =====
  const mapDevices = useMemo(() => {
    const devices: any[] = [];

    
    const parseRangeMeters = (row: any): number | undefined => {
      const raw = row?.RANGE ?? row?.range ?? row?.Range;
      if (raw === undefined || raw === null || raw === '') return 0;
      const meters = typeof raw === 'number' ? raw : parseFloat(String(raw));
      if (!Number.isFinite(meters) || meters <= 0) return 0;
      return meters;
    };

    // --- ไฟส่องสว่าง ---
    streetLights.forEach((item) => {
      let lat = parseFloat(item.LAT); 
      let lng = parseFloat(item.LNG || item.LON);
      
      // ถ้าไม่มีพิกัด ให้ข้ามไปเลย (ไม่สุ่มแล้ว)
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      devices.push({ id: item.ASSET_ID, name: item.LOCATION || `โคมไฟ`, type: 'streetlight', lat, lng, status: item.STATUS?.toLowerCase() === 'ปกติ' ? 'normal' : item.STATUS?.toLowerCase() === 'ชำรุด' ? 'damaged' : 'repairing', department: 'เทศบาลตำบลพลูตาหลวง', description: item.LAMP_TYPE || '', rangeMeters: parseRangeMeters(item) });
    });

    // --- WiFi ---
    wifiSpots.forEach((item) => {
      let lat = parseFloat(item.LAT); 
      let lng = parseFloat(item.LNG || item.LON);
      
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      devices.push({ id: item.WIFI_ID, name: item.LOCATION || `WiFi`, type: 'wifi', lat, lng, status: item.STATUS?.toLowerCase() === 'ปกติ' ? 'normal' : item.STATUS?.toLowerCase() === 'ชำรุด' ? 'damaged' : 'repairing', department: 'เทศบาลตำบลพลูตาหลวง', description: item.ISP || '', rangeMeters: parseRangeMeters(item) });
    });

    // --- ประปา ---
    hydrants.forEach((item) => {
      let lat = parseFloat(item.LAT); 
      let lng = parseFloat(item.LNG || item.LON);
      
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      devices.push({ id: item.HYDRANT_ID, name: item.LOCATION || `ประปา`, type: 'hydrant', lat, lng, status: item.STATUS?.toLowerCase() === 'ปกติ' ? 'normal' : item.STATUS?.toLowerCase() === 'ชำรุด' ? 'damaged' : 'repairing', department: 'เทศบาลตำบลพลูตาหลวง', description: item.PRESSURE || '', rangeMeters: parseRangeMeters(item) });
    });

    // --- เพิ่มตำแหน่งใหม่ที่สร้างเอง ---
    newPositions.forEach((item) => {
      devices.push(item);
    });

    return devices;
  }, [streetLights, wifiSpots, hydrants, newPositions, newPositions]); 

  // ===== Handle Add Position =====
  const handleAddPosition = (lat: number, lng: number) => {
    setTempLat(lat);
    setTempLng(lng);
    setIsAddModalOpen(true);
  };

  const handleSavePosition = (data: NewPositionData) => {
    const newDevice = {
      id: `NEW-${Date.now()}`,
      name: data.name,
      type: data.type,
      lat: data.lat,
      lng: data.lng,
      status: data.status,
      department: 'เทศบาลตำบลพลูตาหลวง',
      description: data.description
    };
    
    setNewPositions([...newPositions, newDevice]);
    setAddMode(false);
    alert('เพิ่มตำแหน่งใหม่สำเร็จ!');
  };

  const toggleAddMode = () => {
    setAddMode(!addMode);
    if (!addMode) {
      alert('คลิกบนแผนที่เพื่อเลือกตำแหน่งที่ต้องการเพิ่ม');
    }
  }; 

  // if (page === 'complaint') return <Complaint onBack={() => setPage('overview')} />;

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>

      {/* --- 1. Sidebar ซ้าย --- */}
      <aside className="shared-sidebar" style={{ width: '250px', flexShrink: 0, zIndex: 20 }}>
        <div className="sidebar-left-header">
          <div className="logo-icon"><Home size={20} color="white" /></div>
          <div><h3>เทศบาลตำบล</h3><p>พลูตาหลวง</p></div>
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
              <CityMap
                devices={mapDevices}
                loading={loadingSheets}
                showRanges
                addMode={addMode}
                onAddPosition={handleAddPosition}
              />

              
              {/* ปุ่มเพิ่มตำแหน่ง */}
              <button
                onClick={toggleAddMode}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  zIndex: 1000,
                  backgroundColor: addMode ? '#ef4444' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
              >
                <Plus size={20} />
                {addMode ? 'ยกเลิก' : 'เพิ่มตำแหน่ง'}
              </button>
            </div>

            {/* B. Slide Panel (Click to Toggle) */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,       
                right: '20px',   
                width: '380px',  
                
                // Toggle ความสูง
                height: isPanelOpen ? 'calc(100% - 20px)' : '60px', 
                borderRadius: '16px',
                marginBottom: isPanelOpen ? '10px' : '0',
                
                zIndex: 1000,
                backgroundColor: 'white',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out'
              }}
            >
              {/* Header (คลิกเพื่อเปิด/ปิด) */}
              <div 
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                style={{
                  minHeight: '60px',
                  background: 'white',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 1rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '8px', color: 'white' }}>
                    <List size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>รายการอุปกรณ์</h3>
                  </div>
                </div>

                <div style={{ color: '#94a3b8', display: 'flex' }}>
                   {isPanelOpen ? <ChevronDown size={24}/> : <ChevronUp size={24}/>}
                </div>
              </div>

              {/* Content List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc' }}>
                
                <div style={{marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b'}}>
                  ทั้งหมด {streetLights.length + wifiSpots.length + hydrants.length} จุด
                </div>

                {/* ไฟส่องสว่าง */}
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>💡 ไฟส่องสว่าง ({streetLights.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {streetLights.map((it,i)=>(
                    <div key={`sl-${i}`} className="list-card" onClick={(e) => { e.stopPropagation(); setSelectedStreetId(it.ASSET_ID || null); setPage('streetlight'); }}>
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
                    <div key={`wf-${i}`} className="list-card" onClick={(e) => { e.stopPropagation(); setSelectedWifiId(it.WIFI_ID || null); setPage('wifi'); }}>
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
                    <div key={`hd-${i}`} className="list-card" onClick={(e) => { e.stopPropagation(); setSelectedHydrantId(it.HYDRANT_ID || null); setPage('firehydrant'); }}>
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

        {/* กรณีหน้า Detail */}
        {page === 'streetlight' && <StreetLight selectedId={selectedStreetId ?? undefined} />}
        {page === 'wifi' && <WifiSpot selectedId={selectedWifiId ?? undefined} />}
        {page === 'firehydrant' && <FireHydrant selectedId={selectedHydrantId ?? undefined} />}
        
        {/* กรณีหน้า Devices */}
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
      {/* Add Position Modal */}
      <AddPositionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddMode(false);
        }}
        onSave={handleSavePosition}
        initialLat={tempLat}
        initialLng={tempLng}
      />    </div>
  );
}

export default App;