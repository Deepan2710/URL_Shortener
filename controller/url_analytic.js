import URL from '../models/urlscheme.js';


async function url_Analytics(req, res) {
    const { alias } = req.params;

    try {
        const urlDoc = await URL.findOne({ shortUrl: alias });

        if (!urlDoc) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        const totalClicks = urlDoc.visits;
        const uniqueUsers = new Set(urlDoc.analytics.map((entry) => entry.ip)).size;

        const clicksByDate = urlDoc.clicksByDate.map(({ date, clicks }) => ({
            date: date.toISOString().split('T')[0],
            clicks,
        }));

        const osType = urlDoc.osType.map(({ osName, uniqueClicks }) => ({
            osName,
            uniqueClicks,
        }));

        const deviceType = urlDoc.deviceType.map(({ deviceName, uniqueClicks, uniqueUsers }) => ({
            deviceName,
            uniqueClicks,
            uniqueUsers,
        }));

        res.json({
            totalClicks,
            uniqueUsers,
            clicksByDate,
            osType,
            deviceType,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export  default url_Analytics ;  
