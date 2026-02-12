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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

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
    
    // ถ้าไม่มี icon สำหรับประเภทนี้ ให้ข้าม
    if (!deviceInfo) return;
    
    const markerColor = statusColors[device.status];

    // สร้าง custom icon ด้วย DivIcon
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

    // สร้าง marker
    const marker = L.marker([device.lat, device.lng], { icon: customIcon }).addTo(layer);

    // สร้าง popup content
    const popupContent = `
      <div class="device-popup">
        <div class="popup-header" style="background-color: ${markerColor}">
          <span class="popup-icon">${deviceInfo.icon}</span>
          <span class="popup-type">${deviceInfo.label}</span>
        </div>
        <div class="popup-body">
          <div class="popup-row">
            <span class="popup-label">รหัสอุปกรณ์:</span>
            <span class="popup-value">${device.id}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">ชื่อ:</span>
            <span class="popup-value">${device.name}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">ตำแหน่ง:</span>
            <span class="popup-value">${device.lat.toFixed(6)}, ${device.lng.toFixed(6)}</span>
          </div>
          <div class="popup-row">
            <span class="popup-label">สถานะ:</span>
            <span class="popup-value" style="color: ${statusColors[device.status]}; font-weight: 600;">
              ${statusLabels[device.status]}
            </span>
          </div>
          <div class="popup-row">
            <span class="popup-label">หน่วยงาน:</span>
            <span class="popup-value">${device.department}</span>
          </div>
          ${device.description ? `
            <div class="popup-row">
              <span class="popup-label">หมายเหตุ:</span>
              <span class="popup-value">${device.description}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    });
  };

  if (loading) {
    return (
      <div className="city-map-container">
        <div className="map-header">
          <h2>🗺️ ผังเมืองดิจิทัลเทศบาล</h2>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="city-map-container">
      <div className="map-header">
        <h2>🗺️ ผังเมืองดิจิทัลเทศบาล</h2>
        <p>แผนที่แสดงอุปกรณ์และสิ่งอำนวยความสะดวกต่างๆ ในเขตเทศบาล ({devices.length} รายการ)</p>
      </div>
      
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
