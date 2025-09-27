document.addEventListener('DOMContentLoaded', () => {
    const timeLine = document.getElementById('timeline');

    const dayWidth = 100; // 100% of the week divided by 7 days
    const sessionTimes = {
        'sunday': 14, // 2:00 PM
        'market_open': 14, // 2:00 PM (market open)
        'friday_market_close': 14, // 2:00 PM (market close)
        'ny_session': 6 + (30 / 60), // 6:30 AM for New York session
    };

    const labels = {
        'market_open': "Market Open",
        'friday_market_close': "Market Close",
        'ny_session': "NY Session Open"
    };

    const updateTime = () => {
        const now = new Date();
        const currentDay = now.getDay(); // 0-6, Sunday-Saturday
        const currentTime = now.getHours() + now.getMinutes() / 60; // Time in hours (decimal)
        
        // Calculate position of the time line within the table
        const timePercentage = (currentTime / 24) * 100; // As a percentage within the day
        
        // Calculate the position for the moving line
        const position = (currentDay * dayWidth + (timePercentage / 100) * dayWidth);

        // Clear the old line
        const existingLine = document.querySelector('.time-line-line');
        if (existingLine) {
            timeLine.removeChild(existingLine);
        }

        // Create the new line at the updated position
        const line = document.createElement('div');
        line.classList.add('time-line-line');
        line.style.left = `${position}%`;

        timeLine.appendChild(line);

        // Update labels for important events (market open, market close, etc.)
        for (const key in sessionTimes) {
            const dayOfWeek = key === 'market_open' ? 0 : key === 'friday_market_close' ? 5 : key;
            const hour = Math.floor(sessionTimes[key]);
            const minute = (sessionTimes[key] % 1) * 60;

            if (currentDay === dayOfWeek && now.getHours() === hour && now.getMinutes() === minute) {
                const marker = document.createElement('div');
                marker.classList.add('marker');
                marker.style.left = `${(dayOfWeek * dayWidth + ((hour + minute / 60) / 24) * dayWidth)}%`;
                marker.innerHTML = labels[key];
                timeLine.appendChild(marker);
            }
        }
    };

    setInterval(updateTime, 1000); // Update every second
    updateTime(); // Initial call to set the time immediately

});
