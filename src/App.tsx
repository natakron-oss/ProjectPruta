import { useState } from 'react';
import './App.css';
import { Search, MapPin, Home, MessageCircle, Lightbulb, Wifi, Droplet } from 'lucide-react';
import Complaint from './Complaint';
import StreetLight from './StreetLight';
import WifiSpot from './WifiSpot';
import FireHydrant from './FireHydrant';
import './Sidebar.css'; // ✅ เรียกใช้ไฟล์ดีไซน์กลาง


function App() {
  const [page, setPage] = useState('overview');

  // ถ้าอยู่หน้าร้องเรียน ก็แสดงหน้าร้องเรียน
  if (page === 'complaint') {
    return <Complaint onBack={() => setPage('overview')} />;
  }

  // ถ้าอยู่หน้าหลัก (Overview)
  return (
    <div className="app-container">

      {/* ✅ Sidebar ฝั่งซ้าย (ใช้โค้ดชุดใหม่ เหมือนหน้า Complaint เป๊ะ!) */}
      <aside className="shared-sidebar">
        <div className="left-header">
          <div className="logo-box"><Home size={24} color="white" /></div>
          <div>
            <h3>เทศบาลตำบล</h3>
            <p>พลูตาหลวง</p>
          </div>
        </div>

        <nav className="nav-menu">
          {/* ปุ่มภาพรวม (Active) */}
          <div
            className={`nav-item ${page === 'overview' ? 'active' : ''}`}
            onClick={() => setPage('overview')}
          >
            <Home size={20} />
            <span>ภาพรวม</span>
          </div>

          {/* ปุ่มระบบร้องเรียน (กดแล้วเปลี่ยนหน้า) */}
          <div
            className="nav-item"
            onClick={() => setPage('complaint')}
          >
            <MessageCircle size={20} />
            <span>ระบบร้องเรียน</span>
          </div>

          <div
            className={`nav-item ${page === 'streetlight' ? 'active' : ''}`}
            onClick={() => setPage('streetlight')}
          >
            <Lightbulb size={20} />
            <span>ไฟส่องสว่าง</span>
          </div>

          <div
            className={`nav-item ${page === 'wifi' ? 'active' : ''}`}
            onClick={() => setPage('wifi')}
          >
            <Wifi size={20} />
            <span>ไวไฟชุมชน</span>
          </div>

          <div
            className={`nav-item ${page === 'firehydrant' ? 'active' : ''}`}
            onClick={() => setPage('firehydrant')}
          >
            <Droplet size={20} />
            <span>ประปาหัวแดง</span>
          </div>

        </nav>
      </aside>
      {page === 'overview' && (
        <>
          {/* --- ส่วนแผนที่ (Map) --- */}
          <div className="map-container">
            <div className="map-overlay"></div>
          </div>

          {/* --- Sidebar ฝั่งขวา (Search) --- */}
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="search-container">
                <Search className="search-icon" />
                <input type="text" placeholder="ค้นหา..." className="search-input" />
              </div>
            </div>
            <div className="sidebar-content">
              <section className="section">
                <h2 className="section-title">ภาพรวมระบบ</h2>
                <div className="places-list">
                  <article className="place-card">
                    <div className="card-image-container"><div className="image-placeholder">IMG</div></div>
                    <div className="card-content">
                      <h3 className="card-title">เรื่องร้องเรียน</h3>
                      <div className="location-info"><MapPin className="map-pin-icon" /></div>
                    </div>
                  </article>
                </div>
              </section>
            </div>
          </aside>
        </>
      )}

      {/* เพิ่มส่วนเรียกหน้าอื่นๆ ต่อท้ายตรงนี้ครับ */}
      {page === 'streetlight' && <StreetLight />}
      {page === 'wifi' && <WifiSpot />}
      {page === 'firehydrant' && <FireHydrant />}

    </div >
  );
}

export default App;