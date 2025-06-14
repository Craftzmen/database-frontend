'use client';
import Link from "next/link";
import { Users, MapPin, Calendar, TrendingUp, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTrips: 0,
    tripOrganizers: 0,
    totalBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, tripsRes, organizersRes, bookingsRes] = await Promise.all([
          fetch('/api/users/'),
          fetch('/api/trips/'),
          fetch('/api/organizers/'),
          fetch('/api/bookings/')
        ]);

        if (!usersRes.ok || !tripsRes.ok || !organizersRes.ok || !bookingsRes.ok) {
          throw new Error('Failed to fetch data from one or more APIs');
        }

        const [users, trips, organizers, bookings] = await Promise.all([
          usersRes.json(),
          tripsRes.json(),
          organizersRes.json(),
          bookingsRes.json()
        ]);

        const now = new Date();
        const activeTrips = Array.isArray(trips) 
          ? trips.filter(trip => {
              if (!trip.EndDate) return true;
              return new Date(trip.EndDate) >= now;
            }).length
          : 0;

        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          activeTrips: activeTrips,
          tripOrganizers: Array.isArray(organizers) ? organizers.length : 0,
          totalBookings: Array.isArray(bookings) ? bookings.length : 0
        });

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: "Users",
      description: "Manage all users in your travel management system. Add, edit, and organize user profiles.",
      href: "/users",
      icon: Users,
      color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
      iconColor: "text-blue-600",
      stats: "Manage travelers",
      count: stats.totalUsers
    },
    {
      title: "Trips",
      description: "Plan and organize trips with destinations, dates, and itineraries for seamless travel experiences.",
      href: "/trips",
      icon: MapPin,
      color: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
      iconColor: "text-green-600",
      stats: "Plan adventures",
      count: stats.activeTrips
    },
    {
      title: "Organizers",
      description: "Coordinate with trip organizers and manage their profiles, contacts, and responsibilities.",
      href: "/organizers",
      icon: Calendar,
      color: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
      iconColor: "text-purple-600",
      stats: "Coordinate events",
      count: stats.tripOrganizers
    }
  ];

  const StatCard = ({ title, value, loading, icon: Icon, color }: any) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 text-center transition-all duration-200 hover:shadow-md ${color}`}>
      <div className="flex items-center justify-center mb-3">
        <div className="p-2 rounded-lg bg-white shadow-sm">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-2"></div>
          <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</div>
          <div className="text-gray-600 text-sm font-medium">{title}</div>
        </>
      )}
    </div>
  );

  const ActionCard = ({ card, loading }: any) => {
    const IconComponent = card.icon;
    return (
      <Link href={card.href} className="group block">
        <div className={`${card.color} rounded-lg border-2 p-6 h-full transition-all duration-200 hover:shadow-lg hover:scale-105 hover:border-opacity-60`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg bg-white ${card.iconColor} shadow-sm`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-black transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500">{card.stats}</p>
              </div>
            </div>
            <div className="text-right">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-6 w-8 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {card.count}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            {card.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
              Get Started →
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <TrendingUp size={12} className="mr-1" />
              <span>{loading ? '...' : `${card.count} total`}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Travaura
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your comprehensive trip management platform. Organize users, plan trips, 
            and coordinate with organizers all in one place.
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-2xl mx-auto">
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            loading={loading}
            icon={Users}
            color="hover:bg-blue-50"
          />
          <StatCard 
            title="Active Trips" 
            value={stats.activeTrips} 
            loading={loading}
            icon={MapPin}
            color="hover:bg-green-50"
          />
          <StatCard 
            title="Trip Organizers" 
            value={stats.tripOrganizers} 
            loading={loading}
            icon={Calendar}
            color="hover:bg-purple-50"
          />
          <StatCard 
            title="Total Bookings" 
            value={stats.totalBookings} 
            loading={loading}
            icon={Activity}
            color="hover:bg-orange-50"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {cards.map((card, index) => (
            <ActionCard key={index} card={card} loading={loading} />
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/users"
              className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
            >
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800 group-hover:text-blue-900">
                Add New User
              </span>
            </Link>
            <Link
              href="/trips"
              className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
            >
              <MapPin className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800 group-hover:text-green-900">
                Plan New Trip
              </span>
            </Link>
            <Link
              href="/organizers"
              className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group"
            >
              <Calendar className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-medium text-purple-800 group-hover:text-purple-900">
                Add Organizer
              </span>
            </Link>
          </div>
        </div>
        {!loading && !error && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}