'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaMagic, FaSpinner, FaArrowRight } from 'react-icons/fa'
import { supabase } from '@/app/lib/supabase'
import { customAlphabet, nanoid } from 'nanoid'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { vi } from 'date-fns/locale'
import { format } from 'date-fns'
import { FaCalendarAlt } from 'react-icons/fa'

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
        <div className="flex justify-center items-center px-4 min-h-screen text-center bg-gradient-to-br from-indigo-200/90 via-purple-100/85 to-pink-200/90 dark:from-gray-800 dark:via-gray-900/20 dark:to-black w-full">
            <div className="space-y-6 bg-white/30 dark:bg-zinc-800/30 shadow-2xl backdrop-blur-md p-8 border border-white/30 dark:border-white/20 rounded-2xl w-full max-w-md animate-scale-fade-in">
                <div className="flex justify-center text-blue-600 text-4xl">
                    <FaMagic className="animate-pulse" />
                </div>

                {error ? (
                    <p className="text-red-600 text-lg">{error}</p>
                ) : (
                    <>
                        <p className="font-mono text-blue-800 dark:text-blue-300 text-2xl tracking-widest">
                            {code}
                        </p>
                        <h2 className="font-bold text-2xl text-gray-900 dark:text-white">Một bước nữa</h2>

                        {code && (
                            <div className="space-y-6 text-left justify-items-center max-w-sm mx-auto">
                                {/* Ngày đăng ký */}
                                <div className="space-y-2">
                                    <label htmlFor="reg-date" className="block text-sm font-medium text-gray-900 dark:text-white">
                                        Ngày đăng ký
                                    </label>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                        <DatePicker
                                            value={selectedDate}
                                            onChange={(newValue) => newValue && setSelectedDate(newValue)}
                                            format="dd/MM/yyyy"
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    variant: "outlined",
                                                    InputProps: {
                                                        className: "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200",
                                                        startAdornment: (
                                                            <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2" />
                                                        ),
                                                    },
                                                    sx: {
                                                        '& .MuiOutlinedInput-root': {
                                                            '& fieldset': {
                                                                borderColor: 'rgba(156, 163, 175, 0.2)',
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: 'rgba(156, 163, 175, 0.4)',
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: 'rgb(99, 102, 241)',
                                                            },
                                                        },
                                                    },
                                                },
                                                popper: {
                                                    sx: {
                                                        '& .MuiPaper-root': {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                            backdropFilter: 'blur(8px)',
                                                            borderRadius: '1rem',
                                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                                        },
                                                        '& .MuiPickersDay-root': {
                                                            borderRadius: '0.5rem',
                                                            margin: '0.2rem',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                                            },
                                                            '&.Mui-selected': {
                                                                backgroundColor: 'rgb(99, 102, 241)',
                                                                color: 'white',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgb(79, 70, 229)',
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </div>

                                {/* Loại đăng ký */}
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="relative flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm cursor-pointer hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="month"
                                                checked={type === 'month'}
                                                onChange={(e) => setType(e.target.value as 'month' | 'year')}
                                                className="sr-only"
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                                                type === 'month' 
                                                    ? 'border-indigo-500 bg-indigo-500' 
                                                    : 'border-gray-300 dark:border-gray-600'
                                            }`} />
                                            <span className="ml-3 text-gray-900 dark:text-white">Tháng</span>
                                        </label>

                                        <label className="relative flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm cursor-pointer hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="year"
                                                checked={type === 'year'}
                                                onChange={(e) => setType(e.target.value as 'month' | 'year')}
                                                className="sr-only"
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                                                type === 'year' 
                                                    ? 'border-indigo-500 bg-indigo-500' 
                                                    : 'border-gray-300 dark:border-gray-600'
                                            }`} />
                                            <span className="ml-3 text-gray-900 dark:text-white">Năm</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Nút tiếp tục */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleNext}
                                        className="flex justify-center items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full w-14 h-14 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                        title="Tiếp tục"
                                    >
                                        <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {!code && (
                            <div className="flex justify-center items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
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