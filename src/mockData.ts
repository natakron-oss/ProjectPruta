// Mock Data สำหรับอุปกรณ์เมืองต่างๆ
// ตำแหน่งใช้พิกัดในประเทศไทย (ตัวอย่าง: บริเวณกรุงเทพฯ)

export interface CityDevice {
  id: string;
  name: string;
  type: 'hydrant' | 'cctv' | 'wifi' | 'busstop';
  lat: number;
  lng: number;
  status: 'normal' | 'damaged' | 'repairing';
  department: string;
  description?: string;
}

// หัวดับเพลิง (Fire Hydrants)
export const fireHydrants: CityDevice[] = [
  {
    id: 'HYD-001',
    name: 'หัวดับเพลิงถนนสุขุมวิท',
    type: 'hydrant',
    lat: 13.7367,
    lng: 100.5635,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักการระบายน้ำ'
  },
  {
    id: 'HYD-002',
    name: 'หัวดับเพลิงถนนพระราม 4',
    type: 'hydrant',
    lat: 13.7285,
    lng: 100.5445,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักการระบายน้ำ'
  },
  {
    id: 'HYD-003',
    name: 'หัวดับเพลิงถนนสีลม',
    type: 'hydrant',
    lat: 13.7308,
    lng: 100.5316,
    status: 'damaged',
    department: 'กรุงเทพมหานคร สำนักการระบายน้ำ',
    description: 'ชำรุด ต้องเปลี่ยนวาล์ว'
  },
  {
    id: 'HYD-004',
    name: 'หัวดับเพลิงถนนพหลโยธิน',
    type: 'hydrant',
    lat: 13.7650,
    lng: 100.5370,
    status: 'repairing',
    department: 'กรุงเทพมหานคร สำนักการระบายน้ำ'
  },
  {
    id: 'HYD-005',
    name: 'หัวดับเพลิงถนนเพชรบุรี',
    type: 'hydrant',
    lat: 13.7510,
    lng: 100.5410,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักการระบายน้ำ'
  }
];

// กล้อง CCTV
export const cctvCameras: CityDevice[] = [
  {
    id: 'CCTV-001',
    name: 'กล้อง CCTV สี่แยกอโศก',
    type: 'cctv',
    lat: 13.7365,
    lng: 100.5608,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักเทศกิจ'
  },
  {
    id: 'CCTV-002',
    name: 'กล้อง CCTV สี่แยกราชประสงค์',
    type: 'cctv',
    lat: 13.7433,
    lng: 100.5401,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักเทศกิจ'
  },
  {
    id: 'CCTV-003',
    name: 'กล้อง CCTV สี่แยกสยาม',
    type: 'cctv',
    lat: 13.7465,
    lng: 100.5340,
    status: 'damaged',
    department: 'กรุงเทพมหานคร สำนักเทศกิจ',
    description: 'ภาพไม่ชัด ต้องทำความสะอาดเลนส์'
  },
  {
    id: 'CCTV-004',
    name: 'กล้อง CCTV ถนนสีลม',
    type: 'cctv',
    lat: 13.7290,
    lng: 100.5265,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักเทศกิจ'
  },
  {
    id: 'CCTV-005',
    name: 'กล้อง CCTV สี่แยกพระราม 4',
    type: 'cctv',
    lat: 13.7320,
    lng: 100.5500,
    status: 'repairing',
    department: 'กรุงเทพมหานคร สำนักเทศกิจ'
  },
  {
    id: 'CCTV-006',
    name: 'กล้อง CCTV ถนนเพชรบุรี',
    type: 'cctv',
    lat: 13.7495,
    lng: 100.5450,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักเทศกิจ'
  }
];

// จุด Wi-Fi สาธารณะ
export const wifiSpots: CityDevice[] = [
  {
    id: 'WIFI-001',
    name: 'จุด Wi-Fi สวนลุมพินี',
    type: 'wifi',
    lat: 13.7308,
    lng: 100.5418,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักงานเขต'
  },
  {
    id: 'WIFI-002',
    name: 'จุด Wi-Fi สวนเบญจกิติ',
    type: 'wifi',
    lat: 13.7367,
    lng: 100.5598,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักงานเขต'
  },
  {
    id: 'WIFI-003',
    name: 'จุด Wi-Fi ห้องสมุดประชาชน',
    type: 'wifi',
    lat: 13.7420,
    lng: 100.5320,
    status: 'damaged',
    department: 'กรุงเทพมหานคร สำนักงานเขต',
    description: 'สัญญาณไม่เสถียร'
  },
  {
    id: 'WIFI-004',
    name: 'จุด Wi-Fi ตลาดนัดจตุจักร',
    type: 'wifi',
    lat: 13.7980,
    lng: 100.5507,
    status: 'normal',
    department: 'กรุงเทพมหานคร สำนักงานเขต'
  },
  {
    id: 'WIFI-005',
    name: 'จุด Wi-Fi สถานีรถไฟหัวลำโพง',
    type: 'wifi',
    lat: 13.7407,
    lng: 100.5170,
    status: 'repairing',
    department: 'กรุงเทพมหานคร สำนักงานเขต'
  }
];

// ป้ายรถเมล์
export const busStops: CityDevice[] = [
  {
    id: 'BUS-001',
    name: 'ป้ายรถเมล์ BTS อโศก',
    type: 'busstop',
    lat: 13.7368,
    lng: 100.5602,
    status: 'normal',
    department: 'กรุงเทพมหานคร หน่วยงานขนส่ง'
  },
  {
    id: 'BUS-002',
    name: 'ป้ายรถเมล์ BTS สยาม',
    type: 'busstop',
    lat: 13.7460,
    lng: 100.5345,
    status: 'normal',
    department: 'กรุงเทพมหานคร หน่วยงานขนส่ง'
  },
  {
    id: 'BUS-003',
    name: 'ป้ายรถเมล์สี่แยกราชประสงค์',
    type: 'busstop',
    lat: 13.7435,
    lng: 100.5398,
    status: 'damaged',
    department: 'กรุงเทพมหานคร หน่วยงานขนส่ง',
    description: 'หลังคาชำรุด'
  },
  {
    id: 'BUS-004',
    name: 'ป้ายรถเมล์ถนนสีลม',
    type: 'busstop',
    lat: 13.7295,
    lng: 100.5280,
    status: 'normal',
    department: 'กรุงเทพมหานคร หน่วยงานขนส่ง'
  },
  {
    id: 'BUS-005',
    name: 'ป้ายรถเมล์ MRT ลุมพินี',
    type: 'busstop',
    lat: 13.7265,
    lng: 100.5443,
    status: 'repairing',
    department: 'กรุงเทพมหานคร หน่วยงานขนส่ง'
  },
  {
    id: 'BUS-006',
    name: 'ป้ายรถเมล์ถนนพระราม 4',
    type: 'busstop',
    lat: 13.7300,
    lng: 100.5475,
    status: 'normal',
    department: 'กรุงเทพมหานคร หน่วยงานขนส่ง'
  },
  {
    id: 'BUS-007',
    name: 'ป้ายรถเมล์ถนนเพชรบุรี',
    type: 'busstop',
    lat: 13.7500,
    lng: 100.5455,
    status: 'normal',
    department: 'กรุงเทพมหานคร หน่วยงานขนส่ง'
  }
];

// รวมอุปกรณ์ทั้งหมด
export const allDevices: CityDevice[] = [
  ...fireHydrants,
  ...cctvCameras,
  ...wifiSpots,
  ...busStops
];

// ฟังก์ชันช่วยเหลือ
export const getDevicesByType = (type: string): CityDevice[] => {
  return allDevices.filter(device => device.type === type);
};

export const getDeviceById = (id: string): CityDevice | undefined => {
  return allDevices.find(device => device.id === id);
};

export const getDevicesByStatus = (status: string): CityDevice[] => {
  return allDevices.filter(device => device.status === status);
};
