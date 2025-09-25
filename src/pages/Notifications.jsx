import React, { useState, useEffect } from 'react';
import { getNotifications } from '../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    // Apply filter
    if (filter === 'high' && notification.type !== 'high') return false;
    if (filter === 'unread' && notification.status !== 'new') return false;
    if (filter === 'resolved' && !notification.category.includes('update')) return false;
    
    // Apply search
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchTermLower) ||
        notification.message.toLowerCase().includes(searchTermLower)
      );
    }
    
    return true;
  });

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, status: 'read' } : n
    ));
  };

  const groupedNotifications = groupByTime(filteredNotifications);

  function groupByTime(notifications) {
    const now = new Date();
    const groups = {
      'New': [],
      'Earlier This Week': [],
      'Last Month': []
    };
    
    notifications.forEach(notification => {
      // In a real app, we would parse the actual time
      if (notification.time.includes('minute') || notification.time.includes('hour')) {
        groups['New'].push(notification);
      } else if (notification.time.includes('Yesterday') || notification.time.includes('Monday') || notification.time.includes('Tuesday')) {
        groups['Earlier This Week'].push(notification);
      } else {
        groups['Last Month'].push(notification);
      }
    });
    
    return groups;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Keep track of all citizen reports and system alerts.
          </p>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search all notifications..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'high' ? 'default' : 'outline'}
              onClick={() => setFilter('high')}
              className="flex items-center"
            >
              <span className="h-2 w-2 bg-destructive rounded-full mr-2"></span>
              High Priority
            </Button>
            <Button 
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
            >
              Unread
            </Button>
            <Button 
              variant={filter === 'resolved' ? 'default' : 'outline'}
              onClick={() => setFilter('resolved')}
            >
              Resolved
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedNotifications).map(([timeGroup, groupNotifications]) => 
            groupNotifications.length > 0 ? (
              <div key={timeGroup}>
                <h2 className="text-lg font-semibold text-foreground mb-4">{timeGroup}</h2>
                <div className="space-y-4">
                  {groupNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`bg-card rounded-xl border border-border p-5 ${
                        notification.status === 'new' ? 'shadow-sm' : 'opacity-75'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {notification.type === 'high' && (
                              <Badge variant="destructive" className="mr-2">High</Badge>
                            )}
                            {notification.type === 'info' && (
                              <Badge variant="outline" className="mr-2">Info</Badge>
                            )}
                            <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          </div>
                          <p className="text-foreground mb-3">{notification.message}</p>
                          <p className="text-sm text-muted-foreground">{notification.time}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            {notification.status === 'new' ? 'Mark as Read' : 'View'}
                          </Button>
                          {notification.category === 'report' && (
                            <Button variant="default" size="sm">
                              View Report
                            </Button>
                          )}
                          {notification.category === 'system' && (
                            <Button variant="default" size="sm">
                              View Incident
                            </Button>
                          )}
                          {notification.category === 'update' && (
                            <Button variant="default" size="sm">
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
          
          {filteredNotifications.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <p className="text-muted-foreground">No notifications found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;