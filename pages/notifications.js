import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSupabase } from '../lib/supabaseClient'

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const supabase = getSupabase()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (notifData) {
        setNotifications(notifData)
      }
    } catch (err) {
      console.error('Error loading notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const supabase = getSupabase()

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const supabase = getSupabase()

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (notificationId) => {
    if (!confirm('Delete this notification?')) return

    try {
      const supabase = getSupabase()

      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      setNotifications(notifications.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getIcon = (type) => {
    switch(type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '🔔'
    }
  }

  const getColor = (type) => {
    switch(type) {
      case 'success': return 'border-green-500 bg-green-500/10'
      case 'warning': return 'border-yellow-500 bg-yellow-500/10'
      case 'error': return 'border-red-500 bg-red-500/10'
      default: return 'border-blue-500 bg-blue-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-white/70 mt-2">{unreadCount} unread notification{unreadCount !== 1 && 's'}</p>
            )}
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20 flex flex-wrap gap-3">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Mark All as Read
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20">
            <div className="flex flex-wrap gap-3">
              {['all', 'unread', 'success', 'info', 'warning', 'error'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === f
                      ? 'bg-white text-blue-600'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                <div className="text-6xl mb-4">🔔</div>
                <p className="text-xl text-white/70">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border-l-4 ${getColor(notification.type)} ${
                    !notification.is_read ? 'border-white/40' : 'border-white/20'
                  } transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getIcon(notification.type)}</span>
                        <div>
                          <h3 className="font-bold text-lg">{notification.title}</h3>
                          {!notification.is_read && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">NEW</span>
                          )}
                        </div>
                      </div>
                      <p className="text-white/90 ml-12 mb-2">{notification.message}</p>
                      <p className="text-white/50 text-sm ml-12">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Delete
                        </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
