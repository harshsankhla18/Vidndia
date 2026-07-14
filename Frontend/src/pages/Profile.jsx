import { useEffect, useState } from "react"

import api from "@/api/axios"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

function Profile() {
  const [user, setUser] = useState(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const fetchUser = async () => {
    try {
      const response = await api.get("/users/current-user")

      const currentUser = response.data?.data

      setUser(currentUser)
      setFullName(currentUser?.fullName || "")
      setEmail(currentUser?.email || "")
    } catch (error) {
      console.log(error.response?.data || error.message)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const updateDetails = async (e) => {
    e.preventDefault()

    try {
      await api.patch("/users/update-account-details", {
        fullName,
        email,
      })

      setMessage("Profile updated successfully")
      await fetchUser()
    } catch (error) {
      setMessage(
        error.response?.data?.message || error.message
      )
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] p-10 text-white">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />

      <main className="ml-60 pt-16">
        <div className="mx-auto max-w-4xl p-6">

          <div className="overflow-hidden rounded-xl bg-[#181818]">
            <div className="h-52 bg-[#272727]">
              {user.coverImage?.url && (
                <img
                  src={user.coverImage.url}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="p-6">
              <img
                src={user.avatar?.url}
                className="-mt-20 h-32 w-32 rounded-full border-4 border-[#181818] object-cover"
              />

              <h1 className="mt-4 text-2xl font-bold">
                {user.fullName}
              </h1>

              <p className="text-[#aaaaaa]">
                @{user.username}
              </p>
            </div>
          </div>

          <form
            onSubmit={updateDetails}
            className="mt-8 space-y-5"
          >
            <h2 className="text-xl font-bold">
              Account details
            </h2>

            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-[#3f3f3f] bg-[#121212] px-4 py-3"
              placeholder="Full name"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#3f3f3f] bg-[#121212] px-4 py-3"
              placeholder="Email"
            />

            {message && (
              <p className="text-sm text-[#aaaaaa]">
                {message}
              </p>
            )}

            <button className="rounded-full bg-white px-6 py-2 font-semibold text-black">
              Save changes
            </button>
          </form>

        </div>
      </main>
    </div>
  )
}

export default Profile