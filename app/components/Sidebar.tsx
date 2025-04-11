'use client'

import { FaHome, FaSearch, FaPlus, FaHeart, FaUser, FaThumbtack, FaEllipsisH } from 'react-icons/fa'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      icon: <FaHome className="text-xl" />,
      label: 'Trang chủ',
      href: '/',
      active: pathname === '/'
    },
    {
      icon: <FaSearch className="text-xl" />,
      label: 'Tìm kiếm',
      href: '/search',
      active: pathname === '/search'
    },
    {
      icon: <FaPlus className="text-xl" />,
      label: 'Tạo',
      href: '/create',
      active: pathname === '/create'
    },
    {
      icon: <FaHeart className="text-xl" />,
      label: 'Thông báo',
      href: '/notifications',
      active: pathname === '/notifications'
    },
    {
      icon: <FaUser className="text-xl" />,
      label: 'Trang cá nhân',
      href: '/profile',
      active: pathname === '/profile'
    }
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 h-screen w-16  border-r  z-50">
        <div className="flex flex-col h-full w-full">
          <div className="p-2">
            <Link href="/" className="flex items-center justify-center">
              <svg aria-label="Threads" className="w-8 h-8" viewBox="0 0 192 192" fill="currentColor">
                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"></path>
              </svg>
            </Link>
          </div>
          <nav className="flex-1 px-1 py-2">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center w-full py-2 rounded-lg transition-colors duration-200
                      ${item.active 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {item.icon}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-2 space-y-1">
            <button className="flex items-center justify-center w-full py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
              <FaThumbtack className="text-xl" />
            </button>
            <button className="flex items-center justify-center w-full py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
              <FaEllipsisH className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0  border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-around items-center h-16 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center w-full h-full transition-colors duration-200
                ${item.active 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
                }`}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
} 