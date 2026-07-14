import { useNavigate } from "react-router-dom"

function VideoCard({ video }) {
  const navigate = useNavigate()

  const handleVideoClick = () => {
    navigate(`/video/${video._id}`)
  }

  return (
    <div
      onClick={handleVideoClick}
      className="group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#272727]">
        <img
          src={video.thumbnail?.url}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />

        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      {/* Video information */}
      <div className="mt-3 flex gap-3">
        <img
          src={video.owner?.avatar?.url}
          alt={video.owner?.username || "Channel"}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#f1f1f1]">
            {video.title}
          </h3>

          <p className="mt-1 truncate text-sm text-[#aaaaaa] hover:text-white">
            {video.owner?.username}
          </p>

          <p className="text-sm text-[#aaaaaa]">
            {formatViews(video.views)} views
          </p>
        </div>
      </div>
    </div>
  )
}

function formatViews(views = 0) {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`
  }

  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`
  }

  return views
}

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`
}

export default VideoCard