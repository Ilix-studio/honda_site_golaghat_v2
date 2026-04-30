import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

// Redux

import {
  removeNotification,
  selectNotifications,
} from "@/redux-store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

const NotificationSystem = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timers = notifications.map((notification) => {
      return setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 5000);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, dispatch]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case "error":
        return <AlertCircle className='h-5 w-5 text-red-500' />;
      case "warning":
        return <AlertTriangle className='h-5 w-5 text-yellow-500' />;
      case "info":
        return <Info className='h-5 w-5 text-blue-500' />;
      default:
        return <Info className='h-5 w-5 text-blue-500' />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-lg border shadow-lg max-w-sm ${getBackgroundColor(
              notification.type
            )}`}
          >
            <div className='flex items-start space-x-3'>
              {getIcon(notification.type)}
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-900'>
                  {notification.message}
                </p>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => dispatch(removeNotification(notification.id))}
                className='p-1 h-auto'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
