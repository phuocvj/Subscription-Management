'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaMagic, FaSpinner, FaArrowRight } from 'react-icons/fa'
import { supabase } from '@/app/lib/supabase'
import { customAlphabet, nanoid } from 'nanoid'
async function generateUniqueCode(): Promise<string> {
    let code = ''
    let attempts = 0

    while (true) {
        const raw = nanoid(12) // sinh chuỗi dài hơn → tăng entropy
        code = raw
            .replace(/[^A-Z0-9]/gi, '') // chỉ giữ chữ và số
            .toUpperCase()
            .substring(0, 6) // lấy 6 ký tự đầu tiên

        attempts++

        const { data, error } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('id', code)
            .maybeSingle()

        if (error) {
            console.error('Lỗi khi kiểm tra code:', error)
            throw new Error('Không thể kiểm tra mã. Vui lòng thử lại.')
        }

        if (!data) {
            return code
        }

        if (attempts > 10) {
            throw new Error('Không thể tạo mã duy nhất sau nhiều lần thử.')
        }
    }
}
export default function CreatePage() {
    const [code, setCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [type, setType] = useState<'month' | 'year'>('month') // thêm state loại subscription
    const router = useRouter()
    const createdRef = useRef(false)

    useEffect(() => {
        if (createdRef.current) return
        createdRef.current = true

        const createSubscription = async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()

            if (!session || sessionError) {
                setError('❌ Vui lòng đăng nhập để tạo Subscription.')
                return
            }

            const user = session.user
            const now = new Date()
            const monthKey = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
            const newCode = await generateUniqueCode()

            const defaultData = {
                name: '',
                password: '',
                note: '',
                history: {
                    [monthKey]: {
                        amount: 0,
                        members: []
                    }
                }
            }

            const { error: insertError } = await supabase.from('subscriptions').insert({
                id: newCode,
                owner_id: user.id,
                name: '',
                password: '',
                note: '',
                data: defaultData,
                created_at: now.toISOString(),
                last_edited_at: now.toISOString(),
                last_edited_by: user.id + '|' + user.email,
            })

            if (insertError) {
                setError(`❌ Lỗi khi tạo subscription: ${insertError.message}`)
                return
            }

            setCode(newCode)
        }

        createSubscription()
    }, [])

    const handleNext = () => {
        if (!code) return
        router.push(`/manage/${code}?type=${type}`) // bạn có thể lấy type ở trang manage nếu cần
    }

    return (
        <div className="flex justify-center items-center px-4 min-h-screen text-center">
            <div className="space-y-6">
                <div className="flex justify-center text-blue-600 text-4xl">
                    <FaMagic className="animate-pulse" />
                </div>

                {error ? (
                    <p className="text-red-600 text-lg">{error}</p>
                ) : (
                    <>
                        <p className="font-mono text-blue-800 text-2xl tracking-widest">
                            {code}
                        </p>
                        <h2 className="font-bold text-2xl">Một bước nữa, hãy chọn loại đăng ký nhé!</h2>

                        {code && (
                            <>


                                <div className="space-y-2 text-left">
                                    <div className="flex justify-center items-center gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="month"
                                                checked={type === 'month'}
                                                onChange={() => setType('month')}
                                            />
                                            <span>Tháng</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="year"
                                                checked={type === 'year'}
                                                onChange={() => setType('year')}
                                            />
                                            <span>Năm</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 mx-auto mt-4 rounded-full w-14 h-14 text-white transition"
                                    title="Tiếp tục"
                                >
                                    <FaArrowRight />
                                </button>
                            </>
                        )}

                        {!code && (
                            <div className="flex justify-center items-center gap-2 text-gray-500 text-sm">
                                <FaSpinner className="animate-spin" />
                                <span>Bạn sẽ được chuyển hướng trong giây lát...</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}