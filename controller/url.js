import { nanoid } from 'nanoid';
import shortid from 'shortid';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import URL from '../models/urlscheme.js';
import client from '../index.js';
const rateLimitStore = {};

async function get_url(req, res) {
    const { longUrl, topic } = req.body;
    console.log(req.body);
    if (!longUrl) return res.status(400).json({ error: "URL not defined" });

    if(!req.user._json.email) return res.status(403).json({ error: "You must be logged in to create a URL" });
    try {
        const userIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const currentTime = Date.now();
        const userRateData = rateLimitStore[userIp] || [];
        const timeWindow = 60 * 1000; 
        const requestLimit = 2;
           console.log(currentTime);
        const recentRequests = userRateData.filter((timestamp) => currentTime - timestamp <= timeWindow);

        if (recentRequests.length >= requestLimit) {
            return res.status(429).json({ error: "Rate limit exceeded. Try again after 1 minute." });
        }

        rateLimitStore[userIp] = [...recentRequests, currentTime];   
        const shortUrl = shortid.generate();
        console.log(shortUrl);   
        const uaParser = new UAParser();
        const UserAgent =  
            req.headers['user-agent'] ||
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36';
        uaParser.setUA(UserAgent);
        const osName = uaParser.getOS().name;
        const deviceType = uaParser.getDevice().type || 'desktop';
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const geo = geoip.lookup(ip) || {};

        const newUrl = await URL.create({
            longUrl: longUrl,
            shortUrl,
            topic,
            createdAt: new Date(),
            mailId:req.user._json.email,    
            analytics: [
                {
                    timestamp: new Date(),
                    ip,
                    osName,
                    deviceType,
                    location: {
                        country: geo.country || 'Unknown',
                        region: geo.region || 'Unknown',
                        city: geo.city || 'Unknown',
                    },
                },
            ],
        });

        await newUrl.save();   if(client.isready){  await client.set(shortUrl, longUrl); }
        console.log(client.get(shortUrl));
        return res.json({ id: shortUrl, message: 'URL created successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default get_url;  
