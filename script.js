document.getElementById('profileForm').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const age = parseInt(document.getElementById('age').value);
    const diet = document.getElementById('diet').value.toLowerCase();
    const meal = document.getElementById('meal').value.toLowerCase();
  
    document.getElementById('meals').innerHTML = "<p style='color: #888;'>Loading suggestions...</p>";
    document.getElementById('mealSuggestions').style.display = 'block';
  
    // Determine age group
    let ageGroupDescription = "";
    if (age >= 1 && age <= 5) {
      ageGroupDescription = "a toddler (1-5 years old)";
    } else if (age >= 6 && age <= 12) {
      ageGroupDescription = "a child (6-12 years old)";
    } else if (age >= 13 && age <= 18) {
      ageGroupDescription = "a teenager (13-18 years old)";
    } else if (age >= 19 && age <= 59) {
      ageGroupDescription = "an adult (19-59 years old)";
    } else if (age >= 60) {
      ageGroupDescription = "a senior (60+ years old)";
    } else {
      ageGroupDescription = "an individual";
    }
  
    // Enhanced Prompt
    const prompt = `
  Suggest a healthy ${meal} meal for ${ageGroupDescription} who follows a ${diet} diet.
  Please ensure the meal is age-appropriate:
  - Toddlers: focus on soft textures, mild flavors, small portions, and balanced nutrients.
  - Children: ensure proper growth support, include fruits/veggies, and avoid processed foods.
  - Teenagers: support growth spurts and energy needs with protein and complex carbs.
  - Adults: focus on metabolism, energy, and prevention (e.g., heart health, diabetes).
  - Seniors: offer easy-to-digest, nutrient-dense meals rich in calcium, fiber, and vitamins.
  
  Respond in the following format:
  • Title of meal
  • Ingredients
  • Simple preparation steps
  • Nutrition highlights
  
  Use clear bullet points and short paragraphs for easy reading.`;
  
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/api_keyY", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });
  
      const data = await response.json();
      let suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
  
      // Format AI text response to HTML
      suggestion = suggestion
        .replace(/\*\*(.*?)\*\*/g, "<strong style='color:#2c3e50;'>$1</strong>") // Bold with color
        .replace(/\n- (.*?)(?=\n|$)/g, "<li style='color:#1abc9c; font-size:16px;'>$1</li>") // Bullet points
        .replace(/\n+/g, "<br>") // Paragraph breaks
        .replace(/<li.*?>.*?<\/li>/g, match => `<ul style="margin-left:20px; padding-left:10px;">${match}</ul>`); // Wrap in <ul>
  
      // Show result in styled box
      document.getElementById('meals').innerHTML = `
        <div style="background:#fefefe; border-left: 5px solid #1abc9c; padding:20px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          ${suggestion}
        </div>
      `;
    } catch (error) {
      console.error(error);
      document.getElementById('meals').innerHTML = "<p style='color:#e74c3c;'>Failed to connect to AI. Please try again later.</p>";
    }
  });


//chatbot code

const API_KEY = "Api_key";
const chatWindow = document.getElementById("chatWindow");

window.onload = init;

function init() {
  loadChatHistory();

  document.getElementById("userQuestion").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      askQuestion();
    }
  });
}

async function askQuestion() {
  const input = document.getElementById("userQuestion");
  const question = input.value.trim();

  if (!question) return;

  appendMessage(question, 'user');
  saveMessage(question, 'user');
  input.value = "";

  const typingId = appendTyping();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] }),
    });

    const data = await response.json();

    let answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "😅 Sorry, I couldn't find an answer.";

    // Clean & format the answer
    answer = answer.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                   .replace(/\*/g, "") 
                   .replace(/\n/g, "<br>");

    removeTyping(typingId);
    appendMessage(answer, 'bot');
    saveMessage(answer, 'bot');

  } catch (err) {
    console.error(err);
    removeTyping(typingId);
    appendMessage("<span style='color:red;'>⚠️ Oops! Something went wrong.</span>", 'bot');
  }
}

function appendMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.style.display = "flex";
  messageDiv.style.gap = "8px";
  messageDiv.style.alignItems = "flex-end";
  messageDiv.style.justifyContent = sender === 'user' ? 'flex-end' : 'flex-start';

  const bubble = document.createElement("div");
  bubble.style.maxWidth = "70%";
  bubble.style.padding = "10px 15px";
  bubble.style.borderRadius = "20px";
  bubble.style.background = sender === 'user' ? "#1abc9c" : "#fff";
  bubble.style.color = sender === 'user' ? "#fff" : "#333";
  bubble.style.fontSize = "14px";
  bubble.style.wordBreak = "break-word";
  bubble.style.position = "relative";
  bubble.style.animation = "fadeIn 0.3s ease";

  bubble.innerHTML = message;

  const avatar = document.createElement("div");
  avatar.innerHTML = sender === 'user' ? '🧑' : '🍏';

  messageDiv.appendChild(sender === 'user' ? bubble : avatar);
  messageDiv.appendChild(sender === 'user' ? avatar : bubble);

  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendTyping() {
  const id = `typing-${Date.now()}`;
  const typingDiv = document.createElement("div");
  typingDiv.id = id;
  typingDiv.style.display = "flex";
  typingDiv.style.gap = "8px";
  typingDiv.style.alignItems = "flex-end";
  typingDiv.style.color = "#aaa";

  typingDiv.innerHTML = `
    <div>🤖</div>
    <div>Typing<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>
  `;

  chatWindow.appendChild(typingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return id;
}

function removeTyping(id) {
  const typingDiv = document.getElementById(id);
  if (typingDiv) typingDiv.remove();
}

function saveMessage(message, sender) {
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  history.push({ message, sender });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

function loadChatHistory() {
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  history.forEach(({ message, sender }) => appendMessage(message, sender));
}

function clearChat() {
  if (confirm("Clear all chat?")) {
    localStorage.removeItem("chatHistory");
    chatWindow.innerHTML = `<div style="color:#aaa; text-align:center;">💡 Ask me anything about health & nutrition!</div>`;
  }
}


