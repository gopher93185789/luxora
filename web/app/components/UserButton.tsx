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
          className="h-14 w-14 rounded-md"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-primary ring-1 ring-black"
            aria-label="User menu"
          >
            <ul className="p-4 flex flex-col gap-1 ">
            <li className="p-2 bg-primary rounded-md  hover:bg-accent/20" >
            <Link
                        to="/dashboard/profile"
                        className="block text-sm text-accent font-family"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                    >
                        Profile
                    </Link>
                </li>
                <li className="p-2 bg-primary rounded-md  hover:bg-accent/20" >
                    <Link
                        to="/dashboard/listings"
                        className="block text-sm text-accent font-family"
                        role="menuitem"     
                        onClick={() => setIsOpen(false)}
                    >
                        Listings
                    </Link>
                </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
