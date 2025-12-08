'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Permission {
  read: boolean
  write: boolean
  delete: boolean
}

interface PermissionMatrixProps {
  permissions: Record<string, Permission>
  onChange: (module: string, permission: keyof Permission, value: boolean) => void
}

const modules = [
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'templates', label: 'Templates' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Settings' },
  { key: 'users', label: 'Users' },
]

export default function PermissionMatrix({
  permissions,
  onChange,
}: PermissionMatrixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 pb-2 border-b">
            <div className="font-medium text-sm">Module</div>
            <div className="text-center font-medium text-sm">Read</div>
            <div className="text-center font-medium text-sm">Write</div>
            <div className="text-center font-medium text-sm">Delete</div>
          </div>
          {modules.map((module) => {
            const modulePermissions = permissions[module.key] || {
              read: false,
              write: false,
              delete: false,
            }
            return (
              <div key={module.key} className="grid grid-cols-4 gap-4 items-center py-2 border-b last:border-0">
                <Label className="font-medium">{module.label}</Label>
                <div className="flex justify-center">
                  <Switch
                    checked={modulePermissions.read}
                    onCheckedChange={(checked) =>
                      onChange(module.key, 'read', checked)
                    }
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={modulePermissions.write}
                    onCheckedChange={(checked) =>
                      onChange(module.key, 'write', checked)
                    }
                    disabled={!modulePermissions.read}
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={modulePermissions.delete}
                    onCheckedChange={(checked) =>
                      onChange(module.key, 'delete', checked)
                    }
                    disabled={!modulePermissions.write}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

