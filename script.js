const typingForm = document.querySelector('.typing-form');
const chatList = document.querySelector('.chat-list');
let userMessage = null;
const APIKey="AIzaSyBZXmZNECCSkUYQhGlLOPMtyqLwfDLTjO0" ;
const APIUrl= `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${APIKey}`;
function createMessageElement(content,...classes){
    const div = document.createElement('div');
    div.classList.add('message',...classes);
    div.innerHTML = content;
    return div ;
}

function showTypingEffect(text, textDiv){
  const words = text.split(' ');
  let i = 0;
  const timer = setInterval(() => {
    textDiv.innerText += (i===0 ? "" : " ")+words[i++];
    if(i === words.length){
        clearInterval(timer);
    }
  },75);
}
 async function generateAPIResponse(incomingDiv){
      const textDiv = incomingDiv.querySelector('.text');
      try{
        const response = await fetch(APIUrl,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents : [{
                role : "user",
                parts : [{text : userMessage}]
              }]
            })
        });
        const data = await response.json();
        const responseText = data?.candidates[0].content.parts[0].text;
        // console.log(responseText);
        showTypingEffect(responseText,textDiv);
        incomingDiv.classList.remove('loading');

      }catch(error){
        console.log(error);
      }
}
function showLoadingAnimation(){
    const html = `<div class="message-content">
                  <img src="images/images/gemini.svg"  class="avatar" alt="">
                  <p class="text"></p>
                 </div>
                 <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                   </div>
                 </div>
                  <span class="icon material-symbols-rounded">content_copy</span>`;
   const incomingDiv =  createMessageElement(html,'incoming', 'loading');
    chatList.appendChild(incomingDiv);
    generateAPIResponse(incomingDiv);
}
function handleOutgoingChat(){
    userMessage = typingForm.querySelector('.typing-input').value.trim();
    if(!userMessage) return;
    const html = ` <div class="message-content">
                   <img src="images/images/user.jpg" class="avatar" alt="">
                   <p class="text">${userMessage}</p>
                </div>`;
   const outgoingDiv =  createMessageElement(html,'outgoing');
    chatList.appendChild(outgoingDiv);
    typingForm.reset();
    setTimeout(() => {
        showLoadingAnimation();
    }, 500);
    
}

typingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleOutgoingChat();

    
});
