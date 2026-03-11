const API_URL = "https://ai-code-mentor-api-qm20.onrender.com/api/v1/analyze";

async function analyzeCode() {
    const code = document.getElementById("codeEditor").value;
    const language = document.getElementById("languageSelect").value;
    const analyzeBtn = document.querySelector(".btn-analyze");

    if (!code.trim()) {
        alert("Please enter some code first!");
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing...';
    document.getElementById("logicOutput").innerHTML = "Thinking...";
    document.getElementById("bugsOutput").innerHTML = "Scanning...";

    document.getElementById("btn-download").style.display = "none";

    const requestData = {
        sourceCode: code,
        language: language
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        
        console.log("✅ Data received from Backend:", data);

        updateUI(data);

    } catch (error) {
        console.error("❌ Error:", error);
        alert(`Connection Failed: ${error.message}\nCheck the Console (F12) for details.`);
        document.getElementById("logicOutput").innerHTML = "Error connecting to server.";
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Analyze';
    }
}

function updateUI(data) {
    const logic = data.logicExplanation || "No explanation provided.";
    const bugs = data.bugs || "No bugs found.";
    const optimized = data.optimizedCode || "// No code returned";
    

    try {
        document.getElementById("logicOutput").innerHTML = marked.parse(logic);
        document.getElementById("bugsOutput").innerHTML = marked.parse(bugs);
    } catch (e) {
        console.error("Marked.js Error:", e);
        document.getElementById("logicOutput").innerText = logic; // Fallback to plain text
    }
    
    document.getElementById("timeOutput").innerText = data.timeComplexity || "N/A";
    document.getElementById("spaceOutput").innerText = data.spaceComplexity || "N/A";

    const codeBlock = document.getElementById("optimizedCode");
    codeBlock.textContent = optimized; 

    const language = document.getElementById("languageSelect").value;
    codeBlock.className = `language-${language}`;

    if (window.Prism) {
        Prism.highlightElement(codeBlock);
    }

    document.getElementById("btn-download").style.display = "flex";
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    
    const buttons = document.querySelectorAll('.tab');
    if (tabName === 'logic') buttons[0].classList.add('active');
    if (tabName === 'optimized') buttons[1].classList.add('active');
}

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

function copyToClipboard() {
    const codeText = document.getElementById("optimizedCode").innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        const btn = document.querySelector(".btn-copy");
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
    });
}
