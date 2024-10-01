'use client'

import { useContext } from "react"
import { AuthContext } from "../../contexts/auth.context"

export default function DashboardGreeting() {
 const { user } = useContext(AuthContext)
 return <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome back, {user.firstName} {user.lastName ? user.lastName : null}</h2>
}