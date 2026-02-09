const typingForm = document.querySelector('.typing-form');
const chatList = document.querySelector('.chat-list');
const suggestions = document.querySelectorAll('.suggestion');
const header = document.querySelector('header');
const toggleIcon = document.querySelector('#toggleIcon');
const resetIcon = document.querySelector('#resetIcon');

let userMessage = null;
let isResponseGenerating = false;
const APIKey = CONFIG.GROQ_API_KEY;
const APIUrl = "https://api.groq.com/openai/v1/chat/completions";
const ModelName = "llama-3.3-70b-versatile"; 


let chatHistory = [
    { role: "system", content: "You are a helpful AI assistant. Keep responses concise and friendly." }
];

function loadLocalStorage() {
    const savedChat = localStorage.getItem('chatlist');
    chatList.innerHTML = savedChat || '';
    chatList.scrollTo(0, chatList.scrollHeight);
    if (savedChat) header.classList.add('hide-header');
}
loadLocalStorage();

function createMessageElement(content, ...classes) {
    const div = document.createElement('div');
    div.classList.add('message', ...classes);
    div.innerHTML = content;
    return div;
}

function showTypingEffect(text, textDiv, incomingDiv) {
    const words = text.split(' ');
    let i = 0;
    const timer = setInterval(() => {
        textDiv.innerText += (i === 0 ? "" : " ") + words[i++];
        chatList.scrollTo(0, chatList.scrollHeight);
        if (i === words.length) {
            clearInterval(timer);
            isResponseGenerating = false;
            incomingDiv.querySelector('.icon').classList.remove('hide');
            localStorage.setItem('chatlist', chatList.innerHTML);
        }
    }, 40); // Faster typing for 2026
}

async function generateAPIResponse(incomingDiv) {
    const textDiv = incomingDiv.querySelector('.text');
    
    // Add current user message to memory
    chatHistory.push({ role: "user", content: userMessage });

    try {
        const response = await fetch(APIUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${APIKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: ModelName,
                messages: chatHistory, // Sending the whole conversation for memory
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "API Error");

        const responseText = data.choices[0].message.content;
        
        // Add AI response to memory for the next turn
        chatHistory.push({ role: "assistant", content: responseText });

        // Remove loading state and start typing
        incomingDiv.classList.remove('loading');
        showTypingEffect(responseText, textDiv, incomingDiv);

    } catch (error) {
        isResponseGenerating = false;
        textDiv.innerText = `Error: ${error.message}`;
        incomingDiv.classList.remove('loading');
        console.error("API Error:", error);
    }
}

function showLoadingAnimation() {
    const html = `<div class="message-content">
                  <img src="images/images/gemini.svg" class="avatar" alt="">
                  <p class="text"></p>
                  <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                  </div>
                 </div>
                 <span onclick="copyResponseText(this);" class="icon material-symbols-rounded">content_copy</span>`;
    const incomingDiv = createMessageElement(html, 'incoming', 'loading');
    chatList.appendChild(incomingDiv);
    chatList.scrollTo(0, chatList.scrollHeight);
    generateAPIResponse(incomingDiv);
}

function handleOutgoingChat() {
    userMessage = typingForm.querySelector('.typing-input').value.trim() || userMessage;
    if (!userMessage || isResponseGenerating) return;
    
    isResponseGenerating = true;
    const html = `<div class="message-content">
                    <img src="images/images/user.jpg" class="avatar" alt="">
                    <p class="text">${userMessage}</p>
                  </div>`;
    const outgoingDiv = createMessageElement(html, 'outgoing');
    chatList.appendChild(outgoingDiv);
    typingForm.reset();
    header.classList.add('hide-header');
    chatList.scrollTo(0, chatList.scrollHeight);
    
    setTimeout(showLoadingAnimation, 500);
}

// --- EVENT LISTENERS ---
typingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleOutgoingChat();
});

function copyResponseText(copyElement) {
    const text = copyElement.parentElement.querySelector('.text').textContent;
    navigator.clipboard.writeText(text);
    copyElement.textContent = "done";
    setTimeout(() => copyElement.textContent = "content_copy", 2000);
}

toggleIcon.addEventListener('click', () => {
    const isLightMode = document.body.classList.toggle('light_mode');
    toggleIcon.innerText = isLightMode ? 'dark_mode' : 'light_mode';
});

resetIcon.addEventListener('click', () => {
    if (confirm("Reset conversation?")) {
        localStorage.clear();
        chatHistory = [{ role: "system", content: "You are a helpful AI assistant." }];
        chatList.innerHTML = '';
        window.location.reload();
    }
});

suggestions.forEach(suggestion => {
    suggestion.addEventListener('click', () => {
        userMessage = suggestion.querySelector('.text').innerText;
        handleOutgoingChat();
    });
});
