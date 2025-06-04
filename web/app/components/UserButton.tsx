import { useState } from "react"
import { useUserInfo } from "~/hooks/use-user-info"
import { Link } from "@remix-run/react"
import { motion, AnimatePresence } from "framer-motion"

export function UserButton() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleDropdown = () => setIsOpen(prev => !prev)
  const user = useUserInfo()

  return (
    <div className="absolute top-5 right-5 inline-block text-left z-50">
      <button onClick={toggleDropdown} className="focus:outline-none">
        <img
          src={user.user?.profile_image_link || "/images/default-avatar.png"}
          alt="User Profile"
          className="h-14 w-14"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            aria-label="User menu"
          >
            <div className="py-1">
              <Link
                to="/dashboard/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/dashboard/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
