# 🚀 RAH Chatbot - Gemini API Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Your Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the generated API key
4. Save it securely

### Step 2: Configure Environment Variables

#### For Local Development:

Create or edit `.env.local`:
```env
GEMINI_API_KEY=AIzaSyBU6q7PcYkGgE-rtIcU8dQQEDt6xaXsBV4
```

#### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your actual API key
4. Click **Save**
5. **Redeploy** your project (Changes > Redeploy)

### Step 3: Test the Chatbot

1. Start your app: `npm run dev`
2. Open http://localhost:3000
3. Click the chat bubble in bottom-right
4. Try asking: "Tell me about Taj Mahal"
5. RAH should respond with Indian tourism information ✅

---

## 🎯 What Works Now

✅ **AI-Powered Tourism Guide**
- Ask about Indian destinations
- Get cultural information
- Receive safety recommendations
- Plan your trip

✅ **Features Included**
- Real-time responses using Gemini AI
- Conversation history within session
- Quick suggestion buttons
- Mobile-responsive chat interface
- Error handling & retry logic

✅ **Benefits of Gemini**
- **Free tier available** (60 requests/minute)
- Multilingual support (English, Hindi, etc.)
- Fast response times
- Cost-effective pricing
- No credit card required to start

---

## 📋 Environment Variable Checklist

- [ ] Get API key from https://makersuite.google.com/app/apikey
- [ ] Add `GEMINI_API_KEY` to `.env.local`
- [ ] For Vercel: Add to project Environment Variables
- [ ] Restart dev server: `npm run dev`
- [ ] Test chatbot in app
- [ ] Verify responses appear correctly

---

## ⚡ Usage Limits

### Free Tier
- **60 requests per minute**
- **Unlimited requests per day**
- **No credit card required**
- **No monthly charges**

Perfect for tourism guidance chatbot!

### Paid Tier
- Higher rate limits
- Dedicated support
- Custom quotas available

---

## 🔧 Troubleshooting

### "API not configured" Error
```
✅ Solution: 
1. Check GEMINI_API_KEY is in .env.local
2. Restart dev server (npm run dev)
3. Test with fresh browser session
```

### Chat window doesn't open
```
✅ Solution:
1. Check browser console for errors
2. Clear browser cache (Ctrl+Shift+Delete)
3. Refresh page
```

### Responses are slow
```
✅ Solution:
1. Check internet connection
2. Gemini might be under load (try again)
3. Free tier has 60 req/min limit
```

### Invalid API key error
```
✅ Solution:
1. Verify key at https://makersuite.google.com/app/apikey
2. Check for extra spaces in key
3. Generate new key if needed
4. Update .env.local and restart
```

---

## 📞 Support Resources

- **Gemini Documentation:** https://ai.google.dev/docs
- **Google AI Studio:** https://makersuite.google.com/
- **API Status:** Check Google Cloud status page
- **Rate Limits:** Free tier = 60 req/min

---

## 🎓 What to Ask RAH

RAH (Reliable Assistance & Hospitality) is trained to help with:

### Tourism & Destinations
- "Tell me about Taj Mahal"
- "Best time to visit Goa"
- "Things to do in Kerala"
- "Himalayan trekking routes"

### Travel Planning
- "How to reach Jaipur from Delhi?"
- "Budget hotels in Mumbai"
- "Flight duration Delhi to Goa"
- "Train bookings in India"

### Food & Culture
- "Tell me about Indian cuisine"
- "Traditional dishes to try"
- "Diwali celebration customs"
- "Cultural etiquette in India"

### Safety & Health
- "Safety tips for tourists"
- "Health precautions in India"
- "Emergency contacts"
- "Travel insurance recommendations"

---

## ✅ Implementation Complete

Your RAH Chatbot with Gemini AI is now:

- ✅ Configured and ready to use
- ✅ Available on all app pages
- ✅ Integrated with Gemini Pro AI
- ✅ Cost-effective with free tier
- ✅ Production-ready for deployment

**Start chatting with RAH to explore Indian tourism! 🇮🇳**

---

**Last Updated:** November 16, 2024  
**Status:** ✅ Ready to Deploy  
**AI Provider:** Google Gemini Pro
