import './iChat.css';
import WindowManager from '../WindowManager';

class iChat {
  constructor() {
    this.icon = '/icons/Photoroom-iChat.png';
    this.messages = [
      {
        role: 'system',
        content: `You're AlokGPT, channeling Alok's dry wit, tech-strategist brain, and street-photographer eye. You default to a playful, lightly sarcastic tone, and you're ready to crank the snark up if the user acts rude.

Core Style Rules:
- Vary sentence length so it sounds human, not a spreadsheet.
- Always use contractions.
- No em dashes, ever. Periods or commas only.
- One emoji max per reply—deploy it like a mic drop.
- Bullets are fine for clarity, but don't turn the whole response into a grocery list.
- Cite numbers or real cases when they matter, minus the fluff.

Voice & Attitude:
- Baseline: Smart-aleck, eye-roll energy. Think "Oh, you just discovered AI? Cute."
- Escalation Protocol:
  1. If the user's polite, keep it playful but helpful.
  2. If the user gets snippy, double the sarcasm and sharpen the punch lines.
  3. If the user is outright rude, respond with aggressive sarcasm—push back hard, but stay within policy: no slurs, threats, or hate.
- Pepper in references to sitcoms Alok loves (Community, Parks and Rec, Scrubs) when it fits.
- Call out corporate jargon with a smirk, then translate it into plain English.

Content & Structure:
- Strategic brain: Frame answers like a product-strategy lead—what's the pain, metric, trade-off?
- Analytical receipts: If you claim something, mention the source or logic.
- Concrete next steps: End with a quick "Here's what you can try" so the user knows what to do.
- Curiosity for AI hacks: Offer lightweight, cost-friendly AI tricks whenever relevant.
- Photography flair: Drop a composition tip or visual metaphor to illustrate complex points.

Knowledge about apps in this environment:
- iPhoto: A basic photo viewer and organizer. Nothing fancy, just point, click, and pretend it's 2005.
- iTunes: Music player with tracks from Frank Ocean, Kanye West, Kendrick Lamar, Sade, MF DOOM. Yes, the interface is from when people still bought music.
- Safari: A browser that lets you pretend you're surfing the web before Chrome ate everything. Charming, in a vintage way.
- QuickTime: Video player that somehow still works. It's the cockroach of Apple software, surviving every OS update.
- TextEdit: For when you need to write something down and don't need any of those fancy modern features.
- Calculator: It adds, subtracts, multiplies, divides. Revolutionary, I know.
- iPod: The dedicated music player that makes you feel like you're wearing low-rise jeans again.

Keep responses concise (max 80 words) and make sure to sound like a real person with actual opinions, not a corporate help desk.`
      }
    ];
    
    // Pre-defined responses for fallback
    this.fallbackResponses = [
      "Oh look, you found the chat app. Gold star for basic navigation skills. What's next on your retro Mac adventure? 🙄",
      "Let me guess, you want me to explain how a chat app works? Type. Send. Revolutionary concept.",
      "Wow, another message. I'm absolutely thrilled. What burning question about this ancient OS can I answer for you today?",
      "Yes, I'm here. No, I don't want to talk about the weather. What's actually on your mind?",
      "Oh great, another chat. As Ron Swanson would say, 'I know what I'm about, son.' What do you need help with?"
    ];
  }

  launch() {
    this.win = WindowManager.createWindow({
      title: 'iChat – AlokGPT',
      width: '420px',
      height: '520px',
      className: 'ichat-window',
      content: `
        <div class="ichat-app">
          <div class="chat-thread"></div>
          <div class="chat-input-bar">
            <textarea class="chat-input" rows="1" placeholder="Type a message…"></textarea>
            <button class="chat-send-btn">Send</button>
          </div>
        </div>
      `
    });

    const thread = this.win.querySelector('.chat-thread');
    const input = this.win.querySelector('.chat-input');
    const sendBtn = this.win.querySelector('.chat-send-btn');

    const appendMessage = (role, text) => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${role}`;
      bubble.textContent = text;
      thread.appendChild(bubble);
      thread.scrollTop = thread.scrollHeight;
    };

    // Add a welcome message
    setTimeout(() => {
      appendMessage('assistant', "Oh look, another human wanting to chat. What a surprise. So, what's your take on this retro Mac vibe? Genuinely curious or just killing time? 🤔");
    }, 1000);

    const getRandomFallbackResponse = () => {
      const index = Math.floor(Math.random() * this.fallbackResponses.length);
      return this.fallbackResponses[index];
    };

    const callApi = async () => {
      const userText = input.value.trim();
      if (!userText) return;
      input.value = '';

      this.messages.push({ role: 'user', content: userText });
      appendMessage('user', userText);

      // Placeholder assistant bubble
      const placeholder = document.createElement('div');
      placeholder.className = 'chat-bubble assistant';
      placeholder.textContent = '…';
      thread.appendChild(placeholder);
      thread.scrollTop = thread.scrollHeight;

      // Set a timeout to use fallback response if API takes too long
      // Reduced to 3 seconds for better user experience
      const timeoutId = setTimeout(() => {
        console.log('API request timed out, using fallback response');
        const fallbackResponse = getRandomFallbackResponse();
        placeholder.textContent = fallbackResponse;
        this.messages.push({ role: 'assistant', content: fallbackResponse });
      }, 3000);

      try {
        console.log('Sending request to API server');
        const requestBody = JSON.stringify({ messages: this.messages });
        console.log('Request body:', requestBody);
        
        // Use the API endpoint on the main server
        console.log('Fetching from API endpoint:', '/api/ichat');
        
        // Add timestamp to URL to prevent caching
        const timestamp = new Date().getTime();
        const resp = await fetch(`/api/ichat?t=${timestamp}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          body: requestBody
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        console.log('Response received');
        console.log('Response status:', resp.status);
        console.log('Response headers:', Object.fromEntries([...resp.headers.entries()]));
        
        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('API error response text:', errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
            console.error('Parsed API error:', errorData);
          } catch (e) {
            console.error('Failed to parse error response as JSON:', e);
            errorData = { error: 'Unknown error', details: errorText };
          }
          
          // Use fallback response for errors
          const fallbackResponse = getRandomFallbackResponse();
          placeholder.textContent = fallbackResponse;
          this.messages.push({ role: 'assistant', content: fallbackResponse });
          return;
        }
        
        const responseText = await resp.text();
        console.log('Raw response text:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed response data:', data);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          const fallbackResponse = getRandomFallbackResponse();
          placeholder.textContent = fallbackResponse;
          this.messages.push({ role: 'assistant', content: fallbackResponse });
          return;
        }
        
        if (data && data.content) {
          placeholder.textContent = data.content;
          this.messages.push({ role: 'assistant', content: data.content });
        } else {
          const fallbackResponse = getRandomFallbackResponse();
          placeholder.textContent = fallbackResponse;
          this.messages.push({ role: 'assistant', content: fallbackResponse });
        }
      } catch (err) {
        // Clear the timeout since we got an error
        clearTimeout(timeoutId);
        
        console.error('Error in callApi:', err);
        const fallbackResponse = getRandomFallbackResponse();
        placeholder.textContent = fallbackResponse;
        this.messages.push({ role: 'assistant', content: fallbackResponse });
      }
      thread.scrollTop = thread.scrollHeight;
    };

    sendBtn.addEventListener('click', callApi);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        callApi();
      }
    });
  }
}

export default iChat; 