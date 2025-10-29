export const formatTimeRemaining = (endTimeString) => {
    const endTime = new Date(endTimeString).getTime();
    const now = new Date().getTime();
    const difference = endTime - now; // in milliseconds

    if (difference <= 0) {
        return "Ended";
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    if (days > 1) {
        return `Ends in ${days} days`;
    }
    if (days === 1) {
        return `Ends in 1 day`;
    }

    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (hours > 1) {
        return `Ends in ${hours} hours`;
    }
    if (hours === 1) {
        return `Ends in 1 hour`;
    }

    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    if (minutes > 1) {
        return `Ends in ${minutes} mins`;
    }

    return "Ending soon";
};

export const formatBidTimestamp = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};