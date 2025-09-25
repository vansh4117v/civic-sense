import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, MessageCircle, UserPlus, AlertTriangle } from "lucide-react";
import { getRecentActivity } from "../../services/api";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getRecentActivity();
        setActivities(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load recent activities:", error);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="animate-pulse">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4 hover:bg-muted/50">
            <div className="flex items-start">
              <div className={`mt-1 flex-shrink-0 rounded-full p-2 ${activity.color}`}>
                <span className="text-lg">{activity.icon}</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
