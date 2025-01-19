import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import URL from '../models/urlscheme.js';
import client from '../index.js';
async function redirect_url(req, res) {
    try {
        const { alias } = req.params;
        const urlEntry = await URL.findOne({ shortUrl: alias });
        if (!urlEntry) {
            return res.status(404).json({ error: 'Short URL not found' });
        }
        let cachedLongUrl=null;

     if(client.isReady){ 
         try{  cachedLongUrl = await client.get(alias);   console.log("cache is hit"); } 
        catch(err){console.log("cache mis matched"); }
        }
        else{
            console.log("cache is not ready");
        } 
        urlEntry.visits += 1;
        const userAgent = req.headers['user-agent'] || 'Unknown User Agent'; 
        const uaParser = new UAParser();
        uaParser.setUA(userAgent);
        const osName = uaParser.getOS().name || 'Unknown';
        const deviceType = uaParser.getDevice().type || 'desktop';
        const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || '127.0.0.1';
        const geo = geoip.lookup(ip) || {};
    
        urlEntry.analytics.push({
            timestamp: new Date(),
            ip,
            osName,
            deviceType,
            location: {
                country: geo.country || 'Unknown',
                region: geo.region || 'Unknown',
                city: geo.city || 'Unknown',
            },
        });
        
        const today = new Date().toISOString().split('T')[0];
        console.log(today);
    const existingDate = urlEntry.clicksByDate.find(entry => entry.date.toISOString().split('T')[0] === today);
        console.log(existingDate);

      if (existingDate) {
            existingDate.clicks += 1;
      } else {
            urlEntry.clicksByDate.push({ date: new Date().toISOString().split('T')[0], clicks: 1 });
}
        const osEntry = urlEntry.osType.find(entry => entry.osName === osName);
        if (osEntry) {
            osEntry.uniqueClicks += 1;
            const uniqueIPs = new Set(
                urlEntry.analytics
                    .filter(entry => entry.osName === osName)
                    .map(entry => entry.ip)
            );
            osEntry.uniqueUsers = uniqueIPs.size;
        } else {
            urlEntry.osType.push({ osName, uniqueClicks: 1, uniqueUsers: 1 });
        }
        const deviceEntry = urlEntry.deviceType.find(entry => entry.deviceName === deviceType);
        if (deviceEntry) {
            deviceEntry.uniqueClicks += 1;
            const uniqueIPs = new Set(
                urlEntry.analytics
                    .filter(entry => entry.deviceType === deviceType)
                    .map(entry => entry.ip)
            );
            deviceEntry.uniqueUsers = uniqueIPs.size;
        } else {
            urlEntry.deviceType.push({ deviceName: deviceType, uniqueClicks: 1, uniqueUsers: 1 });
        }
        await urlEntry.save();
        cachedLongUrl=cachedLongUrl||urlEntry.longUrl;
        return res.redirect(cachedLongUrl);
        
    } catch (err) {
        console.error('Error in redirect_url:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
 
export default redirect_url;
