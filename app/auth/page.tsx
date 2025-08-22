"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "../../lib/authContext"
import { useRouter } from "next/navigation"
import { auth, googleProvider } from "../../lib/firebase"
import { signInWithPopup } from "firebase/auth"
import toast from "react-hot-toast"
import { FcGoogle } from "react-icons/fc"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function AuthPage() {
    const { signup, login, user, loading } = useAuth()
    const router = useRouter()

    const [isSignup, setIsSignup] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (user) {
            router.push("/dashboard")
        }
    }, [user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (isSignup) {
                await signup(email, password)
                toast.success("Account created!", {
                    duration: 2000,
                })
            } else {
                await login(email, password)
                toast.success("Logged in!", {
                    duration: 2000,
                })
            }
        } catch (error: any) {
            toast.error(error.message, {
                duration: 2000,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true)
        try {
            await signInWithPopup(auth, googleProvider)
            toast.success("Logged in with Google!", {
                duration: 2000,
            })
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    }

    const stagger = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-violet-50">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                >
                    <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                </motion.div>
            </div>
        )
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 flex flex-col"
        >
            <motion.header
                variants={fadeIn}
                className="w-full max-w-screen-2xl px-8 py-4 mx-auto flex items-center justify-between z-20 backdrop-blur-sm"
            >
                <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <div className="bg-primary rounded-full p-2">
                    </div>
                    <span className="font-bold text-xl">
                        VFind
                    </span>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        size="sm"
                        onClick={() => router.push("/")}
                        className="bg-white text-purple-700 hover:bg-purple-100 border border-purple-200"
                    >
                        Home
                    </Button>
                </motion.div>
            </motion.header>

            <div className="flex-1 flex items-center justify-center px-4 py-10">
                <motion.div variants={fadeIn} className="w-full max-w-md">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-purple-100"
                    >
                        <motion.h2
                            className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-violet-600"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            {isSignup ? "Create Account" : "Welcome Back"}
                        </motion.h2>

                        <motion.form variants={stagger} onSubmit={handleSubmit} className="space-y-5">
                            <motion.div variants={fadeIn}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm transition-all"
                                />
                            </motion.div>

                            <motion.div variants={fadeIn}>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-sm transition-all"
                                />
                            </motion.div>

                            <motion.button
                                variants={fadeIn}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                {isSignup ? "Create Account" : "Sign In"}
                            </motion.button>
                        </motion.form>

                        <motion.div variants={fadeIn} className="mt-6 text-center">
                            <p className="text-gray-600">
                                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                                <motion.button
                                    onClick={() => setIsSignup(!isSignup)}
                                    className="text-purple-600 font-medium hover:underline"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isSignup ? "Sign In" : "Create Account"}
                                </motion.button>
                            </p>
                        </motion.div>

                        <motion.div variants={fadeIn} className="mt-8 flex items-center justify-center">
                            <div className="w-full border-t border-purple-100" />
                            <span className="mx-4 text-gray-500 bg-white/80 px-2">or</span>
                            <div className="w-full border-t border-purple-100" />
                        </motion.div>

                        <motion.button
                            variants={fadeIn}
                            whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleGoogleSignIn}
                            disabled={isSubmitting}
                            className="mt-6 w-full bg-white border border-purple-200 text-gray-700 py-3 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-3 transition-all shadow-sm disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <FcGoogle size={20} />
                                    Continue with Google
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    )
}
