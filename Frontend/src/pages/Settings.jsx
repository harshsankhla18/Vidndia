import { useState } from "react"

import api from "@/api/axios"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

function Settings() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)

  const [message, setMessage] = useState("")

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    try {
      const response = await api.patch(
        "/users/change-password",
        {
          oldPassword,
          newPassword,
        }
      )

      setMessage(response.data.message)

      setOldPassword("")
      setNewPassword("")
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.message
      )
    }
  }

  const handleAvatarUpdate = async (e) => {
    e.preventDefault()

    if (!avatar) return

    const formData = new FormData()

    formData.append("avatar", avatar)

    try {
      const response = await api.patch(
        "/users/update-avatar",
        formData
      )

      setMessage(response.data.message)
      setAvatar(null)
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.message
      )
    }
  }

  const handleCoverUpdate = async (e) => {
    e.preventDefault()

    if (!coverImage) return

    const formData = new FormData()

    formData.append("coverImage", coverImage)

    try {
      const response = await api.patch(
        "/users/update-coverImage",
        formData
      )

      setMessage(response.data.message)
      setCoverImage(null)
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.message
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />

      <main className="ml-60 pt-16">
        <div className="mx-auto max-w-3xl p-8">

          <h1 className="text-2xl font-bold">
            Settings
          </h1>

          {message && (
            <p className="mt-4 text-sm text-[#aaaaaa]">
              {message}
            </p>
          )}

          <section className="mt-8 rounded-xl bg-[#181818] p-6">
            <h2 className="text-lg font-semibold">
              Change password
            </h2>

            <form
              onSubmit={handlePasswordChange}
              className="mt-5 space-y-4"
            >
              <input
                type="password"
                placeholder="Current password"
                value={oldPassword}
                onChange={(e) =>
                  setOldPassword(e.target.value)
                }
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#121212] p-3"
              />

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                className="w-full rounded-lg border border-[#3f3f3f] bg-[#121212] p-3"
              />

              <button className="rounded-full bg-white px-5 py-2 font-semibold text-black">
                Change password
              </button>
            </form>
          </section>

          <section className="mt-6 rounded-xl bg-[#181818] p-6">
            <h2 className="text-lg font-semibold">
              Update avatar
            </h2>

            <form
              onSubmit={handleAvatarUpdate}
              className="mt-5 space-y-4"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setAvatar(e.target.files[0])
                }
              />

              <button className="rounded-full bg-white px-5 py-2 font-semibold text-black">
                Update avatar
              </button>
            </form>
          </section>

          <section className="mt-6 rounded-xl bg-[#181818] p-6">
            <h2 className="text-lg font-semibold">
              Update cover image
            </h2>

            <form
              onSubmit={handleCoverUpdate}
              className="mt-5 space-y-4"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCoverImage(e.target.files[0])
                }
              />

              <button className="rounded-full bg-white px-5 py-2 font-semibold text-black">
                Update cover
              </button>
            </form>
          </section>

        </div>
      </main>
    </div>
  )
}

export default Settings