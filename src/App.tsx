import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';
import { Home, MessageCircle, MapPin, Calendar } from 'lucide-react';
import Complaint from './Complaint';
import StreetLight from './StreetLight';
import WifiSpot from './WifiSpot';
import FireHydrant from './FireHydrant';

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
          <div className="map-container"></div>

          <aside className="sidebar">
            <div className="sidebar-header">
              ข้อมูลอุปกรณ์
            </div>

            <div className="sidebar-content">

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
