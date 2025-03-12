export const getTimeAgo = (date) => {
    const now = new Date();
    const pastDate = new Date(date);
    const diff = now - pastDate;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
};
  
export const formatDuration = (seconds) => {
    if (!seconds) return "0m 0s";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
};

export const formatFans = (fans) => {
    if (fans < 1000) return fans;
    if (fans < 1000000) return `${(fans / 1000).toFixed(1)}k`;
    return `${(fans / 1000000).toFixed(1)}m`;
};