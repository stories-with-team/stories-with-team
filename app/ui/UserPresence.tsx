'use client'

import React from 'react'
import { UserSession } from '@/lib/collaboration'
import { tv } from 'tailwind-variants'

type Props = {
  currentUser: UserSession | null
  activeUsers: Map<string, UserSession>
}

const container = tv({
  base: 'fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50',
})

const header = tv({
  base: 'font-bold text-sm mb-3 text-gray-700',
})

const userList = tv({
  base: 'space-y-2',
})

const userItem = tv({
  base: 'flex items-center gap-2 text-sm',
})

const userColorBadge = tv({
  base: 'w-3 h-3 rounded-full',
})

const userLabel = tv({
  base: 'text-gray-700',
})

const youLabel = tv({
  base: 'text-xs text-gray-500 ml-1',
})

function UserPresence({ currentUser, activeUsers }: Props) {
  const totalUsers = (currentUser ? 1 : 0) + activeUsers.size

  return (
    <div className={container()}>
      <div className={header()}>
        Editing Together ({totalUsers})
      </div>
      <div className={userList()}>
        {currentUser && (
          <div className={userItem()}>
            <div
              className={userColorBadge()}
              style={{ backgroundColor: currentUser.color }}
            />
            <span className={userLabel()}>
              {currentUser.displayName}
              <span className={youLabel()}>(you)</span>
            </span>
          </div>
        )}
        {Array.from(activeUsers.values()).map((user) => (
          <div key={user.userId} className={userItem()}>
            <div
              className={userColorBadge()}
              style={{ backgroundColor: user.color }}
            />
            <span className={userLabel()}>{user.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserPresence
