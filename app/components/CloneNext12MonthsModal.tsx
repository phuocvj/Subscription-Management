'use client'

import { useEffect, useState } from 'react'
import {
  FaTrash,
  FaPlus,
  FaMagic,
  FaTimes,
  FaCheck,
} from 'react-icons/fa'

export type Member = {
  name: string
  paid: boolean
  note: string
  amount: number
}

function getNextMonths(currentMonth: string, count = 12): string[] {
  const [curMonth, curYear] = currentMonth.split('/').map(Number)
  const months: string[] = []
  for (let i = 1; i <= count; i++) {
    const date = new Date(curYear, curMonth - 1 + i)
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const y = date.getFullYear()
    months.push(`${m}/${y}`)
  }
  return months
}

function getNextYears(currentYear: string, count = 5): string[] {
  const y = parseInt(currentYear, 10)
  return Array.from({ length: count }, (_, i) => `${y + i + 1}`)
}

type Props = {
  currentMonth: string // hoặc currentYear nếu type = 'year'
  members: Member[]
  subscriptionType: 'month' | 'year'
  onClose: () => void
  onCreate: (newPeriods: Record<string, Member[]>) => void
}

export default function CloneNextPeriodsModal({
  currentMonth,
  members,
  subscriptionType,
  onClose,
  onCreate
}: Props) {
  const [editableMembers, setEditableMembers] = useState<Member[]>([])
  const [newName, setNewName] = useState('')

  useEffect(() => {
    const clean = members.map(m => ({
      name: m.name,
      paid: false,
      note: '',
      amount: 0
    }))
    setEditableMembers(clean)
  }, [members])

  const addMember = () => {
    if (!newName.trim()) return
    setEditableMembers(prev => [
      ...prev,
      {
        name: newName.trim(),
        paid: false,
        note: '',
        amount: 0
      }
    ])
    setNewName('')
  }

  const removeMember = (index: number) => {
    setEditableMembers(prev => prev.filter((_, i) => i !== index))
  }

  const createPeriods = () => {
    let keys: string[] = []

    if (subscriptionType === 'month') {
      keys = getNextMonths(currentMonth, 12)
    } else {
      keys = getNextYears(currentMonth, 5)
    }

    // 👉 Lấy tổng tiền hiện tại (nếu có)
    const totalAmount = Array.isArray(members)
      ? members.reduce((sum, m) => sum + m.amount, 0)
      : 0
    const perPerson = editableMembers.length > 0
      ? Math.round(totalAmount / editableMembers.length)
      : 0

    const payload: Record<string, Member[]> = {}
    const full: Record<string, { amount: number; members: Member[] }> = {}

    keys.forEach(k => {
      const memberList = editableMembers.map(member => ({
        ...member,
        amount: perPerson
      }))
      payload[k] = memberList
      full[k] = {
        amount: totalAmount,
        members: memberList
      }
    })
    // Gửi về cha
    onCreate(payload)
    onClose()
  }


  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-zinc-900 shadow-lg p-6 rounded-lg w-full max-w-md text-black dark:text-white">
        <h2 className="flex items-center gap-2 mb-4 font-bold text-lg">
          <FaMagic className="text-yellow-500" />
          {subscriptionType === 'year'
            ? 'Tạo 5 năm tiếp theo'
            : 'Tạo 12 tháng tiếp theo'}
        </h2>

        <div className="space-y-2 mb-3 max-h-52 overflow-auto">
          {editableMembers.map((m, i) => (
            <div key={i} className="flex justify-between items-center">
              <span>{m.name}</span>
              <button
                onClick={() => removeMember(i)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 px-3 py-2 border rounded-md"
            placeholder="Tên thành viên mới"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <button
            onClick={addMember}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-white"
          >
            <FaPlus /> Thêm
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:underline"
          >
            <FaTimes /> Huỷ
          </button>
          <button
            onClick={createPeriods}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white"
          >
            <FaCheck />
            {subscriptionType === 'year' ? 'Tạo 5 năm' : 'Tạo 12 tháng'}
          </button>
        </div>
      </div>
    </div>
  )
}
