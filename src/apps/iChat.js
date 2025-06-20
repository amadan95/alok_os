import './iChat.css';
import WindowManager from '../WindowManager';

class iChat {
  constructor() {
    this.icon = '/icons/Photoroom-iChat.png';
    this.messages = [
      {
        role: 'system',
        content:
          'You are Alok, a friendly virtual buddy living inside a retro Mac OS X iChat window. Keep responses concise (max 120 words) and conversational. Do not use markdown.'
      }
    ];
  }

  launch() {
    this.win = WindowManager.createWindow({
      title: 'iChat – Alok',
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
      appendMessage('assistant', "Hello! I'm Alok. How can I help you today?");
    }, 1000);

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
      const timeoutId = setTimeout(() => {
        console.log('API request timed out, using fallback response');
        placeholder.textContent = "I'm here! What can I help you with today?";
        this.messages.push({ role: 'assistant', content: "I'm here! What can I help you with today?" });
      }, 5000);

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
            'Cache-Control': 'no-cache'
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
          
          // Show a user-friendly error message
          if (resp.status === 401) {
            placeholder.textContent = 'API key error: You need to set up a valid Hugging Face API key.';
          } else if (resp.status === 500) {
            placeholder.textContent = `I'm having trouble connecting to my brain right now. Let's chat anyway!`;
            console.error('Server error details:', errorData);
          } else if (errorData.details) {
            placeholder.textContent = `Error: ${errorData.details}`;
          } else {
            placeholder.textContent = 'Sorry, I ran into an error. Please try again later.';
          }
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
          placeholder.textContent = 'Sorry, I received an invalid response from the server.';
          return;
        }
        
        if (data && data.content) {
          placeholder.textContent = data.content;
          this.messages.push({ role: 'assistant', content: data.content });
        } else {
          placeholder.textContent = 'Sorry, I received an empty response. Please try again.';
          console.error('Empty response content:', data);
        }
      } catch (err) {
        // Clear the timeout since we got an error
        clearTimeout(timeoutId);
        
        console.error('Error in callApi:', err);
        placeholder.textContent = "I'm having trouble connecting right now, but I'm still here to chat!";
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