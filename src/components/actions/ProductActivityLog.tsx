import { useState } from "react"
import { useProductLogStore, type ActivityLog, type ActivityType } from "@/stores/productLogStore"
import { PlusCircle, MinusCircle, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function ProductActivityLog() {
    const logs = useProductLogStore((state) => state.logs)
    const [filter, setFilter] = useState<ActivityType | 'all'>('all')

    // Filter logs based on selected filter
    const filteredLogs = filter === 'all'
        ? logs
        : logs.filter(log => log.type === filter)

    // Format timestamp to be more readable
    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date)
    }

    // Get appropriate icon and color for activity type
    const getActivityIcon = (type: ActivityType) => {
        switch (type) {
            case 'add':
                return <PlusCircle className="h-4 w-4 text-green-500" />
            case 'delete':
                return <MinusCircle className="h-4 w-4 text-red-500" />
            case 'update':
                return <RefreshCw className="h-4 w-4 text-blue-500" />
        }
    }

    const getActivityBadge = (type: ActivityType) => {
        switch (type) {
            case 'add':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Added</Badge>
            case 'delete':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Deleted</Badge>
            case 'update':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Updated</Badge>
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Activity Log</CardTitle>
                        <CardDescription>Recent product inventory activities</CardDescription>
                    </div>
                    <Select value={filter} onValueChange={(value) => setFilter(value as ActivityType | 'all')}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Activities</SelectItem>
                            <SelectItem value="add">Added</SelectItem>
                            <SelectItem value="delete">Deleted</SelectItem>
                            <SelectItem value="update">Updated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {filteredLogs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        No activity logs available
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                                <div className="mt-1">{getActivityIcon(log.type)}</div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium flex items-center gap-2">
                                            {log.productName}
                                            {getActivityBadge(log.type)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatTime(new Date(log.timestamp))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{log.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}