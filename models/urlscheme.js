import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    mailId:{type:String},
    longUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
    topic: { type: String },
    createdAt: { type: Date, default: Date.now },
    visits: { type: Number, default: 0 },
    clicksByDate: [
        {
            date: { type: Date, required: true }, 
            clicks: { type: Number, default: 0 }, 
        },
    ],
    osType: [
        {  
            osName: { type: String, required: true }, 
            uniqueClicks: { type: Number, default: 0 },
            uniqueUsers: { type: Number, default: 0 }, 
        },
    ],
    deviceType: [
        {
            deviceName: { type: String, required: true }, 
            uniqueClicks: { type: Number, default: 0 }, 
            uniqueUsers: { type: Number, default: 0 }, 
        },
    ],
    analytics: [
        {
            timestamp: { type: Date, default: Date.now },
            userAgent: { type: String },
            ip: { type: String },
            osName: { type: String },
            deviceType: { type: String },
            location: {
                country: { type: String },
                region: { type: String },
                city: { type: String },
            },
        },
    ],
});

export default mongoose.model('url', urlSchema);
