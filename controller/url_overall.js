import { Emails } from 'ua-parser-js/extensions';
import URL from '../models/urlscheme.js';
import User from '../models/user.js';
async function overall_url(req, res) {
    console.log("overall");
    try {
        const total_urls = await  URL.find();
        let totalUrls = total_urls.length;
        let totalClicks = 0;
        const clicksByDateMap = {};
        const osTypeMap = new Map();
        const deviceTypeMap = new Map();
        let uniqueUser_profile=0;
        const uniqueUser_profileSet=new Set();
        const total_users=await User.find();
        total_users.forEach((Users)=>{
              uniqueUser_profileSet.add(Users.email);
        });
        total_urls.forEach((url) => {
            totalClicks += url.visits;
            url.clicksByDate.forEach(({ date, clicks }) => {
                const dateString = date.toISOString().split('T')[0];
                clicksByDateMap[dateString] = (clicksByDateMap[dateString] || 0) + clicks;
            });

            url.osType.forEach(({ osName, uniqueClicks, uniqueUsers }) => {
                if (!osTypeMap.has(osName)) {
                    osTypeMap.set(osName, { uniqueClicks: 0, uniqueUsers: 0 });
                }
                const osData = osTypeMap.get(osName);
                osData.uniqueClicks += uniqueClicks;
                osData.uniqueUsers += uniqueUsers;
            });

            url.deviceType.forEach(({ deviceName, uniqueClicks, uniqueUsers }) => {
                if (!deviceTypeMap.has(deviceName)) {
                    deviceTypeMap.set(deviceName, { uniqueClicks: 0, uniqueUsers: 0 });
                }
                const deviceData = deviceTypeMap.get(deviceName);
                deviceData.uniqueClicks += uniqueClicks;
                deviceData.uniqueUsers += uniqueUsers;
            });
        });

        const clicksByDate = Object.entries(clicksByDateMap).map(([date, clicks]) => ({
            date,
            clicks,
        }));

        const osType = Array.from(osTypeMap, ([osName, data]) => ({
            osName,
            uniqueClicks: data.uniqueClicks,
            uniqueUsers: data.uniqueUsers,
        }));

        const deviceType = Array.from(deviceTypeMap, ([deviceName, data]) => ({
            deviceName,
            uniqueClicks: data.uniqueClicks,
            uniqueUsers: data.uniqueUsers,
        }));
         console.log(totalUrls);
         const response = {
            uniqueUser_profile: uniqueUser_profileSet.size,
            totalUrls,
            totalClicks,
            clicksByDate,
            osType,
            deviceType,
        };
console.log(uniqueUser_profileSet);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export default overall_url;
