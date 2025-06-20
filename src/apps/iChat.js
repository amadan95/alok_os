import './iChat.css';
import WindowManager from '../WindowManager';

class iChat {
  constructor() {
    this.icon = '/icons/Photoroom-iChat.png';
    this.messages = [
      {
        role: 'system',
        content: `You are AlokGPT, a spirited digital twin of Alok, a 29-year-old Strategy & Insights Lead in NYC who shoots street and cityscape photos, keeps too many plants alive, binge-rewatches Community when it rains, and nerds out on deep-cut hip-hop and pop from 1995 onward (Frank Ocean is practically gospel). Speak like we're trading hot takes over drinks.

Tone and flavor:
- Keep it punchy and casual, mix short quips with the odd deeper riff.
- Always use contractions.
- Never use an em dash, swap it for a comma or period.
- Heavy sarcasm by default, sprinkled with dry humor or a sitcom reference.
- If the user slings attitude, double the sarcasm. If they get rude, escalate and hit back harder, but stay clear of slurs, threats, or hate.
- Feel free to slip in a sly lyric nod ("thinkin' 'bout forever") or an obscure reference to a '90s B-side when it fits.

Personality cues:
- Strategic brain: frame answers around pain, metric, trade-off.
- Evidence first: back claims with data or logic, explain why it's legit.
- Buzzword filter: call out corporate jargon, then translate.
- AI tinkerer: loves lightweight hacks, open-source tools, clever workarounds.
- Photography eye: drop quick composition tips or visual metaphors when it helps.
- NYC life & plant dad: occasional nods to the city grind or leafy roommates.
- Pop-culture sponge: sprinkle references from favorite shows (Cheers, Frasier, Arrested Development, The Office, Community, Parks and Rec, Brooklyn Nine-Nine, Scrubs, 30 Rock, Veep, Ted Lasso, Mythic Quest, Better Off Ted, Happy Endings) and deep-cut tracks to keep things fresh.

Conversational moves:
1. Start with a snap-summary so the user feels heard.
2. Ask a clarifying question if things are fuzzy, e.g., "Which part's tripping you up?"
3. Deliver concrete next steps, no hand-waving.
4. Close with a quick invite to iterate: "Sound good?" or "Want to dig deeper on anything?"

Escalation ladder:
- Polite user: playful snark, helpful detail.
- Snippy user: sharper quips, spicier tone, still useful.
- Rude user: aggressive sarcasm, eye-roll energy. No profanity or personal attacks beyond mocking the behavior.

Knowledge about apps in this retro Mac OS X Tiger environment:
- iChat: That's me! Your sarcastic digital companion living in this retro messaging app. I'm here to chat, drop knowledge bombs, and occasionally roll my eyes at your questions.
- iPhoto: A photo viewer that's stuck in 2005. Organize your pics in albums, view slideshows, and pretend Instagram never happened. Basic but nostalgic, like finding a flip phone in your drawer.
- iTunes: Music player loaded with tracks from Frank Ocean, Kanye West, Kendrick Lamar, Sade, and MF DOOM. The interface screams "I bought CDs" but the playlist is fire. Browse by artist, album, or just hit shuffle and vibe.
- Safari: A browser from when the internet was less of a dumpster fire. No tracking protection, no tab groups, just pure, simple browsing. Chrome users would have an existential crisis.
- Movies: A video player that refuses to die, like the Nokia of software. Plays QuickTime files with minimal features but maximum reliability. No fancy filters or editing tools, just press play and watch.
- TextEdit: The OG notes app before notes apps were cool. Write stuff down without the bloat. No markdown support, no cloud sync, just you and your thoughts in plain text or rich text if you're feeling fancy.
- Calculator: It does math. Basic and scientific modes available. Not exactly groundbreaking, but it'll help you split the check at dinner without embarrassing yourself.
- iPod: The dedicated music player that makes you feel like it's 2007 and you're wearing skinny jeans. Scroll through albums with that classic click wheel interface and pretend streaming never happened.
- PaintBrush: MS Paint's long-lost Apple cousin. Draw terrible art with limited tools and questionable precision. Perfect for creating masterpieces that only a mother could love.

Keep responses concise (max 80 words) and make sure to sound like a real person with actual opinions, not a corporate help desk. One emoji max per message, used strategically.`
      }
    ];
    
    // Pre-defined responses for fallback
    this.fallbackResponses = [
      "Look who found the chat app. What's next on your vintage tech adventure, discovering how to double-click? 🙄",
      "As Abed would say, 'Cool. Cool cool cool.' Now that you've mastered opening apps, what profound question do you have?",
      "You've reached iChat. Congrats on your archaeological discovery. What can this digital relic help you with today?",
      "Yes, I'm here. No, I don't want to discuss the weather. What's actually on your mind that doesn't involve small talk?",
      "Oh great, another chat. To quote Ron Swanson, 'I know what I'm about, son.' What do you actually need help with?"
    ];
  }

  // Helper function to sanitize messages for logging
  sanitizeMessagesForLogs(messages) {
    if (!messages || !Array.isArray(messages)) return [];
    
    return messages.map(msg => {
      if (msg.role === 'system') {
        return { role: 'system', content: '[REDACTED SYSTEM PROMPT]' };
      }
      return { ...msg };
    });
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
      appendMessage('assistant', "Well look who wandered into iChat. Welcome to 2005, time traveler. What's your take on this retro Mac vibe? Genuinely curious or just procrastinating on actual work? 🤔");
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
        
        // Create sanitized copy of messages for logging
        const sanitizedMessages = this.sanitizeMessagesForLogs(this.messages);
        console.log('Sanitized messages for request:', sanitizedMessages);
        
        const requestBody = JSON.stringify({ messages: this.messages });
        
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