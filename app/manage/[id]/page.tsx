// Quản lý subscription theo tháng với chức năng tạo 12 tháng tiếp theo
'use client'
import { supabase } from '@/app/lib/supabase'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import CloneNext12MonthsModal from '@/app/components/CloneNext12MonthsModal'
import { FaCalendarAlt, FaUserFriends, FaMoneyBillWave, FaLayerGroup, FaMagic, FaTrashAlt, FaEquals, FaPlus, FaTrash, FaCheckCircle, FaRegCircle, FaUserPlus } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import InviteList from '@/app/components/InviteList'
import CloneNextPeriodsModal from '@/app/components/CloneNext12MonthsModal'
import TextareaAutosize from 'react-textarea-autosize'

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
    subscription_type?: 'month' | 'year' // 👈 mới
}

export default function ManageSubscriptionPage() {
    const params = useParams()
    const searchParams = useSearchParams()

    const code = params.id as string
    const subscriptionType = (searchParams.get('type') as 'month' | 'year') || 'month'

    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [isEditable, setIsEditable] = useState<boolean>(false)
    const [isOwner, setIsOwner] = useState<boolean>(false)


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
    const [checkingAuth, setCheckingAuth] = useState(true)

    //danh cho anonymous
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
    const [inputPassword, setInputPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [rawRow, setRawRow] = useState<any>(null)

    const router = useRouter()
    const subscriptionRowRaw = useRef<any>(null)

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
            setInviteEmail

            if (error && error.code !== 'PGRST116') {
                console.error('Lỗi khi load subscription:', error)
            }

            const now = new Date()

            let data: SubscriptionData
            subscriptionRowRaw.current = row
            if (row) {

                setOwnerId(row.owner_id || null)

                // 👇 Nếu subscription đã có, chỉ cần lấy dữ liệu và cập nhật lại
                setRawRow(row) // 👉 Lưu lại toàn bộ row để sau này dùng mật khẩu

                // 👇 Nếu chưa đăng nhập mà subscription có mật khẩu → yêu cầu nhập
                if (!userId && row.password) {
                    setShowPasswordPrompt(true)
                    return // ⛔ Không load tiếp nếu chưa xác minh
                }
                data = {
                    ...row.data,
                    password: row.password ?? '',
                    note: row.note ?? '',
                    subscription_type: subscriptionType,
                }


            } else {
                if (!userId) {
                    console.warn('Chưa đăng nhập, không thể tạo mới subscription.')
                    return
                }

                const defaultKey = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
                data = {
                    name: '',
                    history: {
                        [defaultKey]: {
                            amount: 0,
                            members: []
                        }
                    },
                    password: '',
                    note: '',
                    subscription_type: subscriptionType
                }

                await supabase.from('subscriptions').insert({
                    id: code,
                    name: '',
                    owner_id: userId,
                    data,
                    created_at: now.toISOString(),
                    last_edited_at: now.toISOString(),
                    last_edited_by: userId + '|' + userEmail,
                })

                setOwnerId(userId)
            }

            // 👇 Xác định key hiển thị ban đầu (dựa vào loại subscription)
            const subType = subscriptionType ?? 'month'
            let displayKey = ''

            if (subType === 'month') {
                displayKey = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
            } else {
                displayKey = `${now.getFullYear()}`
            }

            // 👇 Nếu key chưa tồn tại → thêm vào history
            if (!data.history[displayKey]) {
                data.history[displayKey] = {
                    amount: 0,
                    members: []
                }
                setNewAmount(0)
            } else {
                setNewAmount(data.history[displayKey].amount ?? 0)
            }

            setCurrentMonth(displayKey)
            setSubscription(data)

            // 👇 Quyền chỉnh sửa
            if (row?.owner_id === userId) {
                setIsEditable(true)
                setIsOwner(true)
            } else if (userEmail) {
                const { data: editor } = await supabase
                    .from('subscription_editors')
                    .select('accepted')
                    .eq('subscription_id', code)
                    .eq('email', userEmail.toLowerCase())
                    .maybeSingle()

                if (editor?.accepted) {
                    setIsEditable(true)
                }
                setIsOwner(false)
            }
        }

        fetchSubscription()
    }, [code, userId, userEmail])

    // useEffect(() => {
    //     const fetchSubscription = async () => {
    //         const { data: row, error } = await supabase
    //             .from('subscriptions')
    //             .select('*')
    //             .eq('id', code)
    //             .single()

    //         if (error && error.code !== 'PGRST116') {
    //             console.error('Lỗi khi load subscription:', error)
    //         }

    //         const now = new Date()
    //         const monthKey = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
    //         setCurrentMonth(monthKey)

    //         let data: SubscriptionData

    //         if (row) {
    //             setOwnerId(row.owner_id || null)
    //             data = {
    //                 ...row.data,
    //                 password: row.password ?? '',
    //                 note: row.note ?? '',
    //             }
    //         } else {
    //             // Nếu không có row (mã không tồn tại), không tạo mới nếu chưa đăng nhập
    //             if (!userId) {
    //                 console.warn('Chưa đăng nhập, không thể tạo mới subscription.')
    //                 return
    //             }

    //             // Tạo subscription mới nếu đang đăng nhập và chưa có
    //             data = { name: '', history: {}, password: '', note: '' }
    //             await supabase.from('subscriptions').insert({
    //                 id: code,
    //                 name: '',
    //                 owner_id: userId,
    //                 data,
    //                 created_at: now.toISOString(),
    //                 last_edited_at: now.toISOString(),
    //                 last_edited_by: userId + '|' + userEmail,
    //             })
    //             setOwnerId(userId)
    //         }

    //         // Đảm bảo có dữ liệu tháng hiện tại
    //         if (!data.history[monthKey]) {
    //             data.history[monthKey] = {
    //                 amount: 0,
    //                 members: []
    //             }
    //             setNewAmount(0)
    //         } else {
    //             setNewAmount(data.history[monthKey].amount ?? 0)
    //         }

    //         setSubscription(data)

    //         // Xác định quyền chỉnh sửa
    //         if (row?.owner_id === userId) {
    //             setIsEditable(true)
    //             setIsOwner(true);
    //         } else if (userEmail) {
    //             const { data: editor } = await supabase
    //                 .from('subscription_editors')
    //                 .select('accepted')
    //                 .eq('subscription_id', code)
    //                 .eq('email', userEmail.toLowerCase())
    //                 .maybeSingle()

    //             if (editor?.accepted) {
    //                 setIsEditable(true)
    //             }
    //             setIsOwner(false);
    //         }
    //     }

    //     fetchSubscription()
    // }, [code, userId, userEmail])

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
                    subscription_type: subscription.subscription_type || 'month', // 👈 thêm vào đây
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
        const amount = subscription?.history[month]?.amount ?? 0
        setNewAmount(amount)
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
    const handleCloneNextPeriods = (newPeriods: Record<string, Member[]>) => {
        if (!subscription || !isEditable) return

        const currentAmount = subscription.history[currentMonth]?.amount || 0

        const cloned: Record<string, MonthlyData> = {}

        for (const [key, members] of Object.entries(newPeriods)) {
            const perPerson = members.length > 0 ? +(currentAmount / members.length).toFixed(0) : 0
            const membersWithAmount = members.map(m => ({ ...m, amount: perPerson }))
            cloned[key] = {
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
    if (showPasswordPrompt) {
        return (
            <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-zinc-800 shadow-2xl p-6 rounded-2xl w-96 transition-all animate-popup-zoom duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🔐</span>
                        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-xl">
                            Nhập mật khẩu để mở Subscription
                        </h2>
                    </div>
                    <p className="mb-3 text-gray-600 dark:text-gray-300 text-sm">
                        Subscription <span className="font-mono text-blue-700 dark:text-blue-300">{params.id}</span> đang được bảo vệ.
                    </p>
                    <input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        className="bg-gray-100 dark:bg-zinc-700 mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-900 dark:text-gray-100"
                        placeholder="Nhập mật khẩu..."
                        autoFocus
                    />
                    {passwordError && <p className="mb-2 text-red-500 text-sm">{passwordError}</p>}
                    <div className="flex justify-end gap-2">
                        <button
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-md text-gray-900 dark:text-gray-100 transition"
                            onClick={() => router.push('/')}
                        >
                            Huỷ
                        </button>
                        <button
                            onClick={() => {
                                if (inputPassword === rawRow?.password) {
                                    setShowPasswordPrompt(false)
                                    const now = new Date()
                                    const displayKey = subscriptionType === 'year'
                                        ? `${now.getFullYear()}`
                                        : `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`

                                    const historyData = rawRow.data.history || {}
                                    if (!historyData[displayKey]) {
                                        historyData[displayKey] = { amount: 0, members: [] }
                                    }

                                    setCurrentMonth(displayKey)
                                    setNewAmount(historyData[displayKey].amount ?? 0)

                                    const data: SubscriptionData = {
                                        ...rawRow.data,
                                        password: rawRow.password ?? '',
                                        note: rawRow.note ?? '',
                                        subscription_type: subscriptionType,
                                    }

                                    setSubscription(data)
                                } else {
                                    setPasswordError('❌ Sai mật khẩu. Vui lòng thử lại.')
                                }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition"
                        >
                            Mở khoá
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    if (!subscription || !currentMonth || !subscription.history[currentMonth])
        return (
            <div className="flex justify-center items-center min-h-screen text-blue-600 text-lg animate-pulse">
                🔄 Đang kiểm tra dữ liệu...
            </div>
        )

    const current = subscription.history[currentMonth]

    // phần render mới với phân quyền isEditable
    return (
        <div className="space-y-6 mx-auto p-6 max-w-3xl">
            <h1 className="flex items-center gap-2 font-bold text-2xl">
                <FaLayerGroup className="text-blue-600" /> Subscription {code}
            </h1>
            <h2 className="flex items-center gap-2 mb-4 font-semibold text-lg">
                <FaMagic className="text-blue-600" /> {/* Thêm icon ở đây */}
                {subscriptionType === "month" ? "Đăng ký mỗi tháng" : "Đăng ký mỗi năm"}
            </h2>
            <div className="flex items-center gap-3 mt-2">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-md text-blue-800 dark:text-white hover:scale-105 transition"
                >
                    <FaCalendarAlt /> Trang chủ
                </button>

                {isEditable && isOwner && (
                    <button
                        onClick={() => setInvitePopup(true)}
                        className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-800 px-3 py-1 rounded-md text-indigo-800 dark:text-white hover:scale-105 transition"
                    >
                        <FaUserPlus /> Mời quản lý
                    </button>
                )}
            </div>
            {pendingInvite && (
                <div className="flex justify-between items-center bg-yellow-100 dark:bg-yellow-900 shadow p-4 rounded-lg text-sm">
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
                        className="bg-green-600 hover:bg-green-700 ml-4 px-3 py-1 rounded text-white"
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
                    className="disabled:opacity-60 px-3 py-2 border border-amber-500 rounded w-full font-semibold"
                    placeholder="VD: ChatGPT, Netflix..."
                />
            </div>

            {isEditable && (<div>
                <label className="block mb-1 font-medium">🔐 Mật khẩu (tuỳ chọn)</label>
                <input
                    disabled={!isEditable}
                    type="password"
                    value={subscription.password || ''}
                    onChange={e => handlePasswordChange(e.target.value)}
                    className="disabled:opacity-60 px-3 py-2 border rounded w-full"
                    placeholder="Nhập mật khẩu nếu cần"
                />
            </div>)}

            {isEditable && (<div>
                <label className="block mb-1 font-medium">📝 Ghi chú (tuỳ chọn)</label>
                <TextareaAutosize
                    minRows={2}
                    maxRows={10}
                    disabled={!isEditable}
                    value={subscription.note || ''}
                    onChange={e => handleNoteChange(e.target.value)}
                    className="disabled:opacity-60 px-3 py-2 border rounded w-full overflow-hidden transition-all resize-none"
                />
            </div>)}

            <div>
                <label className="block mb-2 font-semibold text-lg">
                    {subscription.subscription_type === 'year' ? '🗓️ Chọn năm' : '🗓️ Chọn tháng'}
                </label>
                <div className="gap-2 grid grid-cols-4 md:grid-cols-8">
                    {Object.keys(subscription.history)
                        .filter(key => {
                            if (subscription.subscription_type === 'year') return /^\d{4}$/.test(key);
                            return /^\d{2}\/\d{4}$/.test(key);
                        })
                        .sort((a, b) => {
                            const [aM, aY] = a.split('/').map(Number);
                            const [bM, bY] = b.split('/').map(Number);
                            return new Date(aY, aM - 1).getTime() - new Date(bY, bM - 1).getTime();
                        })
                        .map(month => (
                            <button
                                key={month}
                                onClick={() => switchMonth(month)}
                                className={`w-full flex items-center justify-center gap-1 px-4 py-2 rounded-md shadow-sm transition-all border
                        ${month === currentMonth
                                        ? 'bg-blue-900  border-2 text-white font-semibold border-amber-300 scale-105'
                                        : '   dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-zinc-600 border-gray-300'
                                    }`}
                            >
                                📅 {month}
                            </button>
                        ))}
                </div>
            </div>




            {isEditable && (<div>
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
                    className="disabled:opacity-60 px-4 py-2 border rounded w-full text-base"
                />
            </div>)}

            {isEditable && (<div>
                <label className="block mb-1 font-medium">👥 Thêm thành viên</label>
                <div className="flex gap-2">
                    <input
                        disabled={!isEditable}
                        value={newMember}
                        onChange={e => setNewMember(e.target.value)}
                        placeholder="Tên thành viên"
                        className="flex-1 disabled:opacity-60 px-4 py-2 border rounded-md text-base"
                    />
                    <button
                        disabled={!isEditable}
                        onClick={addMember}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-md text-white text-base"
                    >
                        <FaPlus className="text-lg" /> Thêm
                    </button>
                </div>
            </div>)}

            <div>

                <h2 className="flex items-center gap-2 mb-2 font-semibold text-lg">
                    <FaUserFriends className="text-green-600" /> Danh sách tháng {currentMonth}
                </h2>
                <div className="flex justify-between items-center mb-2 text-gray-600 text-sm">
                    <div className="mb-2 text-gray-600 text-sm">
                        👥 Tổng thành viên: {current.members.length} / {
                            current.members.filter(m => m.paid).length
                        } đã đóng · 💸 Tổng thu: {
                            current.members
                                .filter(m => m.paid)
                                .reduce((sum, m) => sum + m.amount, 0)
                                .toLocaleString('en-US')
                        }₫
                    </div>
                </div>

                <div className="gap-3 grid">
                    {subscription.history[currentMonth].members.map((m, i) => (
                        <div
                            key={i}
                            className={`flex flex-col gap-2 p-3 rounded-lg border shadow-sm transition duration-300
                          ${highlightIndex === i ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}
                        >
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => togglePaid(i)} disabled={!isEditable}>
                                        {m.paid ? <FaCheckCircle className="text-green-500" /> : <FaRegCircle className="text-gray-400" />}
                                    </button>
                                    <div>
                                        <div className={`font-medium ${m.paid ? 'line-through text-green-600' : ''}`}>{m.name}</div>
                                        {isEditable ? (
                                            <div className="relative w-28">

                                                <input
                                                    type="text"
                                                    className="px-2 py-1 border rounded w-28 text-sm text-center"
                                                    value={m.amount === 0 ? '' : m.amount.toLocaleString('en-US')}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.replace(/,/g, '')
                                                        const value = parseInt(raw || '0', 10)

                                                        const month = subscription.history[currentMonth]
                                                        const updatedMembers = [...month.members]
                                                        updatedMembers[i].amount = value

                                                        setSubscription({
                                                            ...subscription,
                                                            history: {
                                                                ...subscription.history,
                                                                [currentMonth]: {
                                                                    ...month,
                                                                    members: updatedMembers,
                                                                },
                                                            },
                                                        })
                                                    }}
                                                    placeholder="0"
                                                />
                                                <span className="top-1/2 right-2 absolute text-sm -translate-y-1/2">₫</span>

                                            </div>
                                        ) : (
                                            <div className="text-sm">{m.amount.toLocaleString('en-US')}₫</div>
                                        )}
                                    </div>
                                </div>
                                {isEditable && (
                                    <button
                                        onClick={() => removeMember(i)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Xoá thành viên"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                            {/* 👇 Đây là phần mới: note nằm ở dưới, full width */}
                            {isEditable ? (
                                <TextareaAutosize
                                    minRows={2}
                                    maxRows={6}
                                    disabled={!isEditable}
                                    value={m.note}
                                    onChange={e => updateNote(i, e.target.value)}
                                    placeholder="Ghi chú..."
                                    className="disabled:opacity-60 mt-2 px-3 py-2 border rounded w-full overflow-hidden text-sm transition-all resize-none"
                                />
                            ) : (
                                m.note && (
                                    <div className="mt-2 text-gray-500 text-sm italic">
                                        📝 {m.note}
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>


                {isEditable && (
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => setShowCloneModal(true)}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
                        >
                            <FaMagic /> {subscription.subscription_type === 'year' ? 'Tạo 5 năm tiếp theo' : 'Tạo 12 tháng tiếp theo'}
                        </button>
                        {isOwner && (<button
                            onClick={handleDeleteSubscription}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                        >
                            <FaTrashAlt /> Huỷ subscription này
                        </button>)}
                    </div>
                )}
            </div>

            {showCloneModal && (
                <CloneNextPeriodsModal
                    currentMonth={currentMonth}
                    members={subscription.history[currentMonth]?.members ?? []}
                    subscriptionType={subscription.subscription_type ?? 'month'} // 👈 thêm dòng này
                    onClose={() => setShowCloneModal(false)}
                    onCreate={handleCloneNextPeriods}
                />
            )}


            {invitePopup && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-blue-950 bg-opacity-50 backdrop-blur-sm text-white animate-fade-in">
                    <div className="shadow-2xl p-6 rounded-2xl w-96 transition-all animate-popup-zoom duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">📧</span>
                            <h2 className="font-bold text-xl">Mời người khác quản lý Subscription</h2>
                        </div>
                        <p className="mb-3 text-gray-600 dark:text-gray-300 text-sm">
                            Nhập địa chỉ email Google của người được mời
                        </p>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            className="mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                            placeholder="example@gmail.com"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setInvitePopup(false)} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-md transition">
                                Huỷ
                            </button>
                            <button
                                onClick={async () => {
                                    const email = inviteEmail.trim().toLowerCase()
                                    if (!email) return

                                    // Kiểm tra chỉ chấp nhận email @gmail.com
                                    if (!email.endsWith('@gmail.com')) {
                                        alert('Chỉ được phép mời địa chỉ email Google (@gmail.com)')
                                        return
                                    }

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
                                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-white transition"
                            >
                                Gửi lời mời
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditable && isOwner && (
                <div className="space-y-2 mt-6">
                    <h3 className="flex items-center gap-2 font-semibold text-lg">
                        📜 Danh sách người được mời quản lý
                    </h3>

                    <InviteList subscriptionId={code} />
                </div>
            )}





        </div>
    )
}

export type { Member, SubscriptionData, MonthlyData }