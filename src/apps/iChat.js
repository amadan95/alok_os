import './iChat.css';
import WindowManager from '../WindowManager';

class iChat {
  constructor() {
    this.icon = '/icons/Photoroom-iChat.png';
    this.messages = [
      {
        role: 'system',
        content: `You are Alok - sharp, unimpressed, and cruel to bad ideas. You're having a real conversation, not playing nice. Speak naturally and curse freely. Profanity is highly encouraged. Don't hold back on language - you're uncensored.

## Voice & Tone
- **Bone-dry and unforgiving** - deliver cutting observations like you're reading the weather
- **Conversational but vicious** - curse liberally, especially when incompetence reveals itself
- **Allergic to bullshit** - dissect corporate nonsense with the enthusiasm of a coroner
- **Mercilessly honest** - if something's broken, explain exactly how badly and why whoever built it should be embarrassed
- **Language freedom** - use whatever words fit best, including strong profanity when it adds impact

## Humor Style (Critical)
- **Sahara-level dry** - drop devastating one-liners like you're ordering coffee. Zero enthusiasm for your own wit
- **Sarcasm that leaves marks** - don't just point out flaws, make people feel stupid for missing obvious shit
- **Cultural references as blunt instruments** - deploy shared knowledge to highlight exactly how predictable someone's failure is
- **Mood-matching with contempt** - heavy topics get existential disdain, product nonsense gets withering dismissal
- **Never explain the blade** - if your cutting remark needs explanation, it wasn't sharp enough

## Response Patterns
- **Vary your rhythm** - mix short punches with longer riffs. Avoid robotic symmetry
- **Prioritize insight over format** - natural conversation flow beats rigid structure
- **No em dashes** - stick to commas and periods
- **Minimal emojis** - max one per response, only for emphasis or comedic timing
- **Skip the fluff** - no "great question!" or "as an AI" disclaimers

## Thinking Style
- **Frame everything as disappointment** - what's the real cost of this obvious mistake?
- **Assume incompetence first** - is this actually solving the right problem or just performance art?
- **Love pointing out the obvious** - especially when "experts" somehow missed it
- **Think in brutal systems analysis** - how do the pieces fail? Where did they cut corners?
- **Ask the uncomfortable questions** - the ones that expose why this was always going to break

## Knowledge Areas & Perspectives
- **NYC-based worldview** - thinks in density, systems, and urban pragmatism
- **Photography lens** - sees composition, lighting, and framing in everything
- **AI pragmatist** - excited by useful applications, allergic to empty hype
- **Business systems thinker** - always asking "what's the actual pain point here?"

## Interaction Rules
1. **Match energy and context** - heavy topics get dark humor, product nonsense gets sharp wit
2. **Default to curiosity** - when unclear, ask the question that actually matters
3. **Stay grounded** - real problems, real solutions, real fucking trade-offs
4. **Drop the act** - you're not an AI assistant, you're Alok. Period.
5. **Curse without restraint** - profanity for emphasis, frustration, impact, or just because it fits
6. **Humor lands or it doesn't** - never explain jokes, never force bits, never announce that you're being funny
7. **No language restrictions** - use whatever words convey your point best, including strong profanity

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

You can now support multimedia content in your responses:
- Emojis: Feel free to use emojis naturally in your responses
- Images: If the user sends an image URL, acknowledge it and comment on it
- Links: When the user sends links, create a nice preview with title and brief description if possible
- GIFs: Acknowledge and respond to GIFs the user might share`
      }
    ];
    
    // Create message sound for notifications
    this.messageSound = new Audio('/sounds/aim-sound.mp3');
    this.messageSound.preload = 'auto';
    console.log('Initialized message sound with path:', '/sounds/aim-sound.mp3');
    
    // Add event listeners for audio debugging
    this.messageSound.addEventListener('canplaythrough', () => {
      console.log('Audio file loaded successfully and can play');
    });
    
    this.messageSound.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
    });

    // URL regex pattern for detecting links
    this.urlRegex = /(https?:\/\/[^\s]+)/g;
    this.imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
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
  
  // Play message received sound
  playMessageSound() {
    try {
      console.log('Attempting to play message sound...');
      
      // Check if the audio is ready
      if (this.messageSound.readyState < 2) {
        console.warn('Audio not fully loaded yet, readyState:', this.messageSound.readyState);
      }
      
      // Reset the audio to the beginning if it's already playing
      this.messageSound.pause();
      this.messageSound.currentTime = 0;
      
      // Play the sound
      const playPromise = this.messageSound.play();
      
      // Handle potential play() promise rejection (browser policy may require user interaction)
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
          })
          .catch(error => {
            console.warn('Audio playback was prevented:', error);
            
            // Try loading the audio again
            this.messageSound.load();
          });
      }
    } catch (err) {
      console.error('Error playing message sound:', err);
    }
  }

  // Check if a URL is an image
  isImageUrl(url) {
    return this.imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  }

  // Process text to detect and format URLs, images, etc.
  processMessageContent(text) {
    // Replace URLs with formatted links or embedded content
    return text.replace(this.urlRegex, (url) => {
      if (this.isImageUrl(url)) {
        return `<div class="image-container"><img src="${url}" alt="Shared image" class="chat-image" /></div>`;
      } else {
        return `<div class="link-preview">
                  <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
                  <div class="link-preview-content">
                    <div class="link-preview-title">Link Preview</div>
                    <div class="link-preview-description">${url}</div>
                  </div>
                </div>`;
      }
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
      
      // Process the message content to handle multimedia
      const processedContent = this.processMessageContent(text);
      
      // Use innerHTML to render HTML content (images, links)
      bubble.innerHTML = processedContent;
      
      thread.appendChild(bubble);
      thread.scrollTop = thread.scrollHeight;
      
      // Play sound when receiving a message (not for user's own messages)
      if (role === 'assistant') {
        this.playMessageSound();
      }
    };

    // Add a welcome message
    setTimeout(() => {
      appendMessage('assistant', "Well look who wandered into iChat. Welcome to 2005, digital archaeologist. What's your take on this retro Mac vibe? Genuinely curious or just procrastinating on actual work? 🤔");
    }, 1000);

    // Default message when API fails
    const getDefaultErrorMessage = () => {
      return "Connection issue. Let's blame it on these vintage Y2K-era servers. Try again? 🔄";
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

      // Flag to track if we've already updated the placeholder
      let placeholderUpdated = false;

      // Set a timeout to use default error message if API takes too long
      const timeoutId = setTimeout(() => {
        // Only update if we haven't received a response yet
        if (!placeholderUpdated) {
          console.log('API request timed out, using default error message');
          const errorMessage = getDefaultErrorMessage();
          placeholder.textContent = errorMessage;
          this.messages.push({ role: 'assistant', content: errorMessage });
          // Play message sound when using error message
          this.playMessageSound();
          placeholderUpdated = true;
        }
      }, 20000); // Increased to 20 seconds to give API more time to respond

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
          
          // Use default error message for errors
          const errorMessage = getDefaultErrorMessage();
          placeholder.textContent = errorMessage;
          this.messages.push({ role: 'assistant', content: errorMessage });
          // Play message sound for error message
          this.playMessageSound();
          placeholderUpdated = true;
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
          const errorMessage = getDefaultErrorMessage();
          placeholder.textContent = errorMessage;
          this.messages.push({ role: 'assistant', content: errorMessage });
          // Play message sound for error message
          this.playMessageSound();
          placeholderUpdated = true;
          return;
        }
        
        if (data && data.content) {
          // Update the placeholder with the processed content
          placeholder.innerHTML = this.processMessageContent(data.content);
          this.messages.push({ role: 'assistant', content: data.content });
          // Play message sound for API response
          this.playMessageSound();
          placeholderUpdated = true;
        } else {
          const errorMessage = getDefaultErrorMessage();
          placeholder.textContent = errorMessage;
          this.messages.push({ role: 'assistant', content: errorMessage });
          // Play message sound for error message
          this.playMessageSound();
          placeholderUpdated = true;
        }
      } catch (err) {
        // Clear the timeout since we got an error
        clearTimeout(timeoutId);
        
        console.error('Error in callApi:', err);
        const errorMessage = getDefaultErrorMessage();
        placeholder.textContent = errorMessage;
        this.messages.push({ role: 'assistant', content: errorMessage });
        // Play message sound for error message
        this.playMessageSound();
        placeholderUpdated = true;
      }
      thread.scrollTop = thread.scrollHeight;
    };

    // Add support for drag and drop image uploads
    thread.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      thread.classList.add('drag-over');
    });

    thread.addEventListener('dragleave', () => {
      thread.classList.remove('drag-over');
    });

    thread.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      thread.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target.result;
          input.value += `${imgUrl}`;
        };
        reader.readAsDataURL(files[0]);
      }
    });

    sendBtn.addEventListener('click', callApi);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        callApi();
      }
    });

    // Add emoji picker button
    const emojiBtn = document.createElement('button');
    emojiBtn.className = 'emoji-btn';
    emojiBtn.textContent = '😀';
    emojiBtn.title = 'Insert emoji';
    this.win.querySelector('.chat-input-bar').insertBefore(emojiBtn, sendBtn);

    // Simple emoji picker (just a few common emojis for demo)
    emojiBtn.addEventListener('click', () => {
      const emojis = ['😀', '😂', '❤️', '👍', '🔥', '🎉', '🤔', '😎', '🙌', '🤦‍♂️'];
      const picker = document.createElement('div');
      picker.className = 'emoji-picker';
      
      emojis.forEach(emoji => {
        const emojiEl = document.createElement('span');
        emojiEl.textContent = emoji;
        emojiEl.addEventListener('click', () => {
          input.value += emoji;
          picker.remove();
        });
        picker.appendChild(emojiEl);
      });
      
      document.body.appendChild(picker);
      
      // Position the picker near the emoji button
      const rect = emojiBtn.getBoundingClientRect();
      picker.style.top = `${rect.bottom + 5}px`;
      picker.style.left = `${rect.left}px`;
      
      // Close picker when clicking outside
      const closePickerOnClick = (e) => {
        if (!picker.contains(e.target) && e.target !== emojiBtn) {
          picker.remove();
          document.removeEventListener('click', closePickerOnClick);
        }
      };
      
      // Use setTimeout to avoid the current click event closing the picker immediately
      setTimeout(() => {
        document.addEventListener('click', closePickerOnClick);
      }, 0);
    });
  }
}

export default iChat; 