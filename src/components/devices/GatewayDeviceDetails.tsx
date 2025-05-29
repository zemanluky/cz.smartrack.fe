import React, { useState } from "react";
import { GatewayDevice, ShelfPositionsDeviceDetail, getShelfDeviceById } from "@/api/adminApi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Battery, Calendar, Hash, Layers, Signal, Wifi } from "lucide-react";

import { format } from "date-fns";

interface GatewayDeviceDetailsProps {
  device: GatewayDevice;
  onRefresh: () => void;
}

const GatewayDeviceDetails: React.FC<GatewayDeviceDetailsProps> = ({ device, onRefresh }) => {
  const [selectedShelfDevice, setSelectedShelfDevice] = useState<ShelfPositionsDeviceDetail | null>(null);
  const [isLoading, setIsLoading] = useState<number | null>(null);

  const handleShelfDeviceClick = async (id: number) => {
    if (isLoading === id) return;
    
    setIsLoading(id);
    try {
      const details = await getShelfDeviceById(id);
      setSelectedShelfDevice(details);
    } catch (error) {
      console.error("Error loading shelf device details:", error);
      toast.error("Failed to load device details");
    } finally {
      setIsLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "MMM d, yyyy HH:mm:ss");
  };

  const getBatteryColor = (percentage: number | null) => {
    if (percentage === null) return "bg-gray-300";
    if (percentage < 20) return "bg-red-500";
    if (percentage < 50) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Gateway Device Details</CardTitle>
            <CardDescription className="text-lg mt-1">
              {device.serial_number}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            
            <Button variant="outline" onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">ID:</span>
              <span>{device.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Connection Status:</span>
              <Badge variant={device.last_connected ? "default" : "destructive"}>
                {device.last_connected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Connected:</span>
              <span>{formatDate(device.last_connected)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Connected Shelf Devices:</span>
              <span>{device?.shelf_positions_devices?.length ?? 0}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="shelf-devices">
          <TabsList>
            <TabsTrigger value="shelf-devices">Shelf Devices</TabsTrigger>
            {selectedShelfDevice && (
              <TabsTrigger value="device-details">Device Details</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="shelf-devices" className="mt-4">
            {(device?.shelf_positions_devices?.length ?? 0) === 0 ? (
              <div className="text-center p-6 border rounded-lg">
                <p className="text-muted-foreground mb-4">No shelf devices connected to this gateway.</p>
                {/* AddShelfDeviceDialog was removed as per previous refactoring. */}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {device.shelf_positions_devices.map((shelfDevice) => (
                  <Card
                    key={shelfDevice.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedShelfDevice?.id === shelfDevice.id ? 'border-primary' : ''
                    }`}
                    onClick={() => handleShelfDeviceClick(shelfDevice.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">
                        {shelfDevice.serial_number}
                      </CardTitle>
                      <CardDescription>ID: {shelfDevice.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Signal className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {shelfDevice.last_reported
                            ? `Last report: ${formatDate(shelfDevice.last_reported)}`
                            : "Never reported"
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-12 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${getBatteryColor(shelfDevice.current_battery_percent)}`}
                              style={{
                                width: `${shelfDevice.current_battery_percent || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm">
                            {shelfDevice.current_battery_percent !== null
                              ? `${shelfDevice.current_battery_percent}%`
                              : "Unknown"
                            }
                          </span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Slots:</span> {shelfDevice.number_of_slots}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isLoading === shelfDevice.id ? (
                        <div className="w-full text-center text-sm">Loading details...</div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShelfDeviceClick(shelfDevice.id);
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {selectedShelfDevice && (
            <TabsContent value="device-details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Shelf Device: {selectedShelfDevice.serial_number}</CardTitle>
                  <CardDescription>
                    Sensor details and pairing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">ID:</span>
                          <span>{selectedShelfDevice.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Signal className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Last Report:</span>
                          <span>{formatDate(selectedShelfDevice.last_reported)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Battery className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Battery:</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-12 bg-gray-200 rounded-full">
                              <div
                                className={`h-2 rounded-full ${getBatteryColor(selectedShelfDevice.current_battery_percent)}`}
                                style={{
                                  width: `${selectedShelfDevice.current_battery_percent || 0}%`,
                                }}
                              />
                            </div>
                            <span>
                              {selectedShelfDevice.current_battery_percent !== null
                                ? `${selectedShelfDevice.current_battery_percent}%`
                                : "Unknown"
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Number of Slots:</span>
                          <span>{selectedShelfDevice.number_of_slots}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Sensor Slots and Pairing</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted">
                              <th className="py-2 px-4 text-left">Slot #</th>
                              <th className="py-2 px-4 text-left">Pairing Code</th>
                              <th className="py-2 px-4 text-left">Shelf Position</th>
                              <th className="py-2 px-4 text-left">NFC Tag</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedShelfDevice.pairings.sort((a, b) => a.slot_number - b.slot_number).map((pairing) => (
                              <tr key={pairing.pairing_code} className="border-t">
                                <td className="py-2 px-4">{pairing.slot_number}</td>
                                <td className="py-2 px-4 font-mono text-sm">
                                  {pairing.pairing_code}
                                </td>
                                <td className="py-2 px-4">
                                  {pairing.shelf_position_id ? (
                                    <Badge>Position {pairing.shelf_position_id}</Badge>
                                  ) : (
                                    <Badge variant="outline">Not paired</Badge>
                                  )}
                                </td>
                                <td className="py-2 px-4">
                                  {pairing.nfc_tag ? (
                                    <span className="font-mono text-sm">{pairing.nfc_tag}</span>
                                  ) : (
                                    <Badge variant="outline">No NFC</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GatewayDeviceDetails;
