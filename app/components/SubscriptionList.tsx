'use client'

import { useState } from 'react'
import { Subscription } from '../page'

export default function SubscriptionList({
  data,
  onCheck,
  onNoteChange,
  onUpdateMembers
}: {
  data: Subscription[]
  onCheck: (subId: number, memberIndex: number) => void
  onNoteChange: (subId: number, memberIndex: number, note: string) => void
  onUpdateMembers: (subId: number, newMembers: Subscription['members']) => void
}) {
  const [openIds, setOpenIds] = useState<number[]>([])
  const [editModalId, setEditModalId] = useState<number | null>(null)
  const [editMembers, setEditMembers] = useState<Subscription['members']>([])
  const [newMember, setNewMember] = useState('')

  const toggleOpen = (id: number) => {
    setOpenIds(prev =>
      prev.includes(id) ? prev.filter(openId => openId !== id) : [...prev, id]
    )
  }

  const openEditModal = (sub: Subscription) => {
    setEditModalId(sub.id)
    setEditMembers([...sub.members])
    setNewMember('')
  }

  const closeEditModal = () => {
    setEditModalId(null)
    setEditMembers([])
  }

  const handleAddMember = () => {
    if (newMember.trim() !== '') {
      setEditMembers(prev => [...prev, { name: newMember.trim(), paid: false, note: '' }])
      setNewMember('')
    }
  }

  const handleRemoveMember = (index: number) => {
    setEditMembers(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveEdit = () => {
    if (editModalId !== null) {
      onUpdateMembers(editModalId, editMembers)
      closeEditModal()
    }
  }

  return (
    <div>
      <h2 className="mb-3 font-semibold text-xl">Danh sách Subscription</h2>
      <ul className="space-y-3">
        {data.map(sub => (
          <li key={sub.id} className="bg-white shadow-sm p-4 border rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{sub.name}</div>
                <div className="text-gray-600 text-sm">
                  {sub.type === 'monthly' ? 'Theo tháng' : 'Theo năm'} - {sub.date}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleOpen(sub.id)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  {openIds.includes(sub.id) ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
                <button
                  onClick={() => openEditModal(sub)}
                  className="text-purple-600 text-sm hover:underline"
                >
                  Chỉnh sửa thành viên
                </button>
              </div>
            </div>

            {openIds.includes(sub.id) && (
              <div className="mt-4 pt-3 border-t">
                <h3 className="mb-2 font-semibold text-sm">Thành viên</h3>
                <ul className="space-y-2">
                  {sub.members.map((member, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={member.paid}
                        onChange={() => onCheck(sub.id, index)}
                      />
                      <span className={`flex-1 ${member.paid ? 'line-through text-green-700' : ''}`}>
                        {member.name}
                      </span>
                      <input
                        type="text"
                        placeholder="Ghi chú..."
                        value={member.note}
                        onChange={e => onNoteChange(sub.id, index, e.target.value)}
                        className="px-2 py-1 border rounded w-48 text-sm"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Modal chỉnh sửa thành viên */}
      {editModalId !== null && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-40">
          <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-md">
            <h3 className="mb-4 font-bold text-lg">Chỉnh sửa thành viên</h3>

            <div className="space-y-2 mb-4">
              {editMembers.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex-1">{m.name}</span>
                  <button
                    onClick={() => handleRemoveMember(idx)}
                    className="text-red-600 text-sm"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                value={newMember}
                onChange={e => setNewMember(e.target.value)}
                placeholder="Tên thành viên mới"
                className="flex-1 px-3 py-1 border rounded"
              />
              <button
                onClick={handleAddMember}
                className="bg-blue-500 px-3 py-1 rounded text-white"
              >
                Thêm
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={closeEditModal} className="px-4 py-1 text-gray-600">
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-green-600 px-4 py-1 rounded text-white"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
