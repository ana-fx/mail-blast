'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuditTrail } from '@/hooks/useInternal'
import { AuditLog } from '@/lib/api/internal'
import { formatDateTime } from '@/lib/utils'

export default function AuditTrailSummary() {
  const [limit, setLimit] = useState(50)
  const { data: logs, isLoading } = useAuditTrail({ limit })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Audit Trail</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Compliance and change tracking</p>
        </div>
        <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="200">200</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.user_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {log.user_id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{log.resource_type}</p>
                        {log.resource_id && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            ID: {log.resource_id}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.changes ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            alert(JSON.stringify(log.changes, null, 2))
                          }}
                        >
                          View Diff
                        </Button>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No audit logs found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

