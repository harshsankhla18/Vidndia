import { Routes, Route } from "react-router-dom"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"

function App() {
  return (
    <div className="dark">
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-4xl">
          <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<SignupForm />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App