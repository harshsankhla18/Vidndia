import {
  Home,
  History,
  ThumbsUp,
  ListVideo,
  LayoutDashboard,
  Upload,
  MessageSquare
} from "lucide-react"

import { useNavigate } from "react-router-dom"

function Sidebar() {
  const navigate = useNavigate()

  const items = [
    {
      name: "Home",
      icon: Home,
      path: "/home"
    },
    {
      name: "Community",
      icon: MessageSquare,
      path: "/community"
    },
    {
      name: "History",
      icon: History,
      path: "/history"
    },
    {
      name: "Liked Videos",
      icon: ThumbsUp,
      path: "/liked"
    },
    {
      name: "Playlists",
      icon: ListVideo,
      path: "/playlists"
    },
    {
      name: "Upload",
      icon: Upload,
      path: "/upload"
    },
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard"
    }
  ]

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-60 bg-[#0f0f0f] px-3 py-3 text-white">
      
      {items.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.name}
            onClick={() => navigate(item.path)}
            className="flex cursor-pointer items-center gap-6 rounded-xl px-4 py-3 hover:bg-[#272727]"
          >
            <Icon size={21} />

            <span className="text-sm">
              {item.name}
            </span>
          </div>
        )
      })}

    </aside>
  )
}

export default Sidebar