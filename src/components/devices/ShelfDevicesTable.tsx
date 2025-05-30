import React, { useState, useEffect } from "react";
import { ShelfPositionsDeviceBasic, getShelfDeviceById, GatewayDevice, listGatewayDevices } from "@/api/adminApi";
import { useUserStore } from "@/lib/stores/userStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";
import { Battery, Clock, RefreshCw, Search, Signal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ShelfDevicesTable: React.FC = () => {
  const [allDevices, setAllDevices] = useState<ShelfPositionsDeviceBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<ShelfPositionsDeviceBasic | null>(null);
  const [deviceDetails, setDeviceDetails] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const currentUser = useUserStore(state => state.currentUser);
  const isAdmin = currentUser?.role === 'sys_admin';
  
  const fetchAllShelfDevices = async (page = 1, search = "") => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      // Načteme všechny gateway devices a jejich připojené shelf devices
      const response = await listGatewayDevices(page, 10, search);
      
      // Extrahujeme všechny shelf devices ze všech gateway devices
      const allShelfDevices: ShelfPositionsDeviceBasic[] = [];
      response.items.forEach((gateway: GatewayDevice) => {
        if (gateway.shelf_positions_devices && gateway.shelf_positions_devices.length > 0) {
          allShelfDevices.push(...gateway.shelf_positions_devices);
        }
      });
      
      setAllDevices(allShelfDevices);
      setTotalPages(Math.ceil(response.metadata.total_results / response.metadata.limit));
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load shelf devices:", error);
      toast.error("Nepodařilo se načíst snímače poliček. Zkuste to prosím znovu.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAdmin) {
      fetchAllShelfDevices(1, searchTerm);
    }
  }, [isAdmin]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAllShelfDevices(1, searchTerm);
  };
  
  const handleRefresh = () => {
    fetchAllShelfDevices(currentPage, searchTerm);
  };
  
  const handleDeviceClick = async (device: ShelfPositionsDeviceBasic) => {
    setSelectedDevice(device);
    setIsLoading(true);
    
    try {
      const details = await getShelfDeviceById(device.id);
      setDeviceDetails(details);
    } catch (error) {
      console.error("Failed to load device details:", error);
      toast.error("Nepodařilo se načíst detail zařízení");
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nikdy";
    return format(new Date(dateString), "dd.MM.yyyy HH:mm:ss");
  };
  
  const getBatteryIcon = (percentage: number | null) => {
    if (percentage === null) return <Battery className="h-5 w-5 text-gray-400" />;
    
    if (percentage < 20) {
      return <Battery className="h-5 w-5 text-red-500" />;
    } else if (percentage < 50) {
      return <Battery className="h-5 w-5 text-yellow-500" />;
    } else {
      return <Battery className="h-5 w-5 text-green-500" />;
    }
  };
  
  const getBatteryText = (percentage: number | null) => {
    if (percentage === null) return "Neznámý";
    return `${percentage}%`;
  };
  
  const getBatteryStatusClass = (percentage: number | null) => {
    if (percentage === null) return "bg-gray-200";
    if (percentage < 20) return "bg-red-500";
    if (percentage < 50) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Přístup odepřen</CardTitle>
          <CardDescription>Nemáte oprávnění spravovat shelf-devices.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (selectedDevice && deviceDetails) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedDevice(null);
                  setDeviceDetails(null);
                }}
                className="mb-4"
              >
                Zpět na seznam shelf-devices
              </Button>
              <CardTitle>Detail shelf-device</CardTitle>
              <CardDescription className="text-lg">
                {deviceDetails.serial_number}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-medium">Stav baterie</div>
                <div className="flex items-center gap-1 mt-1">
                  {getBatteryIcon(deviceDetails.current_battery_percent)}
                  <span>{getBatteryText(deviceDetails.current_battery_percent)}</span>
                </div>
              </div>
              <div className={`h-10 w-2 rounded-full ${getBatteryStatusClass(deviceDetails.current_battery_percent)}`}></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">ID:</span>
                <span>{deviceDetails.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Počet slotů:</span>
                <span>{deviceDetails.number_of_slots}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Poslední aktivita:</span>
                <span>{formatDate(deviceDetails.last_reported)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Signal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Stav připojení:</span>
                <Badge variant={deviceDetails.last_reported ? "default" : "destructive"}>
                  {deviceDetails.last_reported ? "Připojeno" : "Odpojeno"}
                </Badge>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="status">
            <TabsList>
              <TabsTrigger value="status">Historie baterie</TabsTrigger>
              <TabsTrigger value="slots">Sloty a párování</TabsTrigger>
            </TabsList>
            
            <TabsContent value="status">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum a čas</TableHead>
                      <TableHead>Stav baterie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deviceDetails.status_logs && deviceDetails.status_logs.length > 0 ? (
                      deviceDetails.status_logs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDate(log.timestamp)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${getBatteryStatusClass(log.battery_percent)}`}></div>
                              {log.battery_percent}%
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          Žádné záznamy
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="slots">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Slot</TableHead>
                      <TableHead>Kód párování</TableHead>
                      <TableHead>ID pozice poličky</TableHead>
                      <TableHead>NFC tag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deviceDetails.pairings && deviceDetails.pairings.length > 0 ? (
                      deviceDetails.pairings.map((slot: any) => (
                        <TableRow key={slot.slot_number}>
                          <TableCell>{slot.slot_number}</TableCell>
                          <TableCell>{slot.pairing_code}</TableCell>
                          <TableCell>{slot.shelf_position_id || 'Nepřiřazeno'}</TableCell>
                          <TableCell>{slot.nfc_tag || 'Nespárováno'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Žádné sloty
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Shelf-devices</CardTitle>
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center gap-2">
              <Input 
                placeholder="Hledat podle sériového čísla" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Button variant="outline" onClick={handleRefresh} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="h-10 w-10 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Tabulka pro desktop */}
            <div className="rounded-md border hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sériové číslo</TableHead>
                    <TableHead>Počet slotů</TableHead>
                    <TableHead>Poslední aktivita</TableHead>
                    <TableHead>Stav baterie</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDevices.length > 0 ? (
                    allDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>{device.serial_number}</TableCell>
                        <TableCell>{device.number_of_slots}</TableCell>
                        <TableCell>{formatDate(device.last_reported)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getBatteryIcon(device.current_battery_percent)}
                            <span>{getBatteryText(device.current_battery_percent)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" onClick={() => handleDeviceClick(device)}>
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Žádné shelf-devices nebyly nalezeny
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Karty pro mobilní zobrazení */}
            <div className="block md:hidden space-y-4">
              {allDevices.length > 0 ? (
                allDevices.map((device) => (
                  <Card key={device.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleDeviceClick(device)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">{device.serial_number}</CardTitle>
                      <CardDescription>ID: {device.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Počet slotů:</span>
                          <span>{device.number_of_slots}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Poslední aktivita:</span>
                          <span>{formatDate(device.last_reported)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Stav baterie:</span>
                          <div className="flex items-center gap-2">
                            {getBatteryIcon(device.current_battery_percent)}
                            <span>{getBatteryText(device.current_battery_percent)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-10">
                    Žádné shelf-devices nebyly nalezeny
                  </CardContent>
                </Card>
              )}
            </div>
            
            {allDevices.length > 0 && totalPages > 1 && (
              <CardFooter className="flex justify-center pt-6 pb-0">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </CardFooter>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
