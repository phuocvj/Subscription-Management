import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { FaTrash, FaPaperPlane } from 'react-icons/fa'

function InviteList({ subscriptionId }: { subscriptionId: string }) {
    const [editors, setEditors] = useState<{ email: string, accepted: boolean }[]>([])

    useEffect(() => {
        const fetchEditors = async () => {
            const { data, error } = await supabase
                .from('subscription_editors')
                .select('email, accepted')
                .eq('subscription_id', subscriptionId)

            if (!error && data) {
                setEditors(data)
            }
        }

        fetchEditors()
    }, [subscriptionId])

    const resendInvite = async (email: string) => {
        alert(`📨 Đã gửi lại lời mời đến ${email}!`) // Mô phỏng, có thể tích hợp gửi mail thật
    }

    const removeInvite = async (email: string) => {
        if (!confirm(`Bạn có chắc muốn huỷ lời mời ${email}?`)) return

        const { error } = await supabase
            .from('subscription_editors')
            .delete()
            .eq('subscription_id', subscriptionId)
            .eq('email', email)

        if (!error) {
            setEditors(prev => prev.filter(e => e.email !== email))
        } else {
            alert('Lỗi khi huỷ lời mời: ' + error.message)
        }
    }

    if (editors.length === 0) {
        return <p className="text-sm text-gray-500 italic">Chưa có ai được mời.</p>
    }

    return (
        <ul className="space-y-2">
            {editors.map(({ email, accepted }) => (
                <li key={email} className="flex items-center justify-between border rounded px-4 py-2 bg-white dark:bg-zinc-800 shadow-sm">
                    <div>
                        <p className="font-medium">{email}</p>
                        <p className="text-sm text-gray-500">
                            {accepted ? '✅ Đã chấp nhận' : '⌛ Chưa chấp nhận'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!accepted && (
                            <button
                                onClick={() => resendInvite(email)}
                                className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded"
                                title="Gửi lại lời mời"
                            >
                                <FaPaperPlane /> Gửi lại
                            </button>
                        )}
                        <button
                            onClick={() => removeInvite(email)}
                            className="text-red-500 hover:text-red-700"
                            title="Huỷ lời mời"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default InviteList
