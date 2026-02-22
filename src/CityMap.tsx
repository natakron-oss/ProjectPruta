import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import { CityDevice } from './mockData';
import './CityMap.css';
import { type DeviceStatus, statusColors, statusLabels as sharedStatusLabels } from './status';

// แก้ไขปัญหา default icon ของ Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CityMapProps {
  devices: CityDevice[];
  loading?: boolean;
  onAddPosition?: (lat: number, lng: number) => void;
  addMode?: boolean;
  showRanges?: boolean;
}

export interface CityDevice {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  status: DeviceStatus;
  department: string;
  description?: string;
  /** ระยะครอบคลุมของอุปกรณ์ (เมตร) ถ้ามีจะ override ค่า default ตาม type */
  rangeMeters?: number;
}

// กำหนดสีและไอคอนสำหรับแต่ละประเภทอุปกรณ์
const deviceIcons: Record<string, { color: string; icon: string; label: string }> = {
  streetlight: {
    color: '#f59e0b',
    icon: '💡',
    label: 'ไฟส่องสว่าง'
  },
  hydrant: {
    color: '#ef4444',
    icon: '🚒',
    label: 'หัวดับเพลิง/ประปา'
  },
  cctv: {
    color: '#3b82f6',
    icon: '📹',
    label: 'กล้อง CCTV'
  },
  wifi: {
    color: '#10b981',
    icon: '📶',
    label: 'Wi-Fi สาธารณะ'
  },
  busstop: {
    color: '#8b5cf6',
    icon: '🚌',
    label: 'ป้ายรถเมล์'
  }
};

// สถานะอุปกรณ์
const statusLabels = sharedStatusLabels;

function CityMap({ devices, loading = false, onAddPosition, addMode = false, showRanges = true }: CityMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const rangeLayerRef = useRef<L.LayerGroup | null>(null);

  const [isTilesLoading, setIsTilesLoading] = useState(true);

  const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(deviceIcons).forEach((t) => {
      initial[t] = true;
    });
    return initial;
  });

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    devices.forEach((d) => set.add(d.type));
    return Array.from(set);
  }, [devices]);

  const visibleDevices = useMemo(() => {
    return devices.filter((d) => enabledTypes[d.type] !== false);
  }, [devices, enabledTypes]);

    const getDeviceRangeMeters = (device: CityDevice): number => {
    if (typeof device.rangeMeters === 'number' && Number.isFinite(device.rangeMeters) && device.rangeMeters >= 0) {
      return device.rangeMeters;
    }

    // ถ้าไม่มี RANGE ให้เป็น 0 ทุกอุปกรณ์
    return 0;
  };

  const addDeviceRangeHeat = (layer: L.LayerGroup, device: CityDevice) => {
    const deviceInfo = deviceIcons[device.type];
    if (!deviceInfo) return;

    const baseRadius = getDeviceRangeMeters(device);
    if (baseRadius <= 0) return;
    const color = statusColors[device.status];

    // ทำเป็นวงกลมซ้อนหลายชั้นให้ดูเหมือน heat/gradient (Leaflet ไม่มี radial gradient fill โดยตรง)
    const rings: Array<{ radius: number; opacity: number }> = [
      { radius: baseRadius, opacity: 0.10 },
      { radius: baseRadius * 0.66, opacity: 0.14 },
      { radius: baseRadius * 0.33, opacity: 0.22 },
    ];

    rings.forEach((ring) => {
      L.circle([device.lat, device.lng], {
        radius: ring.radius,
        stroke: false,
        fillColor: color,
        fillOpacity: ring.opacity,
        interactive: false,
      }).addTo(layer);
    });
  };

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([13.7367, 100.5332], 13);
    mapRef.current = map;

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    // Loading indicator for map tiles
    setIsTilesLoading(true);
    tiles.on('loading', () => setIsTilesLoading(true));
    tiles.on('load', () => setIsTilesLoading(false));
    tiles.on('tileerror', () => setIsTilesLoading(false));

    tiles.addTo(map);

    rangeLayerRef.current = L.layerGroup().addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerLayerRef.current = null;
      rangeLayerRef.current = null;
      tempMarkerRef.current = null;
    };
  }, []);

  // Update click-to-add handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.off('click');
    if (!(addMode && onAddPosition)) return;

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
      }

      const tempIcon = L.divIcon({
        className: 'temp-marker',
        html: `
            <div class="marker-container temp-marker-icon" style="background-color: #8b5cf6; animation: pulse 1.5s infinite;">
              <span class="marker-icon">📍</span>
            </div>
          `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      tempMarkerRef.current = L.marker([lat, lng], { icon: tempIcon }).addTo(map);
      tempMarkerRef.current.bindPopup('ตำแหน่งใหม่<br>คลิกปุ่มบันทึกด้านล่าง').openPopup();
      onAddPosition(lat, lng);
    });
  }, [addMode, onAddPosition]);

  // Update layers when data/filter changes
  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    const rangeLayer = rangeLayerRef.current;
    if (!map || !markerLayer || !rangeLayer) return;

    markerLayer.clearLayers();
    rangeLayer.clearLayers();

    visibleDevices.forEach((device) => {
      if (showRanges) {
        addDeviceRangeHeat(rangeLayer, device);
      }
      addDeviceMarker(markerLayer, device);
    });

    // Update center based on visible devices
    if (visibleDevices.length > 0) {
      let centerLat = 0;
      let centerLng = 0;
      visibleDevices.forEach((d) => {
        centerLat += d.lat;
        centerLng += d.lng;
      });
      centerLat /= visibleDevices.length;
      centerLng /= visibleDevices.length;
      map.setView([centerLat, centerLng], 14);
    }
  }, [visibleDevices, showRanges]);

const addDeviceMarker = (layer: L.LayerGroup, device: CityDevice) => {
    const deviceInfo = deviceIcons[device.type];
    if (!deviceInfo) return;
    
    const markerColor = statusColors[device.status];

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-container" style="background-color: ${markerColor}">
          <span class="marker-icon">${deviceInfo.icon}</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    const marker = L.marker([device.lat, device.lng], { icon: customIcon }).addTo(layer);


    const popupContent = `
      <div class="device-popup" style="font-family: 'Prompt', sans-serif;">
        
        <div class="popup-cover" style="height: 140px; background-color: #f3f4f6; position: relative; display: flex; justify-content: center; align-items: center;">
          <span style="font-size: 64px; opacity: 0.2;">${deviceInfo.icon}</span>
          
          <div style="position: absolute; top: 12px; left: 12px; background-color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; color: ${statusColors[device.status]}; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 4px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColors[device.status]};"></div>
            ${statusLabels[device.status]}
          </div>
        </div>

        <div class="popup-details" style="padding: 16px 16px 0 16px;">
          <h3 style="margin: 0 0 4px 0; font-size: 16px; color: #1f2937; line-height: 1.3;">${device.name}</h3>
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">${deviceInfo.label} • รหัส: ${device.id}</p>

          <div style="font-size: 13px; line-height: 1.6; color: #4b5563;">
            <div style="display: flex; gap: 8px;">
              <span style="font-weight: 600; min-width: 60px;">หน่วยงาน:</span> 
              <span>${device.department}</span>
            </div>
            ${device.description ? `
              <div style="display: flex; gap: 8px; margin-top: 4px;">
                <span style="font-weight: 600; min-width: 60px;">หมายเหตุ:</span> 
                <span>${device.description}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="popup-footer" style="padding: 16px;">
          <button 
            class="report-issue-btn" 
            style="width: 100%; padding: 10px; background-color: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);"
            onmouseover="this.style.backgroundColor='#dc2626'"
            onmouseout="this.style.backgroundColor='#ef4444'"
          >
            📢 แจ้งซ่อมแซม / ร้องเรียน
          </button>
        </div>

      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 280,
      className: 'custom-popup google-maps-style'
    });

    marker.on('popupopen', (e) => {
      const popupElement = e.popup.getElement();
      if (popupElement) {
        const closeBtn = popupElement.querySelector('.leaflet-popup-close-button') as HTMLElement;
        if (closeBtn) {
          closeBtn.style.color = '#1f2937';
          closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
          closeBtn.style.borderRadius = '50%';
          closeBtn.style.width = '26px';
          closeBtn.style.height = '26px';
          closeBtn.style.display = 'flex';
          closeBtn.style.alignItems = 'center';
          closeBtn.style.justifyContent = 'center';
          closeBtn.style.top = '10px';
          closeBtn.style.right = '10px';
          closeBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }

        const reportBtn = popupElement.querySelector('.report-issue-btn');
        if (reportBtn) {
          reportBtn.addEventListener('click', () => {
            alert(`เตรียมส่งข้อมูลไปหน้าแจ้งซ่อม!\n\nรหัสอุปกรณ์: ${device.id}\nชื่อ: ${device.name}\nสถานะ: ${statusLabels[device.status]}`);
            marker.closePopup();
          });
        }
      }
    });
};

  const showLoadingOverlay = loading || isTilesLoading;
  const loadingMessage = loading ? 'กำลังโหลดข้อมูล...' : 'กำลังโหลดแผนที่...';

  return (
    <div className="city-map-container">
      <div className="map-header">
        <h2>🗺️ ผังเมืองดิจิทัลเทศบาล</h2>
        <p>
          {loading
            ? 'กำลังโหลดข้อมูล...'
            : `แผนที่แสดงอุปกรณ์และสิ่งอำนวยความสะดวกต่างๆ ในเขตเทศบาล (${devices.length} รายการ)`}
        </p>
      </div>

      {showLoadingOverlay && (
        <div className="map-loading-overlay" role="status" aria-live="polite">
          <div className="map-loading-card">
            <div className="map-loading-spinner" aria-hidden="true" />
            <div className="map-loading-text">{loadingMessage}</div>
          </div>
        </div>
      )}
      
      <div className="map-legend">
        <h3>สัญลักษณ์</h3>
        <div className="legend-items">
          {Object.entries(deviceIcons)
            .filter(([type]) => availableTypes.includes(type))
            .map(([type, info]) => {
              const count = devices.filter(d => d.type === type).length;
              const enabled = enabledTypes[type] !== false;
              return (
                <button
                  key={type}
                  type="button"
                  className={`legend-item legend-toggle ${enabled ? 'is-on' : 'is-off'}`}
                  onClick={() => setEnabledTypes((prev) => ({ ...prev, [type]: !(prev[type] !== false) }))}
                >
                  <div 
                    className="legend-marker" 
                    style={{ backgroundColor: info.color }}
                  >
                    {info.icon}
                  </div>
                  <span>{info.label} ({count})</span>
                </button>
              );
            })}
        </div>
        
        <h3>สถานะ</h3>
        <div className="legend-items">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="legend-item">
              <div 
                className="status-indicator" 
                style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div 
        ref={mapContainerRef} 
        className="map-container"
      />
      
      <div className="map-footer">
        <p>
          {addMode 
            ? '🖱️ คลิกบนแผนที่เพื่อเลือกตำแหน่งที่ต้องการเพิ่ม' 
            : '💡 คลิกที่ Marker เพื่อดูรายละเอียดของอุปกรณ์แต่ละตัว'
          }
        </p>
      </div>
    </div>
  );
}

export default CityMap;
