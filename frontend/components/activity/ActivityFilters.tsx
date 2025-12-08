'use client'

import { Search, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface ActivityFiltersProps {
  search: string
  type: string
  user: string
  dateStart: string
  dateEnd: string
  onSearchChange: (value: string) => void
  onTypeChange: (value: string) => void
  onUserChange: (value: string) => void
  onDateStartChange: (value: string) => void
  onDateEndChange: (value: string) => void
  onReset: () => void
}

const actionTypes = [
  { value: '', label: 'All Actions' },
  { value: 'auth', label: 'Authentication' },
  { value: 'user', label: 'User Management' },
  { value: 'api_key', label: 'API Keys' },
  { value: 'campaign', label: 'Campaigns' },
  { value: 'email', label: 'Email Events' },
]

export default function ActivityFilters({
  search,
  type,
  user,
  dateStart,
  dateEnd,
  onSearchChange,
  onTypeChange,
  onUserChange,
  onDateStartChange,
  onDateEndChange,
  onReset,
}: ActivityFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search activity..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((actionType) => (
                  <SelectItem key={actionType.value} value={actionType.value}>
                    {actionType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Start</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="date"
                value={dateStart}
                onChange={(e) => onDateStartChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date End</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="date"
                value={dateEnd}
                onChange={(e) => onDateEndChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {(search || type || dateStart || dateEnd) && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

