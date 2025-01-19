import URL from '../models/urlscheme.js';
import User from '../models/user.js';

 async function topic_url(req, res) {
    const { topic } = req.params;
    console.log(topic);

    try {
        const urls = await URL.find({ topic });
       const total_urls=urls.length;
        let totalClicks = 0;
        let uniqueUser_profile=0;
        const uniqueUser_profileSet=new Set();
        const uniqueUsers=new Set();
        const uniqueIPs = new Set();
        const clicksByDateMap = {};
        const total_users= await User.find();
        total_users.forEach((users)=>{
            uniqueUser_profileSet.add(users.email);
        });
        const urlsAnalytics = urls.map((url) => {
            totalClicks += url.visits;

            for (let i = 0; i < url.analytics.length; i++) {
                uniqueIPs.add(url.analytics[i].ip);
            }

            for (let i = 0; i < url.clicksByDate.length; i++) {
                const { date, clicks } = url.clicksByDate[i];
                const dateString = date.toISOString().split('T')[0];
                clicksByDateMap[dateString] = (clicksByDateMap[dateString] || 0) + clicks;
            }
            return {
                longUrl:url.longUrl,
                shortUrl: url.shortUrl,
                totalClicks: url.visits,
                uniqueUsers: new Set(url.analytics.map(({ ip }) => ip)).size,
            };
        });
        console.log(urlsAnalytics);
         const clicksByDate = Object.entries(clicksByDateMap).map(([date, clicks]) => ({
            date,
            clicks,
        }));
     console.log(topic_url);
        res.json({
            total_urls,
            uniqueUsers:uniqueIPs.size,
            totalClicks,
            clicksByDate,
            urls: urlsAnalytics,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



export default topic_url;