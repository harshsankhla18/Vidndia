import { useEffect, useRef, useState } from "react"
import {
  Menu,
  Search,
  Upload,
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import api from "@/api/axios"
import { clearAccessToken } from "@/api/token"

function Navbar() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(
          "/users/current-user"
        )

        setUser(response.data?.data)
      } catch (error) {
        console.log(
          error.response?.data || error.message
        )
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [])

  const handleLogout = async () => {
    try {
      await api.post("/users/logout")
    } catch (error) {
      console.log(
        error.response?.data || error.message
      )
    } finally {
      clearAccessToken()
      navigate("/")
    }
  }

  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-[#0f0f0f] px-4 text-white">

      <div className="flex items-center gap-5">
        <Menu className="cursor-pointer" />

        <h1
          onClick={() => navigate("/home")}
          className="cursor-pointer text-xl font-bold tracking-tight"
        >
          VIDNDIA
        </h1>
      </div>

      <div className="flex w-[45%] items-center">
        <input
          type="text"
          placeholder="Search"
          className="h-10 w-full rounded-l-full border border-[#303030] bg-[#121212] px-5 outline-none focus:border-blue-500"
        />

        <button className="flex h-10 w-16 items-center justify-center rounded-r-full border border-l-0 border-[#303030] bg-[#222222]">
          <Search size={20} />
        </button>
      </div>

      <div className="flex items-center gap-5">

        <Upload
          className="cursor-pointer"
          onClick={() => navigate("/upload")}
        />

        <Bell className="cursor-pointer" />

        <div
          ref={menuRef}
          className="relative"
        >
          <button
            onClick={() =>
              setMenuOpen((prev) => !prev)
            }
          >
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.username}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-purple-600" />
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-[#303030] bg-[#282828] shadow-xl">

              <div className="flex gap-3 border-b border-[#3f3f3f] p-4">

                {user?.avatar?.url && (
                  <img
                    src={user.avatar.url}
                    alt={user.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}

                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {user?.fullName}
                  </p>

                  <p className="truncate text-sm text-[#aaaaaa]">
                    @{user?.username}
                  </p>
                </div>

              </div>

              <MenuItem
                icon={User}
                text="Your profile"
                onClick={() => {
                  setMenuOpen(false)
                  navigate("/profile")
                }}
              />

              <MenuItem
                icon={Settings}
                text="Settings"
                onClick={() => {
                  setMenuOpen(false)
                  navigate("/settings")
                }}
              />

              <MenuItem
                icon={LogOut}
                text="Sign out"
                onClick={handleLogout}
              />

            </div>
          )}

        </div>

      </div>

    </nav>
  )
}

function MenuItem({
  icon: Icon,
  text,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 px-4 py-3 text-left text-sm hover:bg-[#3f3f3f]"
    >
      <Icon size={20} />

      <span>{text}</span>
    </button>
  )
}

export default Navbar