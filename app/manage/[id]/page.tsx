// Quản lý subscription theo tháng với chức năng tạo 12 tháng tiếp theo
'use client'
import { supabase } from '@/app/lib/supabase'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import CloneNext12MonthsModal from '@/app/components/CloneNext12MonthsModal'
import { FaCalendarAlt, FaUserFriends, FaMoneyBillWave, FaLayerGroup, FaMagic, FaTrashAlt, FaEquals, FaPlus, FaTrash, FaCheckCircle, FaRegCircle, FaUserPlus, FaArrowLeft } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import InviteList from '@/app/components/InviteList'
import CloneNextPeriodsModal from '@/app/components/CloneNext12MonthsModal'
import TextareaAutosize from 'react-textarea-autosize'
import Select from 'react-select'
import { Sheet } from 'react-modal-sheet'

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

    const [confirmCode, setConfirmCode] = useState('')
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)
    const [rememberPassword, setRememberPassword] = useState(false)

    const router = useRouter()
    const subscriptionRowRaw = useRef<any>(null)

    const [isOpen, setIsOpen] = useState(false)

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

                    const remembered = JSON.parse(localStorage.getItem('subscription_remember') || '{}')
                    if (!remembered[code]) {
                        // Nếu chưa nhớ mật khẩu → yêu cầu nhập
                        setShowPasswordPrompt(true)
                        return // ⛔ Stop luôn không load tiếp data
                    }

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
        if (!isEditable || confirmCode !== code) return
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
            <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm">
                <div className="space-y-6 bg-white/30 dark:bg-zinc-800/30 shadow-2xl backdrop-blur-md mx-auto p-6 border border-white/30 dark:border-white/20 rounded-2xl w-full max-w-md ">

                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🔐</span>
                        <h2 className="font-bold text-2xl">Nhập mật khẩu để mở Subscription</h2>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Subscription <span className="font-mono font-semibold">{params.id}</span> đang được bảo vệ.
                    </p>

                    <input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        className="bg-white/40 dark:bg-white/10 backdrop-blur-md px-4 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 w-full text-black dark:text-white"
                        placeholder="Nhập mật khẩu..."
                        autoFocus
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="rememberPassword"
                            checked={rememberPassword}
                            onChange={(e) => setRememberPassword(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor="rememberPassword" className="dark:text-gray-300 text-sm">Ghi nhớ cho lần sau</label>
                    </div>

                    {passwordError && (
                        <p className="text-red-500 text-sm">{passwordError}</p>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 px-4 py-2 border border-white/30 rounded-lg font-semibold text-gray-900 dark:text-white transition"
                        >
                            Huỷ
                        </button>
                        <button
                            onClick={() => {
                                if (inputPassword === rawRow?.password) {
                                    if (rememberPassword) {
                                        const remembered = JSON.parse(localStorage.getItem('subscription_remember') || '{}')
                                        remembered[code] = true
                                        localStorage.setItem('subscription_remember', JSON.stringify(remembered))
                                    }
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
                            className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg font-semibold text-white transition"
                        >
                            Mở khoá
                        </button>
                    </div>

                </div>
            </div>

        )
    }
    if (!subscription || !currentMonth || !subscription.history[currentMonth]) {
        if (!userId) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
                    <div className="bg-white/30 dark:bg-zinc-800/30 shadow-2xl backdrop-blur-md p-8 border border-white/30 dark:border-white/20 rounded-2xl w-full max-w-md animate-scale-fade-in text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <span className="text-3xl">🔒</span>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Cần đăng nhập
                            </h2>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-8">
                            Bạn cần đăng nhập để xem subscription này
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 shadow-lg backdrop-blur-md px-6 py-3 border border-white/30 dark:border-white/20 rounded-xl font-semibold text-gray-900 dark:text-white transition hover:scale-105"
                            >
                                <FaCalendarAlt className="text-blue-600" />
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-white/30 dark:bg-zinc-800/30 shadow-2xl backdrop-blur-md p-6 border border-white/30 dark:border-white/20 rounded-2xl animate-scale-fade-in">
                    <div className="text-blue-600 text-lg animate-pulse">
                        🔄 Đang kiểm tra dữ liệu...
                    </div>
                </div>
            </div>
        )
    }

    const current = subscription.history[currentMonth]

    // phần render mới với phân quyền isEditable
    return (
        <div className="space-y-6 bg-gradient-to-br from-indigo-200/90 via-purple-100/85 to-pink-200/90 dark:from-gray-800 dark:via-gray-900/20 dark:to-black shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] backdrop-blur-md mx-auto p-6 rounded-lg w-full max-w-4xl">
            <h1 className="flex items-center gap-2 font-bold text-2xl">
                <FaLayerGroup className="text-blue-600" /> Subscription {code}
            </h1>
            <h2 className="flex items-center gap-2 mb-4 font-semibold text-lg">
                <FaMagic className="text-blue-600" /> {/* Thêm icon ở đây */}
                {subscriptionType === "month" ? "Đăng ký mỗi tháng" : "Đăng ký mỗi năm"}
            </h2>
            <div className="flex items-center gap-3 mt-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
                >
                    <FaArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {isEditable && isOwner && (
                    <button
                        onClick={() => setInvitePopup(true)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 shadow-sm backdrop-blur-md px-4 py-2 border border-white/30 dark:border-white/20 rounded-lg font-semibold text-indigo-600 dark:text-indigo-300 hover:scale-105 transition-all"
                    >
                        <FaUserPlus className="text-indigo-500" />
                        Mời quản lý
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
            <div className="space-y-3 shadow-lg backdrop-blur-md p-4 border-2 rounded-2xl">

                <label className="block mb-1 font-medium">📛 Tên Subscription</label>
                <input
                    disabled={!isEditable}
                    value={subscription.name}
                    onChange={e => handleNameChange(e.target.value)}
                    className="disabled:opacity-60 px-3 py-2 border border-amber-500 dark:border-amber-400 rounded w-full font-semibold dark:text-white"
                    placeholder="VD: ChatGPT, Netflix..."
                />
            </div>

            {isEditable && (<div className="space-y-3 shadow-lg backdrop-blur-md p-4 border-2 rounded-2xl">
                <label className="block mb-1 font-medium">🔐 Mật khẩu (tuỳ chọn)</label>
                <input
                    disabled={!isEditable}
                    type="password"
                    value={subscription.password || ''}
                    onChange={e => handlePasswordChange(e.target.value)}
                    className="disabled:opacity-60 px-3 py-2 border rounded w-full"
                    placeholder="Nhập mật khẩu nếu cần"
                />


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

            <div className="space-y-3 shadow-lg backdrop-blur-md p-4 border-2 rounded-2xl">
                <label className="block mb-2 font-semibold text-lg">
                    {subscription.subscription_type === 'year' ? '🗓️ Chọn năm' : '🗓️ Chọn tháng'}
                </label>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white/20 dark:bg-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 flex items-center justify-between"
                >
                    <span>📅 {currentMonth}</span>
                    <span>▼</span>
                </button>

                <Sheet
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    snapPoints={[600, 400, 100, 0]}
                    initialSnap={1}
                    className="react-modal-sheet"
                >
                    <Sheet.Container>
                        <Sheet.Header />
                        <Sheet.Content>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-4">
                                    {subscription.subscription_type === 'year' ? 'Chọn năm' : 'Chọn tháng'}
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
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
                                                onClick={() => {
                                                    switchMonth(month);
                                                    setIsOpen(false);
                                                }}
                                                className={`p-3 rounded-lg text-center transition-colors
                                                    ${month === currentMonth
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-white/20 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                                                    }`}
                                            >
                                                📅 {month}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </Sheet.Content>
                    </Sheet.Container>
                    <Sheet.Backdrop onTap={() => setIsOpen(false)} />
                </Sheet>
            </div>




            {isEditable && (
                <div className="space-y-4 shadow-lg backdrop-blur-md p-4 border-2 rounded-2xl z-9999">

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
                    <div>
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
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-md"
                            >
                                <FaPlus className="text-lg" /> Thêm
                            </button>
                        </div>
                    </div>
                </div>)}


            <div>

                <h2 className="flex items-center gap-2 mb-2 font-semibold text-lg">
                    <FaUserFriends className="text-green-600" /> Danh sách tháng {currentMonth}
                </h2>
                <div className="flex justify-between items-center mb-2 text-sm">
                    <div className="mb-2 text-sm">
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
                            className={`rounded-xl border-2 backdrop-blur-sm  shadow-md p-4 transition duration-300 ${highlightIndex === i ? 'border-l-4 border-yellow-400' : ''}`}
                        >
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => togglePaid(i)} disabled={!isEditable}>
                                        {m.paid ? <FaCheckCircle className="text-blue-600 text-2xl" /> : <FaRegCircle className="text-gray-400" />}
                                    </button>
                                    <div>
                                        <div className={`font-mono ${m.paid ? 'line-through text-blue-600 dark:text-white font-bold' : ''}`}>{m.name}</div>
                                        {isEditable ? (
                                            <div className="relative w-28">
                                                <input
                                                    type="text"
                                                    className="px-2 py-1 border rounded w-28 font-mono font-bold text-sm text-center"
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
                            {isEditable ? (
                                <TextareaAutosize
                                    minRows={2}
                                    maxRows={6}
                                    disabled={!isEditable}
                                    value={m.note}
                                    onChange={e => updateNote(i, e.target.value)}
                                    placeholder="Ghi chú..."
                                    className="disabled:opacity-60 mt-2 px-3 py-2 border rounded w-full overflow-hidden text-md text-black dark:text-white transition-all resize-none"
                                />
                            ) : (
                                m.note && (
                                    <div className="mt-2 text-black dark:text-white text-sm italic">
                                        📝 {m.note}
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>


                {isEditable && (
                    <div className="flex sm:flex-row-reverse flex-col items-end sm:items-center gap-3 sm:gap-4 mt-8">
                        <button
                            onClick={() => setShowCloneModal(true)}
                            className="flex justify-center items-center gap-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 shadow-lg backdrop-blur-md px-5 py-2.5 border border-white/30 rounded-xl font-semibold text-purple-700 dark:text-purple-300 transition"
                        >
                            <FaMagic className="text-lg" />
                            {subscription.subscription_type === 'year'
                                ? 'Tạo 5 năm tiếp theo'
                                : 'Tạo 12 tháng tiếp theo'}
                        </button>

                        {isOwner && (
                            <button
                                onClick={() => setShowConfirmDelete(true)}
                                className="flex justify-center items-center gap-2 bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 shadow-lg backdrop-blur-md px-5 py-2.5 border border-white/30 rounded-xl font-semibold text-red-600 dark:text-red-400 transition"
                            >
                                <FaTrashAlt className="text-lg" />
                                Huỷ subscription này
                            </button>
                        )}
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
                <div className="z-50 fixed inset-0 flex justify-center items-center backdrop-blur-sm text-white animate-fade-in">
                    <div className="bg-white dark:bg-gray-700 shadow-2xl p-6 rounded-2xl w-96 text-black dark:text-white transition-all animate-popup-zoom duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">📧</span>
                            <h2 className="font-bold text-xl">Mời người khác quản lý Subscription</h2>
                        </div>
                        <p className="mb-3 text-sm">
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
                            <button onClick={() => setInvitePopup(false)} className="px-4 py-2 rounded-md transition">
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


            {showConfirmDelete && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-opacity-50 backdrop-blur-sm">
                    <div className="shadow-2xl mx-4 p-6 rounded-2xl w-full max-w-md">
                        <h2 className="mb-4 font-semibold text-red-600 dark:text-red-400 text-lg">Xác nhận huỷ Subscription</h2>
                        <p className="mb-2 text-sm">
                            Nhập mã subscription <span className="font-mono font-bold">{code}</span> để xác nhận xoá:
                        </p>
                        <input
                            type="text"
                            value={confirmCode}
                            onChange={(e) => setConfirmCode(e.target.value)}
                            placeholder="Nhập mã subscription..."
                            className="mb-4 px-4 py-2 border rounded w-full"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded"
                            >
                                Huỷ bỏ
                            </button>
                            <button
                                disabled={confirmCode !== code}
                                onClick={handleDeleteSubscription}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded text-white"
                            >
                                Xác nhận xoá
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}

export type { Member, SubscriptionData, MonthlyData }