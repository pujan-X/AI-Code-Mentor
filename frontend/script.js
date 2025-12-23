// 1. SETUP: API URL (Use Laptop IP if testing on phone, otherwise localhost)
const API_URL = "https://ai-code-mentor-api-qm20.onrender.com/api/v1/analyze";

// 2. MAIN FUNCTION: Call the Backend
async function analyzeCode() {
    const code = document.getElementById("codeEditor").value;
    const language = document.getElementById("languageSelect").value;
    const analyzeBtn = document.querySelector(".btn-analyze");

    // Basic Validation
    if (!code.trim()) {
        alert("Please enter some code first!");
        return;
    }

    // UI Loading State
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing...';
    document.getElementById("logicOutput").innerHTML = "Thinking...";
    document.getElementById("bugsOutput").innerHTML = "Scanning...";

    // Hide Download Button while loading
    document.getElementById("btn-download").style.display = "none";

    // Prepare Data
    const requestData = {
        sourceCode: code,
        language: language
    };

    try {
        // Send to Backend
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        
        // 🔍 DEBUG: Log the data to see what arrived!
        console.log("✅ Data received from Backend:", data);

        updateUI(data);

    } catch (error) {
        console.error("❌ Error:", error);
        alert(`Connection Failed: ${error.message}\nCheck the Console (F12) for details.`);
        document.getElementById("logicOutput").innerHTML = "Error connecting to server.";
    } finally {
        // Reset Button
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Analyze';
    }
}

// 3. UI UPDATE: Render the Results
function updateUI(data) {
    // Safety Check: If data is missing fields, use empty strings
    const logic = data.logicExplanation || "No explanation provided.";
    const bugs = data.bugs || "No bugs found.";
    const optimized = data.optimizedCode || "// No code returned";
    
    // 1. Render Text (with Marked.js for formatting)
    // We try/catch here so if marked fails, the app doesn't crash
    try {
        document.getElementById("logicOutput").innerHTML = marked.parse(logic);
        document.getElementById("bugsOutput").innerHTML = marked.parse(bugs);
    } catch (e) {
        console.error("Marked.js Error:", e);
        document.getElementById("logicOutput").innerText = logic; // Fallback to plain text
    }
    
    // 2. Update Stats
    document.getElementById("timeOutput").innerText = data.timeComplexity || "N/A";
    document.getElementById("spaceOutput").innerText = data.spaceComplexity || "N/A";

    // 3. Render Code (with Prism.js)
    const codeBlock = document.getElementById("optimizedCode");
    codeBlock.textContent = optimized; 

    // Update class for coloring (e.g., language-java)
    const language = document.getElementById("languageSelect").value;
    codeBlock.className = `language-${language}`;

    // Trigger Syntax Highlighting
    if (window.Prism) {
        Prism.highlightElement(codeBlock);
    }

    // 4. SHOW THE DOWNLOAD BUTTON (Only now, at the end!)
    document.getElementById("btn-download").style.display = "flex";
}

// 4. TAB SWITCHING LOGIC
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Highlight the button
    // (Finds the button that calls this function)
    const buttons = document.querySelectorAll('.tab');
    if (tabName === 'logic') buttons[0].classList.add('active');
    if (tabName === 'optimized') buttons[1].classList.add('active');
}

// 5. DOWNLOAD REPORT LOGIC
function downloadReport() {
    const logic = document.getElementById("logicOutput").innerText;
    const bugs = document.getElementById("bugsOutput").innerText;
    const code = document.getElementById("optimizedCode").innerText;
    const time = document.getElementById("timeOutput").innerText;
    const space = document.getElementById("spaceOutput").innerText;

    const fileContent = `
# 🤖 AI Code Analysis Report

## 💡 Logic Explanation
${logic}

## 🐛 Bugs Found
${bugs}

## ⚡ Complexity
- Time Complexity: ${time}
- Space Complexity: ${space}

## 🚀 Refactored Code
\`\`\`
${code}
\`\`\`
    `.trim();

    const blob = new Blob([fileContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "AI_Analysis_Report.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 6. COPY TO CLIPBOARD
function copyToClipboard() {
    const codeText = document.getElementById("optimizedCode").innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        const btn = document.querySelector(".btn-copy");
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
    });
}