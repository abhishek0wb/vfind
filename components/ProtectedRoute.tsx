"use client"

import type React from "react"

import { useAuth } from "../lib/authContext"
import { useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"
import { motion } from "framer-motion"

const LoadingSpinner = () => (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-slate-200 bg-opacity-25">
        <div className="relative h-12 w-12">
            <motion.div
                className="absolute inset-0 rounded-full bg-violet-300 opacity-70"
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute inset-2 rounded-full bg-violet-500"
                animate={{ scale: [1, 0.8, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
        </div>
    </div>
)

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth")
        }
    }, [user, loading, router])

    if (loading || !user) {
        return <LoadingSpinner />
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {children}
            </motion.div>
        </Suspense>
    )
}
