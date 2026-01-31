import { useState } from "react"
import { useNavigate } from "react-router"
import type { FormEvent } from "react"
import { useAuth } from "@/contexts/AuthContext"

export const useLogin = () => {
  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    login(user)
    navigate("/dashboard")
  }

  return {
    user,
    setUser,
    password,
    setPassword,
    handleSubmit,
  }
}