// Quản lý subscription theo tháng với chức năng tạo 12 tháng tiếp theo
'use client'
import { supabase } from '@/app/lib/supabase'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import CloneNext12MonthsModal from '@/app/components/CloneNext12MonthsModal'
import { FaCalendarAlt, FaUserFriends, FaMoneyBillWave, FaLayerGroup, FaMagic, FaTrashAlt, FaEquals, FaPlus, FaTrash, FaCheckCircle, FaRegCircle, FaUserPlus } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import InviteList from '@/app/components/InviteList'

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

// Tổng subscription lưu trên Supabase
type SubscriptionData = {
    name: string
    history: Record<string, MonthlyData>
    password?: string
    note?: string
}

export default function ManageSubscriptionPage() {
    const { id } = useParams()
    const code = id as string
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [isEditable, setIsEditable] = useState<boolean>(false)
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
    const [currentMonth, setCurrentMonth] = useState<string>('')
    const [newMember, setNewMember] = useState('')
    const [newAmount, setNewAmount] = useState<number>(0)
    const [formattedAmount, setFormattedAmount] = useState<string>('')

    const [showCloneModal, setShowCloneModal] = useState(false)
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [ownerId, setOwnerId] = useState<string | null>(null)
    //Popup Invite
    const [invitePopup, setInvitePopup] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [pendingInvite, setPendingInvite] = useState(false)
    const router = useRouter()

    // const isEditable = userId && ownerId && userId === ownerId
    // Kiểm tra xem có phải người được mời chưa xác nhận không
    useEffect(() => {
        if (!userEmail) return
        const checkPending = async () => {
            const { data } = await supabase
                .from('subscription_editors')
                .select('email, accepted')
                .eq('subscription_id', code)
                .eq('email', userEmail.toLowerCase())
                .maybeSingle()

            if (data && !data.accepted) {
                setPendingInvite(true)
            }
        }
        checkPending()
    }, [userEmail])

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUserId(session?.user.id ?? null)
            setUserEmail(session?.user.email ?? null)
        }
        fetchUser()
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
                setOwnerId(row.owner_id || null)
                data = {
                    ...row.data,
                    password: row.password ?? '',
                    note: row.note ?? '',
                }
            } else {
                data = { name: '', history: {}, password: '', note: '' }
                await supabase.from('subscriptions').insert({
                    id: code,
                    name: '',
                    owner_id: userId,
                    data
                })
                setOwnerId(userId)
            }

            const thisMonthData = data.history[monthKey]
            if (!thisMonthData) {
                data.history[monthKey] = {
                    amount: 0,
                    members: []
                }
                setNewAmount(0)
            } else {
                setNewAmount(thisMonthData.amount ?? 0)
            }

            setSubscription(data)
            if (row.owner_id === userId) {
                setIsEditable(true)
            } else {
                // kiểm tra nếu user được mời và đã accept
                const { data: editor } = await supabase
                    .from('subscription_editors')
                    .select('accepted')
                    .eq('subscription_id', code)
                    .eq('email', userEmail?.toLowerCase())
                    .maybeSingle()

                if (editor?.accepted) {
                    setIsEditable(true)
                }
            }
        }

        if (userId) {
            fetchSubscription()
        }
    }, [code, userId])

    useEffect(() => {
        const saveData = async () => {
            if (!subscription || !isEditable) return

            await supabase
                .from('subscriptions')
                .update({
                    name: subscription.name,
                    password: subscription.password || '',
                    note: subscription.note || '',
                    data: subscription,
                    last_edited_at: new Date().toISOString(),
                    last_edited_by: userId + '|' + userEmail, // hoặc userEmail nếu bạn thích
                })
                .eq('id', code)
        }

        saveData()
    }, [subscription, code, userId, isEditable])
    useEffect(() => {
        // Khi newAmount thay đổi, cập nhật formattedAmount
        setFormattedAmount(newAmount > 0 ? newAmount.toLocaleString('en-US') : '')

    }, [newAmount])
    // Tất cả các hàm handle* cũng cần thêm điều kiện isEditable
    const handleNameChange = (name: string) => {
        if (!isEditable) return
        setSubscription(prev => prev ? { ...prev, name } : null)
    }

    const handlePasswordChange = (password: string) => {
        if (!isEditable) return
        setSubscription(prev => prev ? { ...prev, password } : null)
    }

    const handleNoteChange = (note: string) => {
        if (!isEditable) return
        setSubscription(prev => prev ? { ...prev, note } : null)
    }

    const handleDeleteSubscription = async () => {
        if (!isEditable) return
        if (!window.confirm('Bạn có chắc muốn huỷ subscription này không?')) return
        await supabase.from('subscriptions').delete().eq('id', code)
        router.push('/')
    }

    const addMember = () => {
        if (!subscription || newMember.trim() === '' || !isEditable) return

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
        if (!subscription || !isEditable) return
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
        if (!subscription || !isEditable) return
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
        if (!subscription || !isEditable) return
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
        if (subscription && !subscription.history[month] && isEditable) {
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
        if (!subscription || !isEditable) return

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

    // phần render mới với phân quyền isEditable
    return (
        <div className="space-y-6 mx-auto p-6 max-w-3xl">
            <h1 className="flex items-center gap-2 font-bold text-2xl">
                <FaLayerGroup className="text-blue-600" /> Subscription: <span className="font-mono">{code} ({userEmail})</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded-md text-blue-800 dark:text-white hover:scale-105 transition"
                >
                    <FaCalendarAlt /> Trang chủ
                </button>

                {isEditable && (
                    <button
                        onClick={() => setInvitePopup(true)}
                        className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-800 px-3 py-1 rounded-md text-indigo-800 dark:text-white hover:scale-105 transition"
                    >
                        <FaUserPlus /> Mời quản lý
                    </button>
                )}
            </div>
            {pendingInvite && (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow text-sm flex justify-between items-center">
                    <span>📩 Bạn đã được mời quản lý subscription này. Nhấn để xác nhận và có quyền chỉnh sửa.</span>
                    <button
                        onClick={async () => {
                            const { error } = await supabase
                                .from('subscription_editors')
                                .update({ accepted: true })
                                .eq('subscription_id', code)
                                .eq('email', userEmail?.toLowerCase())

                            if (!error) {
                                setPendingInvite(false)
                                setIsEditable(true)
                                alert('✅ Bạn đã chấp nhận lời mời!')
                            }
                        }}
                        className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Đồng ý
                    </button>
                </div>
            )}
            <div>
                <label className="block mb-1 font-medium">📛 Tên Subscription</label>
                <input
                    disabled={!isEditable}
                    value={subscription.name}
                    onChange={e => handleNameChange(e.target.value)}
                    className="px-3 py-2 border rounded w-full disabled:opacity-60"
                    placeholder="VD: ChatGPT, Netflix..."
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">🔐 Mật khẩu (tuỳ chọn)</label>
                <input
                    disabled={!isEditable}
                    type="password"
                    value={subscription.password || ''}
                    onChange={e => handlePasswordChange(e.target.value)}
                    className="px-3 py-2 border rounded w-full disabled:opacity-60"
                    placeholder="Nhập mật khẩu nếu cần"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">📝 Ghi chú (tuỳ chọn)</label>
                <textarea
                    disabled={!isEditable}
                    value={subscription.note || ''}
                    onChange={e => handleNoteChange(e.target.value)}
                    className="px-3 py-2 border rounded w-full disabled:opacity-60"
                    placeholder="Thông tin thêm về subscription..."
                />
            </div>

            <div>
                <label className="block mb-2 font-semibold text-lg">🗓️ Chọn tháng</label>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(subscription.history)
                        .sort((a, b) => {
                            const [aM, aY] = a.split('/').map(Number)
                            const [bM, bY] = b.split('/').map(Number)
                            return new Date(aY, aM - 1).getTime() - new Date(bY, bM - 1).getTime()
                        })
                        .map(month => (
                            <button
                                key={month}
                                onClick={() => switchMonth(month)}
                                className={`flex items-center gap-1 px-4 py-2 rounded-md shadow-sm transition-all border
                  ${month === currentMonth
                                        ? 'bg-blue-700 text-white border-blue-900 scale-105'
                                        : 'bg-white dark:bg-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-zinc-600 border-gray-300'
                                    }`}
                            >
                                📅 {month}
                            </button>
                        ))}
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium">💰 Tổng số tiền (VNĐ)</label>
                <input
                    type="text"
                    inputMode="numeric"
                    disabled={!isEditable}
                    value={formattedAmount}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '') // chỉ giữ số
                        const amount = Number(raw)
                        setNewAmount(amount)

                        const members = subscription?.history[currentMonth]?.members || []
                        const perPerson = members.length > 0 ? +(amount / members.length).toFixed(0) : 0
                        const updatedMembers = members.map(m => ({ ...m, amount: perPerson }))

                        if (subscription) {
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
                    className="px-4 py-2 border rounded w-full text-base disabled:opacity-60"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">👥 Thêm thành viên</label>
                <div className="flex gap-2">
                    <input
                        disabled={!isEditable}
                        value={newMember}
                        onChange={e => setNewMember(e.target.value)}
                        placeholder="Tên thành viên"
                        className="flex-1 px-4 py-2 border rounded-md text-base disabled:opacity-60"
                    />
                    <button
                        disabled={!isEditable}
                        onClick={addMember}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white text-base disabled:opacity-50"
                    >
                        <FaPlus className="text-lg" /> Thêm
                    </button>
                </div>
            </div>

            <div>
                <h2 className="flex items-center gap-2 mb-2 font-semibold text-lg">
                    <FaUserFriends className="text-green-600" /> Danh sách tháng {currentMonth}
                </h2>
                <div className="flex justify-between items-center mb-2 text-gray-600 text-sm">
                    <span>👥 Tổng thành viên: {subscription.history[currentMonth].members.length}</span>
                    <span>💸 Đã thu: {subscription.history[currentMonth].members.filter(m => m.paid).reduce((sum, m) => sum + m.amount, 0).toLocaleString()}₫</span>
                </div>

                <div className="gap-3 grid">
                    {subscription.history[currentMonth].members.map((m, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between gap-4 p-3 rounded-lg border shadow-sm transition duration-300
                ${highlightIndex === i ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <button onClick={() => togglePaid(i)} disabled={!isEditable}>
                                    {m.paid ? <FaCheckCircle className="text-green-500" /> : <FaRegCircle className="text-gray-400" />}
                                </button>
                                <div>
                                    <div className={`font-medium ${m.paid ? 'line-through text-green-600' : ''}`}>{m.name}</div>
                                    <div className="text-sm">{m.amount.toLocaleString()}₫</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    disabled={!isEditable}
                                    type="text"
                                    value={m.note}
                                    onChange={e => updateNote(i, e.target.value)}
                                    placeholder="Ghi chú"
                                    className="px-2 py-1 border rounded w-full text-sm disabled:opacity-60"
                                />
                                <button
                                    disabled={!isEditable}
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

                {isEditable && (
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
                )}
            </div>

            {showCloneModal && (
                <CloneNext12MonthsModal
                    currentMonth={currentMonth}
                    members={subscription.history[currentMonth]?.members ?? []}
                    onClose={() => setShowCloneModal(false)}
                    onCreate={handleCloneNext12Months}
                />
            )}


            {invitePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-2xl w-96 animate-popup-zoom transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">📧</span>
                            <h2 className="text-xl font-bold">Mời người khác quản lý Subscription</h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            Nhập địa chỉ email Google của người được mời
                        </p>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="example@gmail.com"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setInvitePopup(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                                Huỷ
                            </button>
                            <button
                                onClick={async () => {
                                    const email = inviteEmail.trim().toLowerCase()
                                    if (!email) return

                                    const { error } = await supabase.from('subscription_editors').upsert({
                                        subscription_id: code,
                                        email,
                                        inviter_email: userEmail // 👈 cập nhật người gửi lời mời
                                    }, { onConflict: 'subscription_id,email' })
                                    if (error) alert('Lỗi khi mời: ' + error.message)
                                    else alert('✅ Đã gửi lời mời thành công!')
                                    setInviteEmail('')
                                    setInvitePopup(false)
                                }}
                                className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
                            >
                                Gửi lời mời
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditable && (
                <div className="mt-6 space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        📜 Danh sách người được mời quản lý
                    </h3>

                    <InviteList subscriptionId={code} />
                </div>
            )}

        </div>
    )
}

export type { Member, SubscriptionData, MonthlyData }
