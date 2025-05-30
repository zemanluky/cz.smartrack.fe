import api from "./api";

// Types for the API responses and requests
export interface GatewayDevice {
  id: number;
  serial_number: string;
  last_connected: string | null;
  shelf_positions_devices: ShelfPositionsDeviceBasic[];
}

export interface ShelfPositionsDeviceBasic {
  id: number;
  serial_number: string;
  number_of_slots: number;
  last_reported: string | null;
  current_battery_percent: number | null;
}

export interface ShelfPositionsDeviceDetail extends ShelfPositionsDeviceBasic {
  pairings: ShelfPositionPairing[];
  status_logs: DeviceStatusLog[];
}

export interface ShelfPositionPairing {
  slot_number: number;
  pairing_code: string;
  shelf_position_id: number | null;
  nfc_tag: string | null;
}

export interface DeviceStatusLog {
  id: number;
  timestamp: string;
  battery_percent: number;
}

export interface GatewayDeviceData {
  serial_number: string;
  device_secret: string;
}

interface PaginatedResponse<T> {
  metadata: {
    limit: number;
    page: number;
    current_offset: number;
    has_next_page: boolean;
    total_results: number;
    filtered_total_results: number;
  };
  items: T[];
}

// Gateway device API functions
export async function listGatewayDevices(
  page: number = 1, 
  limit: number = 10,
  serialNumber?: string
): Promise<PaginatedResponse<GatewayDevice>> {
  try {
    const { data } = await api.get("/gateway-device", {
      params: {
        page,
        limit,
        serial_number: serialNumber
      }
    });
    return data;
  } catch (error) {
    console.error("Error listing gateway devices:", error);
    throw error;
  }
}

export async function getGatewayDeviceById(id: number): Promise<GatewayDevice> {
  try {
    const { data } = await api.get(`/gateway-device/${id}`);
    return data;
  } catch (error) {
    console.error(`Error getting gateway device with ID ${id}:`, error);
    throw error;
  }
}

export async function createGatewayDevice(deviceData: GatewayDeviceData): Promise<GatewayDevice> {
  try {
    const { data } = await api.post("/gateway-device", deviceData);
    return data;
  } catch (error) {
    console.error("Error creating gateway device:", error);
    throw error;
  }
}

export async function replaceGatewayDevice(id: number, deviceData: GatewayDeviceData): Promise<GatewayDevice> {
  try {
    const { data } = await api.put(`/gateway-device/${id}`, deviceData);
    return data;
  } catch (error) {
    console.error(`Error replacing gateway device with ID ${id}:`, error);
    throw error;
  }
}

export async function removeGatewayDevice(id: number): Promise<void> {
  try {
    await api.delete(`/gateway-device/${id}`);
  } catch (error) {
    console.error(`Error removing gateway device with ID ${id}:`, error);
    throw error;
  }
}

// Shelf device API functions
export async function getShelfDeviceById(id: number): Promise<ShelfPositionsDeviceDetail> {
  try {
    const { data } = await api.get(`/shelf-device/${id}`);
    return data;
  } catch (error) {
    console.error(`Error getting shelf device with ID ${id}:`, error);
    throw error;
  }
}

export async function getShelfDeviceLogs(
  id: number,
  page: number = 1,
  limit: number = 10,
  timestampMin?: string,
  timestampMax?: string,
  batteryPercentMin?: number,
  batteryPercentMax?: number
): Promise<PaginatedResponse<DeviceStatusLog>> {
  try {
    const { data } = await api.get(`/shelf-device/${id}/logs`, {
      params: {
        page,
        limit,
        timestamp_min: timestampMin,
        timestamp_max: timestampMax,
        battery_percent_min: batteryPercentMin,
        battery_percent_max: batteryPercentMax
      }
    });
    return data;
  } catch (error) {
    console.error(`Error getting logs for shelf device with ID ${id}:`, error);
    throw error;
  }
}

export async function assignNfcTagToDevice(
  pairingCode: string, 
  nfcTagData: { nfc_tag: string }
): Promise<ShelfPositionsDeviceDetail> {
  try {
    const { data } = await api.patch(`/shelf-device/${pairingCode}/nfc`, nfcTagData);
    return data;
  } catch (error) {
    console.error(`Error assigning NFC tag for pairing code ${pairingCode}:`, error);
    throw error;
  }
}
