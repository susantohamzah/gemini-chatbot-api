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
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the element to allow modification
}

function setFormDisabled(isDisabled) {
  input.disabled = isDisabled;
  sendButton.disabled = isDisabled;
  input.placeholder = isDisabled ? 'Gemini is thinking...' : 'Type your message...';
}
