'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaMagic, FaSpinner } from 'react-icons/fa'

function generateCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export default function CreatePage() {
    const [code, setCode] = useState('')
    const router = useRouter()
    const createdRef = useRef(false)
    useEffect(() => {
        if (createdRef.current) return
        createdRef.current = true

        const now = new Date()
        const monthKey = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
        const newCode = generateCode()

        const defaultData = {
            name: '',
            createdAt: new Date().toISOString(),
            history: {
                [monthKey]: {
                    amount: 0,
                    members: []
                }
            }
        }

        localStorage.setItem(`subscription:${newCode}`, JSON.stringify(defaultData))
        setCode(newCode)

        setTimeout(() => router.push(`/manage/${newCode}`), 1000)
    }, [])

    return (
        <div className="flex justify-center items-center px-4 min-h-screen text-center">
            <div className="space-y-4">
                <div className="flex justify-center text-blue-600 text-4xl">
                    <FaMagic className="animate-pulse" />
                </div>

                <h2 className="font-bold text-2xl">Đang tạo mã Subscription...</h2>

                {code && (
                    <p className="font-mono text-blue-800 text-2xl tracking-widest">
                        {code}
                    </p>
                )}

                <div className="flex justify-center items-center gap-2 text-gray-500 text-sm">
                    <FaSpinner className="animate-spin" />
                    <span>Bạn sẽ được chuyển hướng trong giây lát...</span>
                </div>
            </div>
        </div>
    )
}
