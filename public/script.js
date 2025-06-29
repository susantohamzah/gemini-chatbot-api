const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendButton = form.querySelector('button');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  setFormDisabled(true);
  const typingIndicator = appendMessage('bot', '...');
  typingIndicator.id = 'typing-indicator';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();

    // Remove indicator once we have a response (even an error response)
    chatBox.removeChild(typingIndicator);

    if (!response.ok) {
      throw new Error(data.reply || 'An error occurred.');
    }

    appendMessage('bot', data.reply);
  } catch (error) {
    console.error('Error:', error);
    // This catch block handles network errors OR errors thrown from the try block.
    // If the indicator is still present (e.g., network error), remove it.
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      chatBox.removeChild(indicator);
    }
    appendMessage('bot', `Error: ${error.message}`);
  } finally {
    setFormDisabled(false);
  }
});

function appendMessage(sender, text) {
  const messageRow = document.createElement('div');
  messageRow.classList.add('message-row', sender);

  const avatar = document.createElement('img');
  avatar.classList.add('avatar');
  avatar.src = sender === 'user' ? 'https://static.vecteezy.com/system/resources/thumbnails/002/002/403/small/man-with-beard-avatar-character-isolated-icon-free-vector.jpg' : 'https://img.freepik.com/free-vector/head-with-ai-chip_78370-3672.jpg';
  avatar.alt = `${sender} avatar`;

  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message', sender);

  if (sender === 'bot') {
    // Gunakan library 'marked' untuk mengubah Markdown dari respons bot
    // Ini akan merender format seperti bold, list, dll.
    messageBubble.innerHTML = marked.parse(text);
  } else {
    // Untuk pesan pengguna, gunakan textContent agar aman.
    messageBubble.textContent = text;
  }

  messageRow.appendChild(avatar);
  messageRow.appendChild(messageBubble);
  chatBox.appendChild(messageRow);
  chatBox.scrollTop = chatBox.scrollHeight;
  return messageRow; // Kembalikan seluruh baris untuk logika typing indicator
}

function setFormDisabled(isDisabled) {
  input.disabled = isDisabled;
  sendButton.disabled = isDisabled;
  input.placeholder = isDisabled ? 'Gemini is thinking...' : 'Type your message...';
}
