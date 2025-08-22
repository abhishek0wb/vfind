"use client"

import type React from "react"

import { useAuth } from "../../lib/authContext"
import ProtectedRoute from "../../components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { CupSodaIcon, FileStack, HomeIcon as House, LineChart, LogOut, Upload } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GoogleGenAI, Modality } from "@google/genai";


export default function DashboardPage() {
  const [personImage, setPersonImage] = useState<string | null>(null)
  const [clothImage, setClothImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const personInputRef = useRef<HTMLInputElement>(null)
  const clothInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error: any) {
      alert("Logout failed: " + error.message)
      toast.error("Logout failed :" + error.message)
    } finally {
      toast.success("Logged out!", {
        duration: 2000,
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "person" | "cloth") => {
    console.log("handleImageUpload", type)
    const file = e.target.files?.[0]

    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        type === "person" ? setPersonImage(base64) : setClothImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!personImage || !clothImage) {
      toast.error("Please upload both images.")
      return
    }

    setLoading(true)
    console.log("handleGenerate")

    try {
      console.log("sending images to server...")
      const response = await fetch("/api/vton", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personImage, clothImage }),
      })

      const data = await response.json()
      console.log("data from server sucessfully generated")
      console.dir(data)

      if (response.ok) {
        setResultImage(`data:image/jpeg;base64,${data.result.data}`)
        toast.success("Image generated successfully!", {
          duration: 3000,
        })
      } else {
        toast.error("Error: " + data.message)
        console.log("Error:", data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("An error occurred while generating the image.")
      setResultImage(null)
    } finally {
      setLoading(false)
    }
  }

  const triggerFileInput = (type: "person" | "cloth") => {
    if (type === "person" && personInputRef.current) {
      personInputRef.current.click()
    } else if (type === "cloth" && clothInputRef.current) {
      clothInputRef.current.click()
    }
  }

  useEffect(() => {
    const storedImageUrl = localStorage.getItem("vtonInputImage");
    if (storedImageUrl) {
      fetch(storedImageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "vton-image.jpg", { type: blob.type });

          // set image preview
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            setClothImage(base64);
          };
          reader.readAsDataURL(file);

          // set file to input
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          if (personInputRef.current) {
            personInputRef.current.files = dataTransfer.files;
          }

          // clean up required?
          //localStorage.removeItem("vtonInputImage");
        })
        .catch(err => {
          console.error("Failed to fetch image for VTON:", err);
        });
    }
  }, []);


  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-50 to-violet-50">
        <motion.header
          initial={{ y: -40, opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="w-full max-w-screen-2xl px-[8%] py-[1.25%] fixed flex items-center justify-between z-20 bg-transparent bg-[radial-gradient(transparent_1px,rgba(250,245,255,0.6)_1px)] bg-[size:4px_4px] backdrop-blur-[4px] border-b border-purple-100"
        >
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="bg-primary rounded-full p-2">
            </div>
            <span className="font-bold text-xl">
              VFind
            </span>
          </motion.div>

          <div className="flex gap-2 space-mono-regular">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={() => router.push("/")}
                className="bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                <House className="h-4 w-4" />
                <span className="md:inline hidden">Home</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={handleLogout}
                variant="destructive"
                className="bg-violet-600 hover:bg-violet-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="md:inline hidden">Logout</span>
              </Button>
            </motion.div>
          </div>
        </motion.header>

        <main className="pt-24 px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.h1
                className="space-mono-bold text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-violet-800 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Virtual Try-On
              </motion.h1>
              <motion.p
                className="text-purple-700 opacity-80 mb-4 py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Welcome, {user?.email?.split("@")[0].toUpperCase()}
              </motion.p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-xl px-4 py-3 md:p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h2 className="text-lg font-medium text-purple-800 mb-4">Person Image</h2>
                  <input
                    ref={personInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "person")}
                    className="hidden"
                  />
                  <motion.div
                    className={`w-full aspect-square rounded-lg border-2 border-dashed ${personImage ? "border-purple-300" : "border-purple-200"} flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-400 transition-colors`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => triggerFileInput("person")}
                  >
                    {personImage ? (
                      <motion.img
                        src={personImage}
                        alt="Person"
                        className="w-full h-full object-contain"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="mx-auto h-10 w-10 text-purple-300 mb-2" />
                        <p className="text-purple-500">Upload person image</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h2 className="text-lg font-medium text-purple-800 mb-4">Clothing Image</h2>
                  <input
                    ref={clothInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "cloth")}
                    className="hidden"
                  />
                  <motion.div
                    className={`w-full aspect-square rounded-lg border-2 border-dashed ${clothImage ? "border-violet-300" : "border-violet-200"} flex items-center justify-center overflow-hidden cursor-pointer hover:border-violet-400 transition-colors`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => triggerFileInput("cloth")}
                  >
                    {clothImage ? (
                      <motion.img
                        src={clothImage}
                        alt="Cloth"
                        className="w-full h-full object-contain"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="mx-auto h-10 w-10 text-violet-300 mb-2" />
                        <p className="text-violet-500">Upload clothing image</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <motion.div
                  className="rounded-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleGenerate}
                    disabled={loading || !personImage || !clothImage}
                  >
                    {loading ? (
                      <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                        />
                        Generating
                      </motion.div>
                    ) : (
                      <span>Generate</span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {resultImage && (
                <motion.div
                  className="bg-white rounded-xl shadow-xl p-6 md:p-8 overflow-hidden"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                >
                  <motion.h2
                    className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Your Result
                  </motion.h2>
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <motion.img
                      src={resultImage}
                      alt="Result"
                      className="max-w-full max-h-[500px] rounded-lg shadow-md"
                      layoutId="resultImage"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>

        <motion.footer
          className="py-8 text-center bg-gradient-to-bl from-purple-100 to-violet-50 w-full max-w-screen-2xl px-[8%]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.h3 className="text-lg font-medium text-purple-800 mb-2 " whileHover={{ scale: 1.05 }}>
            More cool stuff on the way!
          </motion.h3>
          <motion.p
            className="text-purple-600 mx-auto flex flex-row flex-wrap justify-center gap-8 items-center max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <span className="flex flex-row flex-wrap justify-center items-center gap-1"><LineChart className="h-4 w-4" />Chrome extension</span>
            <span className="flex flex-row flex-wrap justify-center items-center gap-1"><FileStack className="h-4 w-4" />10 similar products instead of 3</span>
            <span className="flex flex-row flex-wrap justify-center items-center gap-1">and more...<CupSodaIcon className="h-4 w-4" /></span>
          </motion.p>
        </motion.footer>
      </div>
    </ProtectedRoute>
  )
}
