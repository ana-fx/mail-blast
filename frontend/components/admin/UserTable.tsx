'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, MoreVertical, Shield, User } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User as UserType } from '@/lib/api/admin'
import { formatDateTime } from '@/lib/utils'
import { useUserActions } from '@/hooks/useUsers'

interface UserTableProps {
  users: UserType[]
  onEdit: (id: string) => void
}

export default function UserTable({ users, onEdit }: UserTableProps) {
  const { updateStatus, delete: deleteUser, isUpdatingStatus, isDeleting } = useUserActions()

  const handleToggleStatus = (user: UserType) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    updateStatus({ id: user.id, status: newStatus })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(id)
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      admin: 'default',
      superadmin: 'default',
      editor: 'secondary',
      viewer: 'outline',
    }
    return (
      <Badge variant={variants[role] as any || 'outline'}>
        {role === 'admin' || role === 'superadmin' ? (
          <Shield className="h-3 w-3 mr-1" />
        ) : (
          <User className="h-3 w-3 mr-1" />
        )}
        {role}
      </Badge>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800 sticky top-0">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={user.status === 'disabled' ? 'opacity-50' : ''}
            >
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                {user.last_login ? formatDateTime(user.last_login) : 'Never'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(user.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                      {user.status === 'active' ? 'Disable' : 'Enable'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

