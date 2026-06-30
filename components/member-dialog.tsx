'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { updateMember } from '@/app/actions/members'

type MemberDialogProps = {
  isOpen: boolean
  onClose: () => void
  member: any | null
  onSave: () => void
}

export function MemberDialog({ isOpen, onClose, member, onSave }: MemberDialogProps) {
  const [firstName, setFirstName] = useState(member?.firstName || '')
  const [lastName, setLastName] = useState(member?.lastName || '')
  const [email, setEmail] = useState(member?.email || '')
  const [phone, setPhone] = useState(member?.phone || '')
  const [dateOfBirth, setDateOfBirth] = useState(member?.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '')
  const [status, setStatus] = useState(member?.status || 'active')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (member) {
        await updateMember(member.id, {
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth,
          status,
        })
      }
      onSave()
    } catch (err: any) {
      setError(err.message || 'Failed to save member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {member ? 'Edit Member' : 'Add Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="input-field w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="input-field w-full"
            />
          </div>

          {member && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-field w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
