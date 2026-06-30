'use client'

import { useState, useEffect } from 'react'
import { getMembers, updateMember } from '@/app/actions/members'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { MemberDialog } from './member-dialog'

export function MembersManagement({ role, canCreateMembers }: { role: string; canCreateMembers: boolean }) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const data = await getMembers()
      setMembers(data)
    } catch (error) {
      console.error('[v0] Failed to load members:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditMember = (member: any) => {
    setSelectedMember(member)
    setIsDialogOpen(true)
  }

  const handleCreateMember = () => {
    setSelectedMember(null)
    setIsDialogOpen(true)
  }

  const handleSaveMember = async () => {
    await loadMembers()
    setIsDialogOpen(false)
    setSelectedMember(null)
  }

  return (
    <div className="space-y-6">
      {/* Search and Create Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
        {canCreateMembers && (
          <button
            onClick={handleCreateMember}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            Add Member
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-card border border-border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading members...
          </div>
        ) : filteredMembers.length > 0 ? (
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Join Date</th>
                {canCreateMembers && (
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {member.phone || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 border text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    }`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </td>
                  {canCreateMembers && (
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-2 hover:bg-secondary border border-border transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'No members found' : 'No members yet'}
          </div>
        )}
      </div>

      {/* Member Dialog */}
      <MemberDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        member={selectedMember}
        onSave={handleSaveMember}
      />
    </div>
  )
}
