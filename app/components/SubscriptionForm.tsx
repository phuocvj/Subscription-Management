'use client'

import { useState } from 'react'
import { Subscription } from '../page'

export default function SubscriptionForm({ onAdd }: { onAdd: (s: Subscription) => void }) {
    const [subscriptionName, setSubscriptionName] = useState('')
    const [memberNames, setMemberNames] = useState<string[]>([])
    const [memberInput, setMemberInput] = useState('')
    const [amount, setAmount] = useState<number>(0)
    const [type, setType] = useState<'monthly' | 'yearly'>('monthly')

    const handleAddMember = () => {
        if (memberInput.trim() !== '') {
            setMemberNames(prev => [...prev, memberInput.trim()])
            setMemberInput('')
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!subscriptionName || memberNames.length === 0 || amount <= 0) return

        const newSub: Subscription = {
            id: Date.now(),
            name: subscriptionName,
            type,
            date: new Date().toLocaleDateString(),
            members: memberNames.map(name => ({
              name,
              paid: false,
              note: ''
            }))
          }

        onAdd(newSub)

        // Reset form
        setSubscriptionName('')
        setMemberNames([])
        setAmount(0)
    }


    const perPerson = memberNames.length > 0 ? (amount / memberNames.length).toFixed(0) : '0'

    return (
        <form onSubmit={handleSubmit} className="shadow-md mb-8 p-4 border rounded-lg">
            <h2 className="mb-4 font-semibold text-xl">Tạo Subscription mới</h2>

            {/* Tên Subscription */}
            <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Tên Subscription</label>
                <input
                    value={subscriptionName}
                    onChange={e => setSubscriptionName(e.target.value)}
                    placeholder="Ví dụ: ChatGPT Plus, Youtube Premium..."
                    className="px-3 py-2 border rounded w-full"
                />
            </div>

            {/* Thêm thành viên */}
            <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Thành viên tham gia</label>
                <div className="flex gap-2">
                    <input
                        value={memberInput}
                        onChange={e => setMemberInput(e.target.value)}
                        placeholder="Nhập tên thành viên"
                        className="flex-1 px-3 py-2 border rounded"
                    />
                    <button type="button" onClick={handleAddMember} className="bg-blue-500 px-4 rounded text-white">
                        Thêm
                    </button>
                </div>
                {memberNames.length > 0 && (
                    <ul className="mt-2 ml-5 text-gray-700 text-sm list-disc">
                        {memberNames.map((name, index) => (
                            <li key={index}>{name}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Số tiền */}
            <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Tổng số tiền (VNĐ)</label>
                <input
                    type="number"
                    value={amount === 0 ? '' : amount}
                    onChange={e => {
                        const value = e.target.value
                        setAmount(value === '' ? 0 : parseFloat(value))
                    }}
                    className="px-3 py-2 border rounded w-full"
                />
            </div>

            {/* Hiển thị chia đều */}
            {memberNames.length > 0 && amount > 0 && (
                <div className="mb-4 text-green-700 text-sm">
                    Mỗi người cần trả khoảng <strong>{perPerson} VNĐ</strong>
                </div>
            )}

            {/* Loại */}
            <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Loại Subscription</label>
                <select
                    value={type}
                    onChange={e => setType(e.target.value as 'monthly' | 'yearly')}
                    className="px-3 py-2 border rounded w-full"
                >
                    <option value="monthly">Theo tháng</option>
                    <option value="yearly">Theo năm</option>
                </select>
            </div>

            {/* Submit */}
            <button type="submit" className="bg-green-600 px-6 py-2 rounded font-medium text-white">
                Tạo mới
            </button>
        </form>
    )
}
