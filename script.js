const typingForm = document.querySelector('.typing-form');
const chatList = document.querySelector('.chat-list');
const toggleIcon= document.querySelector('#toggleIcon');
const resetIcon= document.querySelector('#resetIcon');
let userMessage = null;
const APIKey="AIzaSyBZXmZNECCSkUYQhGlLOPMtyqLwfDLTjO0" ;
const APIUrl= `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${APIKey}`;
function loadLocalStorage(){
  const savedChat = localStorage.getItem('chatlist');
  chatList.innerHTML=savedChat ||  '';
  chatList.scrollTo(0,chatList.scrollHeight);

}
loadLocalStorage();
function createMessageElement(content,...classes){
    const div = document.createElement('div');
    div.classList.add('message',...classes);
    div.innerHTML = content;
    return div ;
}

function showTypingEffect(text, textDiv , incomingDiv){
  const words = text.split(' ');
  let i = 0;
  const timer = setInterval(() => {
    textDiv.innerText += (i===0 ? "" : " ")+words[i++];
    chatList.scrollTo(0,chatList.scrollHeight);
    incomingDiv.querySelector('.icon').classList.add('hide');
    if(i === words.length){
        clearInterval(timer);
        incomingDiv.querySelector('.icon').classList.remove('hide');
        localStorage.setItem('chatlist',chatList.innerHTML);
      
       
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
        const responseText = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        // console.log(responseText);
        showTypingEffect(responseText,textDiv, incomingDiv);
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
                  <span onclick="copyResponseText(this);" class="icon material-symbols-rounded">content_copy</span>`;
   const incomingDiv =  createMessageElement(html,'incoming', 'loading');
    chatList.appendChild(incomingDiv);
    chatList.scrollTo(0,chatList.scrollHeight);
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
    chatList.scrollTo(0,chatList.scrollHeight);
    setTimeout(() => {
        showLoadingAnimation();
    }, 500);
    
}

typingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleOutgoingChat();

    
});
 function copyResponseText(copyElement){
    const text = copyElement.parentElement.querySelector('.text').textContent;
    navigator.clipboard.writeText(text);
    copyElement.textContent = "done";
    setTimeout(() => {
        copyElement.textContent = "content_copy";
    }, 2000);
   }

   
function toggleTheme(toggleIcon){
  const  isLightMode = document.body.classList.toggle('light_mode');
   toggleIcon.innerText= isLightMode ? 'dark_mode' : 'light_mode';
} 
 function resetLocalStorage(){
  resetIcon.addEventListener('click', ()=>{
    localStorage.clear();
    chatList.innerHTML= '';
  });
 }
resetLocalStorage();