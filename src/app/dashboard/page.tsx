'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardService } from '@/lib/api'
import { BookOpen, FileText, Users, Calendar } from 'lucide-react'

interface DashboardStats {
  totalCourses: number
  totalStudents: number
  pendingAssignments: number
  todayEvents: number
}

function DashboardContent() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return

      try {
        let data
        if (user.role === 'student') {
          data = await dashboardService.getStudentDashboardData(user.id)
        } else if (user.role === 'teacher') {
          data = await dashboardService.getTeacherDashboardData(user.id)
        } else {
          // Admin dashboard data
          data = {
            totalCourses: 0,
            totalStudents: 0,
            pendingAssignments: 0,
            todayEvents: 0
          }
        }
        setStats(data)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const getStatsCards = () => {
    if (!stats) return []

    if (user?.role === 'student') {
      return [
        {
          title: 'Enrolled Courses',
          value: stats.totalCourses,
          icon: BookOpen,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          title: 'Pending Assignments',
          value: stats.pendingAssignments,
          icon: FileText,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        },
        {
          title: 'Today\'s Events',
          value: stats.todayEvents,
          icon: Calendar,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      ]
    } else {
      return [
        {
          title: 'My Courses',
          value: stats.totalCourses,
          icon: BookOpen,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          title: 'Total Students',
          value: stats.totalStudents,
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        },
        {
          title: 'Assignments Created',
          value: stats.pendingAssignments,
          icon: FileText,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        }
      ]
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your academic activities today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : (
            getStatsCards().map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">
              Recent activity will be displayed here once you start using the platform.
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
