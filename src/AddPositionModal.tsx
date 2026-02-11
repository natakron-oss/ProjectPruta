import { useState } from 'react';
import { X, MapPin, Save } from 'lucide-react';
import './AddPositionModal.css';

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewPositionData) => void;
  initialLat?: number;
  initialLng?: number;
}

export interface NewPositionData {
  type: 'streetlight' | 'wifi' | 'hydrant';
  name: string;
  description: string;
  status: 'normal' | 'damaged' | 'repairing';
  lat: number;
  lng: number;
}

const deviceTypes = [
  { value: 'streetlight', label: '💡 ไฟส่องสว่าง', icon: '💡' },
  { value: 'wifi', label: '📶 Wi-Fi สาธารณะ', icon: '📶' },
  { value: 'hydrant', label: '🚒 ประปา/ดับเพลิง', icon: '🚒' }
];

const statusOptions = [
  { value: 'normal', label: '✓ ปกติ' },
  { value: 'damaged', label: '⚠️ ชำรุด' },
  { value: 'repairing', label: '🔧 กำลังซ่อม' }
];

function AddPositionModal({ isOpen, onClose, onSave, initialLat = 0, initialLng = 0 }: AddPositionModalProps) {
  const [type, setType] = useState<'streetlight' | 'wifi' | 'hydrant'>('streetlight');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'normal' | 'damaged' | 'repairing'>('normal');
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);

  // Update coordinates when props change
  useState(() => {
    setLat(initialLat);
    setLng(initialLng);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('กรุณากรอกชื่อตำแหน่ง');
      return;
    }

    onSave({
      type,
      name: name.trim(),
      description: description.trim(),
      status,
      lat,
      lng
    });

    // Reset form
    setName('');
    setDescription('');
    setStatus('normal');
    setType('streetlight');
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <MapPin size={24} color="#3b82f6" />
            <h2>เพิ่มตำแหน่งใหม่</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>ประเภทอุปกรณ์ <span className="required">*</span></label>
            <div className="device-type-grid">
              {deviceTypes.map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  className={`device-type-button ${type === dt.value ? 'active' : ''}`}
                  onClick={() => setType(dt.value as any)}
                >
                  <span className="device-icon">{dt.icon}</span>
                  <span className="device-label">{dt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>ชื่อตำแหน่ง <span className="required">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น หน้าโรงเรียน, ถนนสายหลัก..."
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>พิกัด (Latitude, Longitude)</label>
            <div className="coordinate-inputs">
              <input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                placeholder="Latitude"
                className="form-input"
              />
              <input
                type="number"
                step="0.000001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                placeholder="Longitude"
                className="form-input"
              />
            </div>
            <small className="form-hint">คลิกบนแผนที่เพื่อเลือกตำแหน่ง</small>
          </div>

          <div className="form-group">
            <label>สถานะ</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="form-select"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>หมายเหตุ</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary">
              <Save size={18} />
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPositionModal;
