# 🤖 RAH Tourist Guide AI Chatbot

## Overview

**RAH (Reliable Assistance & Hospitality)** is an intelligent AI-powered chatbot integrated into the RAH Tourist Safety application. It provides expert guidance on Indian tourism, cultural experiences, safety recommendations, and travel planning using **Google's Gemini AI** model.

---

## ✨ Features

### 🎯 Core Capabilities

- **🏛️ Destination Guidance**: Information about Indian monuments, cities, and cultural sites
- **🗺️ Travel Planning**: Itineraries, transportation options, budget estimates
- **🍲 Cultural Insights**: Customs, traditions, local experiences, and cuisine
- **🛡️ Safety Recommendations**: Safety tips, travel advisories, emergency contacts
- **💬 Multilingual Support**: Responds in English, Hindi, and other languages
- **📱 Conversation Memory**: Maintains chat history within a session
- **⚡ Quick Suggestions**: Pre-populated buttons for common tourism queries

### 🌟 Specializations

```
Indian Destinations
├── Taj Mahal & Historical Sites
├── Goa Beaches & Coastal Areas
├── Kerala Backwaters
├── Himalayas & Mountain Regions
├── Rajasthan Heritage
├── Metropolitan Cities
└── Hidden Gems & Local Experiences

Travel Services
├── Transportation (flights, trains, buses)
├── Accommodation (hotels, homestays, resorts)
├── Food & Dining Recommendations
├── Cost & Budget Planning
└── Visa & Documentation

Safety & Health
├── Tourist Safety Guides
├── Emergency Contacts
├── Health Precautions
└── Travel Insurance
```

---

## 🚀 Getting Started

### Installation & Setup

#### 1. **Install Dependencies**
```bash
npm install @google/generative-ai
```

#### 2. **Configure Gemini API Key**

Add your Gemini API key to your environment variables:

**For Local Development (.env.local):**
```env
GEMINI_API_KEY=AIzaSyBU6q7PcYkGgE-rtIcU8dQQEDt6xaXsBV4
```

**For Vercel Deployment:**
1. Go to Vercel Project Settings
2. Navigate to Environment Variables
3. Add: `GEMINI_API_KEY` with your key value
4. Redeploy

#### 3. **Get Your Gemini API Key**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key" or use existing key
3. Copy the API key
4. Add to your environment variables

---

## 📋 API Documentation

### Endpoint: `/api/chatbot/rah-guide`

**Method:** `POST`

**Request Body:**
```json
{
  "message": "Tell me about Taj Mahal",
  "conversationHistory": [
    {
      "role": "user",
      "content": "What are some tourist destinations in India?"
    },
    {
      "role": "assistant",
      "content": "India has wonderful destinations..."
    }
  ]
}
```

**Response:**
```json
{
  "message": "The Taj Mahal is an ivory-white marble mausoleum located in Agra, India...",
  "usage": {
    "promptTokens": 120,
    "completionTokens": 85,
    "totalTokens": 205
  }
}
```

**Error Response:**
```json
{
  "error": "AI service not configured. Please set OPENAI_API_KEY environment variable.",
  "status": 500
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | ✅ Success |
| 400 | ❌ Invalid request (missing message) |
| 401 | ❌ Authentication failed (invalid Gemini API key) |
| 429 | ⏳ Rate limit exceeded |
| 500 | 🔧 Server error or API misconfiguration |
| 503 | 🔌 Gemini service unavailable |

---

## 💻 Component Details

### RAHChatbot Component

**Location:** `/src/components/chatbot/RAHChatbot.tsx`

**Features:**
- Floating chat bubble with notification indicator
- Expandable chat window with message history
- Real-time typing indicator
- Quick suggestion buttons
- Input validation and error handling
- Auto-scroll to latest messages
- Responsive design (works on mobile/tablet)

**Props:** None required (self-contained)

**Example Usage:**
```tsx
import RAHChatbot from '@/components/chatbot/RAHChatbot';

export default function Page() {
  return (
    <div>
      {/* Your page content */}
      <RAHChatbot />
    </div>
  );
}
```

### Integration

The chatbot is automatically included in the app layout at `/src/app/(app)/layout.tsx` and appears on all protected pages:

- ✅ Dashboard
- ✅ Analytics
- ✅ Check-in
- ✅ Digital ID
- ✅ Profile
- ✅ Settings
- ✅ Notifications
- ✅ Report

---

## 🎨 User Interface

### Chat Window Layout

```
┌─────────────────────────────────┐
│ RAH Tourist Guide              │X│  ← Header with close button
├─────────────────────────────────┤
│                                 │
│ Assistant: नमस्ते! Welcome...   │
│                                 │
│                User: Tell me...  │
│                                 │
│ Assistant: The Taj Mahal is...  │  ← Messages area
│                                 │
│ (RAH is typing...)              │
│                                 │
├─────────────────────────────────┤
│ [Ask about Taj Mahal]           │
│ [Best Time] [Cuisine] [Safety]  │  ← Quick suggestions
├─────────────────────────────────┤
│ Ask about Indian tourism...  [→]│  ← Input field
└─────────────────────────────────┘
```

### Chat Bubble Button

- **Location:** Bottom-right corner
- **Appearance:** Animated gradient button with pulse effect
- **Interaction:** Click to open/close chat window
- **Responsive:** Adjusts position on mobile

---

## 🔄 Conversation Flow

### Example Interaction

**User:** "Tell me about Taj Mahal"

**RAH:** 
```
The Taj Mahal is an ivory-white marble mausoleum located in Agra, 
Uttar Pradesh, India. It was built by Mughal Emperor Shah Jahan 
in memory of his beloved wife Mumtaz Mahal.

🏛️ Key Facts:
- Built: 1632-1653 (22 years)
- Location: Agra, 206 km south of Delhi
- UNESCO World Heritage Site
- One of Seven Wonders of the World

🎫 Visit Information:
- Entry Fee: ₹250 (Indian), ₹15 (Children), $15 (Foreign)
- Visiting Hours: 6:00 AM - 7:00 PM (closed Fridays)
- Best Time: October-March (cool weather)
- Duration: 2-3 hours

📍 How to Reach:
- By Air: Amar Singh Airport, Agra
- By Train: Agra Cantonment Railway Station
- By Road: 206 km from Delhi via highway

💡 Pro Tips:
- Visit early morning to avoid crowds
- Hire a local guide for detailed history
- Photography allowed except inside the main chamber
```

---

## 🛡️ Safety & Error Handling

### API Key Security

⚠️ **Important:** 
- ❌ Never commit API keys to git
- ❌ Never expose API keys in client-side code
- ✅ Use environment variables in `.env.local` and `.env`
- ✅ For Vercel, use project secrets/environment variables
- ✅ Rotate API keys periodically for security

### Error Scenarios

1. **Missing API Key**
   - Message: "AI service not configured..."
   - Solution: Add `GEMINI_API_KEY` to environment

2. **Invalid API Key**
   - Message: "Authentication failed..."
   - Solution: Verify key is correct and active in Google AI Studio

3. **Rate Limited**
   - Message: "Rate limit exceeded..."
   - Solution: Free tier has limits, wait or upgrade plan

4. **Network Error**
   - Message: "An error occurred..."
   - Solution: Check internet connection and Gemini service status

5. **Empty Message**
   - Prevented by form validation
   - Send button disabled for empty input

---

## 📊 Token Usage & Costs

### Model Pricing (as of 2024)

**Google Gemini Pro:**
- Input: $0.00025 per 1K tokens (free tier available)
- Output: $0.0005 per 1K tokens (free tier available)
- **Free tier**: 60 requests per minute, unlimited requests per day

### Typical Usage

| Query Type | Avg Input Tokens | Avg Output Tokens | Cost |
|-----------|------------------|------------------|------|
| Simple question | 50 | 80 | $0.00005 |
| Detailed request | 120 | 200 | $0.00008 |
| Multi-turn convo | 250 | 300 | $0.00010 |

**Note:** Gemini offers a generous free tier, making it ideal for many applications.

### Monitoring Costs

- Check usage in [Google AI Studio](https://makersuite.google.com/)
- Gemini provides free tier with request limits
- Set usage quotas to manage API costs
- Free tier is sufficient for most tourism guide queries

---

## 🎓 Quick Start Guide

### For Users

1. **Open Chat**
   - Click the floating message bubble
   - Chat window opens on right side

2. **Ask Questions**
   - Type your question in the input field
   - Press Enter or click send button
   - Wait for RAH to respond

3. **Use Suggestions**
   - Click any quick suggestion button
   - Pre-filled with common queries

4. **View History**
   - All messages visible in chat window
   - Timestamps for each message
   - Auto-scrolls to latest

### For Developers

1. **Integrate into Component**
   ```tsx
   import RAHChatbot from '@/components/chatbot/RAHChatbot';
   
   export default function MyPage() {
     return <RAHChatbot />;
   }
   ```

2. **Customize System Prompt**
   - Edit `/src/app/api/chatbot/rah-guide/route.ts`
   - Modify `systemPrompt` variable
   - Redeploy to apply changes

3. **Add Custom Suggestions**
   - Edit `/src/components/chatbot/RAHChatbot.tsx`
   - Modify the quick suggestion buttons in the form
   - Update button text and onClick handlers

4. **Adjust Model Parameters**
   - Temperature: 0.7 (creativity vs consistency)
   - Max tokens: 500 (response length)
   - Top P: 0.9 (diversity)

---

## 🔧 Troubleshooting

### Chat Window Won't Open

**Problem:** Click button but window doesn't appear

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify layout includes `<RAHChatbot />`
3. Clear browser cache and refresh
4. Check z-index conflicts with other elements

### Messages Not Sending

**Problem:** Send button doesn't work

**Solutions:**
1. Verify internet connection
2. Check OPENAI_API_KEY is set
3. Ensure message is not empty
4. Look for error messages in browser console

### "API not configured" Error

**Problem:** Chat shows error message

**Solutions:**
1. Add `GEMINI_API_KEY` to `.env.local`
2. For Vercel: Add to Environment Variables in project settings
3. Restart dev server or redeploy
4. Verify API key is valid in [Google AI Studio](https://makersuite.google.com/)
5. Ensure API key has access to Gemini models

### Slow Responses

**Problem:** Takes long time to get response

**Solutions:**
1. Check internet connection speed
2. OpenAI API may be under load (try again)
3. Reduce conversation history length
4. Upgrade to faster OpenAI plan if needed

### Character Encoding Issues

**Problem:** Special characters like Hindi text appears garbled

**Solutions:**
1. Ensure UTF-8 encoding in files
2. Check browser supports Unicode
3. Verify API response encoding
4. Update browser to latest version

---

## 📈 Advanced Configuration

### Custom System Prompt

To customize RAH's behavior, edit the `systemPrompt` in `/src/app/api/chatbot/rah-guide/route.ts`:

```typescript
const systemPrompt = `You are RAH, specialized in...
[Customize instructions here]
`;
```

### Different Gemini Models

To use different Gemini models:

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro',  // Change here (gemini-pro, gemini-1.5-pro, etc.)
});
```

**Available Models:**
- `gemini-pro`: Fast, efficient (recommended for real-time chat)
- `gemini-1.5-pro`: More capable (better understanding, longer context)

### Temperature Adjustment

Control response creativity (0.0-2.0):
- **0.0**: Most deterministic, factual
- **1.0**: Balanced (more creative)
- **1.5+**: More creative, varied

**Note:** Gemini temperature is controlled in the system prompt or via request parameters in newer versions.

---

## 📚 File Structure

```
src/
├── components/
│   └── chatbot/
│       └── RAHChatbot.tsx          ← Chat UI component
├── app/
│   ├── (app)/
│   │   └── layout.tsx              ← Chatbot integrated here
│   └── api/
│       └── chatbot/
│           └── rah-guide/
│               └── route.ts         ← API endpoint
└── ...
```

---

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Vercel Auto-deploys**
   - Detects changes in GitHub
   - Rebuilds and deploys automatically

3. **Add Environment Variables**
   - Project Settings → Environment Variables
   - Add `GEMINI_API_KEY`
   - Redeploy

4. **Test Chatbot**
   - Visit deployed site
   - Click chat bubble
   - Send test message

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV GEMINI_API_KEY=${GEMINI_API_KEY}

CMD ["npm", "start"]
```

---

## 📞 Support & FAQs

### FAQ

**Q: Can I use a different AI provider?**
A: Yes, you can integrate Claude, Anthropic, or other APIs by modifying the API route.

**Q: Is conversation history stored?**
A: Currently stored only in the browser session. Add database integration for persistence.

**Q: Can I customize RAH's personality?**
A: Yes, edit the system prompt in the API route to change behavior and tone.

**Q: What happens if API quota is exceeded?**
A: Set usage limits in OpenAI dashboard to prevent over-billing.

**Q: Can I disable the chatbot for certain users?**
A: Add permission checks in the component before rendering.

---

## 🚀 Future Enhancements

- [ ] Conversation persistence (save chat history to Firestore)
- [ ] User feedback system (thumbs up/down for responses)
- [ ] Language detection and auto-translate
- [ ] Integration with live travel data (flights, hotels)
- [ ] Voice input/output support
- [ ] Multi-turn conversation optimization
- [ ] Analytics dashboard for chatbot usage
- [ ] Custom RAH avatar/personality selection

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 16, 2024 | Initial release with OpenAI integration |

---

## ✅ Checklist for Implementation

- [x] Install OpenAI SDK
- [x] Create RAHChatbot component
- [x] Create API endpoint
- [x] Integrate into layout
- [x] Add error handling
- [x] Configure environment variables
- [x] Test locally
- [x] Build passes (14/14 pages)
- [x] Commit to GitHub
- [x] Deploy to Vercel

---

## 📖 Related Documentation

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [RAH Tourist Safety App](./README.md)
- [Settings Quick Start](./QUICK_START_SETTINGS.md)

---

**Last Updated:** November 16, 2024  
**Status:** ✅ Production Ready (Google Gemini Integration)  
**Version:** 2.0

For questions or support, refer to the main README.md documentation or the project GitHub repository.
