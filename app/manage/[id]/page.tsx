// Quản lý subscription theo tháng với chức năng tạo 12 tháng tiếp theo
'use client'
import { supabase } from '@/app/lib/supabase'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import CloneNext12MonthsModal from '@/app/components/CloneNext12MonthsModal'
import { FaCalendarAlt, FaUserFriends, FaMoneyBillWave, FaLayerGroup, FaMagic, FaTrashAlt, FaEquals, FaPlus, FaTrash, FaCheckCircle, FaRegCircle } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

// Loại thành viên
type Member = {
    name: string
    paid: boolean
    note: string
    amount: number
}

// Dữ liệu theo tháng
type MonthlyData = {
    amount: number
    members: Member[]
}

// Tổng subscription lưu trong localStorage
type SubscriptionData = {
    name: string
    history: Record<string, MonthlyData>
}

export default function ManageSubscriptionPage() {
    const { id } = useParams()
    const code = id as string

    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
    const [currentMonth, setCurrentMonth] = useState<string>('')
    const [newMember, setNewMember] = useState('')
    const [newAmount, setNewAmount] = useState<number>(0)
    const [showCloneModal, setShowCloneModal] = useState(false)
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
    const router = useRouter()

    // Cập nhật class dark/light từ localStorage
    useEffect(() => {
        const theme = localStorage.getItem('theme')
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [])

    useEffect(() => {
        const fetchSubscription = async () => {
            const { data: row, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('id', code)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Lỗi khi load subscription:', error)
            }

            const now = new Date()
            const monthKey = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
            setCurrentMonth(monthKey)

            let data: SubscriptionData

            if (row) {
                data = row.data
            } else {
                data = { name: '', history: {} }
                // Tạo subscription mới nếu chưa có
                await supabase.from('subscriptions').insert({
                    id: code,
                    name: '',
                    data
                })
            }

            if (!data.history[monthKey]) {
                data.history[monthKey] = { amount: 0, members: [] }
            }

            setSubscription(data)
        }

        fetchSubscription()
    }, [code])

    useEffect(() => {
        const saveData = async () => {
            if (!subscription) return

            await supabase
                .from('subscriptions')
                .update({
                    name: subscription.name,
                    data: subscription
                })
                .eq('id', code)
        }

        saveData()
    }, [subscription, code])


    const handleNameChange = (name: string) => {
        setSubscription(prev => prev ? { ...prev, name } : null)
    }



    const handleDeleteSubscription = async () => {
        if (!window.confirm('Bạn có chắc muốn huỷ subscription này không?')) return
        // localStorage.removeItem(`subscription:${code}`)
        await supabase.from('subscriptions').delete().eq('id', code)
        router.push('/')
    }

    const addMember = () => {
        if (!subscription || newMember.trim() === '') return

        const currentData = subscription.history[currentMonth] || { amount: 0, members: [] }
        const amount = currentData.amount

        const updatedMembers = [
            ...currentData.members,
            { name: newMember.trim(), paid: false, note: '', amount: 0 }
        ]

        const perPerson = updatedMembers.length > 0
            ? +(amount / updatedMembers.length).toFixed(0)
            : 0

        const membersWithAmount = updatedMembers.map(m => ({
            ...m,
            amount: perPerson
        }))

        setSubscription({
            ...subscription,
            history: {
                ...subscription.history,
                [currentMonth]: {
                    amount,
                    members: membersWithAmount
                }
            }
        })

        setNewMember('')
        setHighlightIndex(updatedMembers.length - 1)
        setTimeout(() => setHighlightIndex(null), 2000)
    }

    const removeMember = (index: number) => {
        if (!subscription) return
        const month = subscription.history[currentMonth]
        if (!month) return

        const updatedMembers = [...month.members]
        updatedMembers.splice(index, 1)

        const amount = month.amount
        const perPerson = updatedMembers.length > 0 ? +(amount / updatedMembers.length).toFixed(0) : 0
        const membersWithAmount = updatedMembers.map(m => ({ ...m, amount: perPerson }))

        setSubscription({
            ...subscription,
            history: {
                ...subscription.history,
                [currentMonth]: {
                    amount,
                    members: membersWithAmount
                }
            }
        })
    }

    const togglePaid = (index: number) => {
        if (!subscription) return
        const month = subscription.history[currentMonth]
        if (!month) return
        const updatedMembers = [...month.members]
        updatedMembers[index].paid = !updatedMembers[index].paid
        setSubscription({
            ...subscription,
            history: {
                ...subscription.history,
                [currentMonth]: {
                    ...month,
                    members: updatedMembers
                }
            }
        })
    }

    const updateNote = (index: number, value: string) => {
        if (!subscription) return
        const month = subscription.history[currentMonth]
        if (!month) return
        const updatedMembers = [...month.members]
        updatedMembers[index].note = value
        setSubscription({
            ...subscription,
            history: {
                ...subscription.history,
                [currentMonth]: {
                    ...month,
                    members: updatedMembers
                }
            }
        })
    }

    const switchMonth = (month: string) => {
        setCurrentMonth(month)
        setNewAmount(0)
        setNewMember('')
        if (subscription && !subscription.history[month]) {
            setSubscription({
                ...subscription,
                history: {
                    ...subscription.history,
                    [month]: { amount: 0, members: [] }
                }
            })
        }
    }

    const handleCloneNext12Months = (newMonths: Record<string, Member[]>) => {
        if (!subscription) return

        const currentAmount = subscription.history[currentMonth]?.amount || 0

        const cloned: Record<string, MonthlyData> = {}
        for (const [month, members] of Object.entries(newMonths)) {
            const perPerson = members.length > 0 ? +(currentAmount / members.length).toFixed(0) : 0
            const membersWithAmount = members.map(m => ({ ...m, amount: perPerson }))
            cloned[month] = {
                amount: currentAmount,
                members: membersWithAmount
            }
        }

        setSubscription({
            ...subscription,
            history: {
                ...subscription.history,
                ...cloned
            }
        })
    }

    if (!subscription || !currentMonth || !subscription.history[currentMonth]) return <div className="p-6">Đang tải dữ liệu...</div>

    const current = subscription.history[currentMonth]

    return (
        <div className="space-y-6 mx-auto p-6 max-w-3xl">
            <h1 className="flex items-center gap-2 font-bold text-2xl">
                <FaLayerGroup className="text-blue-600" /> Subscription: <span className="font-mono">{code}</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded-md text-blue-800 dark:text-white hover:scale-105 transition"
                >
                    <FaCalendarAlt /> Trang chủ
                </button>
            </div>

            <div>
                <label className="block mb-1 font-medium">📛 Tên Subscription</label>
                <input
                    value={subscription.name}
                    onChange={e => handleNameChange(e.target.value)}
                    className="px-3 py-2 border rounded w-full"
                    placeholder="VD: ChatGPT, Netflix..."
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">🗓️ Chọn tháng</label>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(subscription.history).map(month => (
                        <button
                            key={month}
                            onClick={() => switchMonth(month)}
                            className={`px-3 py-1 rounded ${month === currentMonth ? 'bg-blue-900 text-white' : 'bg-gray-500 text-white'}`}
                        >
                            {month}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium">💰 Tổng số tiền (VNĐ)</label>
                <input
                    type="number"
                    value={newAmount === 0 ? '' : newAmount}
                    onChange={e => {
                        const amount = Number(e.target.value)
                        setNewAmount(amount)

                        if (subscription) {
                            const members = subscription.history[currentMonth]?.members || []
                            const perPerson = members.length > 0 ? +(amount / members.length).toFixed(0) : 0
                            const updatedMembers = members.map(m => ({ ...m, amount: perPerson }))

                            setSubscription({
                                ...subscription,
                                history: {
                                    ...subscription.history,
                                    [currentMonth]: {
                                        amount,
                                        members: updatedMembers
                                    }
                                }
                            })
                        }
                    }}

                    placeholder="Nhập số tiền"
                    className="px-4 py-2 border rounded w-full text-base"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">👥 Thêm thành viên</label>
                <div className="flex gap-2">
                    <input
                        value={newMember}
                        onChange={e => setNewMember(e.target.value)}
                        placeholder="Tên thành viên"
                        className="flex-1 px-4 py-2 border rounded-md text-base"
                    />
                    <button
                        onClick={addMember}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white text-base"
                    >
                        <FaPlus className="text-lg" />
                        Thêm
                    </button>
                </div>
            </div>

            <div>
                <h2 className="flex items-center gap-2 mb-2 font-semibold text-lg">
                    <FaUserFriends className="text-green-600" /> Danh sách tháng {currentMonth}
                </h2>
                <div className="flex justify-between items-center mb-2 text-gray-600 text-sm">
                    <span>👥 Tổng thành viên: {current.members.length}</span>
                    <span>💸 Đã thu: {current.members.filter(m => m.paid).reduce((sum, m) => sum + m.amount, 0).toLocaleString()}₫</span>
                </div>

                <div className="gap-3 grid">
                    {current.members.map((m, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between gap-4 p-3 rounded-lg border shadow-sm transition duration-300 ${highlightIndex === i ? 'bg-yellow-100 dark:bg-yellow-900' : ''} ${m.paid ? '' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <button onClick={() => togglePaid(i)} title="Đã thanh toán?">
                                    {m.paid ? (
                                        <FaCheckCircle className="text-green-500" />
                                    ) : (
                                        <FaRegCircle className="text-gray-400" />
                                    )}
                                </button>
                                <div>
                                    <div className={`font-medium ${m.paid ? 'line-through text-green-600' : ''}`}>{m.name}</div>
                                    <div className="text-sm">{m.amount.toLocaleString()}₫</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={m.note}
                                    onChange={e => updateNote(i, e.target.value)}
                                    placeholder="Ghi chú"
                                    className="px-2 py-1 border rounded w-full text-sm"
                                />
                                <button
                                    onClick={() => removeMember(i)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Xoá thành viên"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => setShowCloneModal(true)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
                    >
                        <FaMagic /> Tạo 12 tháng tiếp theo
                    </button>

                    <button
                        onClick={handleDeleteSubscription}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                    >
                        <FaTrashAlt /> Huỷ subscription này
                    </button>
                </div>
            </div>

            {showCloneModal && (
                <CloneNext12MonthsModal
                    currentMonth={currentMonth}
                    members={current?.members ?? []}
                    onClose={() => setShowCloneModal(false)}
                    onCreate={handleCloneNext12Months}
                />
            )}
        </div>
    )
}

export type { Member, SubscriptionData, MonthlyData }
