'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaMagic, FaSpinner, FaArrowRight } from 'react-icons/fa'
import { supabase } from '@/app/lib/supabase'
import { customAlphabet, nanoid } from 'nanoid'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

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
    const [selectedDate, setSelectedDate] = useState(() => new Date())

    const router = useRouter()
    const createdRef = useRef(false)

    useEffect(() => {
        if (createdRef.current) return
        createdRef.current = true

        const prepareCode = async () => {
            const newCode = await generateUniqueCode()
            setCode(newCode)
        }

        prepareCode()
    }, [])

    const handleNext = async () => {
        if (!code) return

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (!session || sessionError) {
            setError('❌ Vui lòng đăng nhập để tạo Subscription.')
            return
        }

        const user = session.user
        const now = selectedDate
        const monthKey = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`

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
            id: code,
            owner_id: user.id,
            name: '',
            password: '',
            note: '',
            data: defaultData,
            created_at: new Date().toISOString(),
            registered_at: now.toISOString(),
            last_edited_at: new Date().toISOString(),
            last_edited_by: user.id + '|' + user.email,
        })

        if (insertError) {
            setError(`❌ Lỗi khi tạo subscription: ${insertError.message}`)
            return
        }

        router.push(`/manage/${code}?type=${type}`)
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
                            <div className="space-y-6 text-left justify-items-center max-w-sm mx-auto">
                                {/* Ngày đăng ký */}
                                <div className="space-y-1">
                                    <label htmlFor="reg-date" className="block text-sm font-medium">
                                        Ngày đăng ký
                                    </label>
                                    <DatePicker
                                        id="reg-date"
                                        selected={selectedDate}
                                        onChange={(date: Date | null) => date && setSelectedDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        className="w-full border  rounded px-3 py-2   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Loại đăng ký */}
                                <div className="space-y-1">

                                    <div className="flex items-center gap-6 mt-1">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="month"
                                                checked={type === 'month'}
                                                onChange={() => setType('month')}
                                            />
                                            <span>Đăng ký mỗi tháng</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="year"
                                                checked={type === 'year'}
                                                onChange={() => setType('year')}
                                            />
                                            <span>Đăng ký mỗi năm</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Nút tiếp tục */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleNext}
                                        className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 rounded-full w-14 h-14 text-white shadow-md transition"
                                        title="Tiếp tục"
                                    >
                                        <FaArrowRight />
                                    </button>
                                </div>
                            </div>

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