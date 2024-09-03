let generatedActivity = "";
let currentActivity = "";

// Add this function at the beginning of the file
function initializeEventListeners() {
    document.getElementById('homeLink').addEventListener('click', function(e) {
        e.preventDefault();
        hideAllContent();
        document.getElementById('homeContent').classList.remove('hidden');
    });

    document.getElementById('activitiesLink').addEventListener('click', function(e) {
        e.preventDefault();
        hideAllContent();
        document.getElementById('activitiesContent').classList.remove('hidden');
    });

    document.getElementById('aboutLink').addEventListener('click', function(e) {
        e.preventDefault();
        hideAllContent();
        document.getElementById('aboutContent').classList.remove('hidden');
    });

    document.getElementById('contactLink').addEventListener('click', function(e) {
        e.preventDefault();
        hideAllContent();
        document.getElementById('contactContent').classList.remove('hidden');
    });

    const activityButtons = document.querySelectorAll('.activities button');
    const resetBtn = document.getElementById('resetBtn');
    
    activityButtons.forEach(button => {
        button.addEventListener('click', () => {
            activityButtons.forEach(btn => {
                if (btn !== button) {
                    btn.classList.add('hidden');
                }
            });
            button.classList.add('pressed');
            showOptions(button.id.replace('Btn', '').toLowerCase());
            resetBtn.classList.remove('hidden');
            // Reset the result div and disable translate button
            document.getElementById('result').innerHTML = '';
            document.getElementById('translateButton').disabled = true;
            generatedActivity = '';
        });
    });
    
    resetBtn.addEventListener('click', () => {
        activityButtons.forEach(btn => {
            btn.classList.remove('hidden', 'pressed');
        });
        resetBtn.classList.add('hidden');
        document.getElementById('languageOptions').classList.add('hidden');
        document.getElementById('NonLanguageOptions').classList.add('hidden');
    });
    
    document.getElementById('loadActivityBtn').addEventListener('click', sendQuery);
    document.getElementById('translateButton').addEventListener('click', translateAndListen);
}

function hideAllContent() {
    const contents = ['homeContent', 'activitiesContent', 'aboutContent', 'contactContent'];
    contents.forEach(content => document.getElementById(content).classList.add('hidden'));
}

// ... rest of the JavaScript code ...

// Context menu and key disable code
document.addEventListener('contextmenu', function(e) {
    // ... existing code ...
});

// Disable F12 key and Ctrl+Shift+I
document.onkeydown = function(e) {
    // ... existing code ...
};

// Add this at the end of the file
document.addEventListener('DOMContentLoaded', initializeEventListeners);

function showOptions(type) {
    currentActivity = type;
    const languageOptions = document.getElementById('languageOptions');
    const nonLanguageOptions = document.getElementById('NonLanguageOptions');
    const ukCurriculumLevel = document.getElementById('UKNationalCurriculumLevel');
    const keywordInput = document.getElementById('keywordInput');
    
    if (type === 'language') {
        languageOptions.classList.remove('hidden');
        nonLanguageOptions.classList.add('hidden');
        ukCurriculumLevel.classList.add('hidden');
        keywordInput.classList.add('hidden');
    } else {
        languageOptions.classList.add('hidden');
        nonLanguageOptions.classList.remove('hidden');
        ukCurriculumLevel.classList.remove('hidden');
        keywordInput.classList.remove('hidden');
    }
}

async function sendQuery() {
    const resultDiv = document.getElementById('result');
    const translateButton = document.getElementById('translateButton');
    const loadActivityBtn = document.getElementById('loadActivityBtn');
    let query = "";

    // Add loading indicator
    resultDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div class="bouncing-loader">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    `;

    loadActivityBtn.disabled = true;
    translateButton.disabled = true;

    if (currentActivity === 'language') {
        const language = document.getElementById('language').value;
        const proficiency = document.getElementById('proficiency').value;
        const genre = document.getElementById('genre').value;
        const length = document.getElementById('length').value;
        const formtype = document.getElementById('formtype').value;

        if (!language || !proficiency || !genre || !length || !formtype) {
            resultDiv.innerHTML = 'Please select all required options.';
            loadActivityBtn.disabled = false;
            return;
        }

        query = `In html, write a captivating ${length} word ${formtype} in ${language} using ${proficiency} level language. The ${formtype}'s genre should be ${genre}. A button should toggle the story from ${language} to english. Also put 5 multiple choice radiobutton questions which check the reader's understanding of the ${formtype}, with a score underneeth.`;

    } else {
        const keyword = document.getElementById('keywordInput').value.trim();
        const keywordPhrase = keyword ? `${keyword}` : '';
        query = `In html, create a 10 question ${currentActivity} ${keywordPhrase} worksheet (with emoticons) for UK national curriculum ${document.getElementById('UKNationalCurriculumLevel').value}. Then at the bottom of the page write the answers.`;
    }

    const API_KEY = window.API_KEY; // This line is correct, but let's add a check

    if (!API_KEY) {
        resultDiv.innerHTML = 'Error: API key is not defined. Please check your configuration.';
        loadActivityBtn.disabled = false;
        return;
    }

    const url = 'https://api.openai.com/v1/chat/completions';
    const data = {
        model: "gpt-4o",
        messages: [{ role: "user", content: query }],
        max_tokens: 3000,
        temperature: 0.5
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const fullResponse = response.data.choices[0].message.content;
            const htmlContent = fullResponse.match(/<html[\s\S]*?<\/html>/);

            if (htmlContent && htmlContent.length > 0) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent[0], 'text/html');
                
                // Extract and execute scripts
                const scripts = doc.getElementsByTagName('script');
                for (let script of scripts) {
                    const scriptContent = script.textContent;
                    const newScript = document.createElement('script');
                    newScript.textContent = scriptContent;
                    document.body.appendChild(newScript);
                }

                // Remove script tags from the HTML content
                for (let script of scripts) {
                    script.parentNode.removeChild(script);
                }

                // Remove excessive whitespace while preserving paragraph breaks
                let cleanedHtml = doc.body.innerHTML
                    .replace(/>\s+</g, '><')
                    .replace(/\n\s*/g, '\n')
                    .replace(/<\/p><p>/g, '</p>\n<p>')  // Preserve line breaks between paragraphs
                    .trim();

                resultDiv.innerHTML = cleanedHtml;
                generatedActivity = cleanedHtml;
                translateButton.disabled = false;

                // Add print and save buttons
                const buttonContainer = document.createElement('div');
                buttonContainer.style.marginTop = '20px';
                buttonContainer.style.display = 'flex';
                buttonContainer.style.gap = '10px';
                buttonContainer.innerHTML = `
                    <button id="printBtn">Print Activity</button>
                    <button id="saveBtn">Share activity as file</button>
                `;
                resultDiv.appendChild(buttonContainer);

                // Print functionality
                document.getElementById('printBtn').addEventListener('click', () => {
                    const printWindow = window.open('', '_blank');
                    const currentDate = new Date();
                    const formattedDate = currentDate.toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                    });
                    
                    printWindow.document.write(`
                        <html>
                        <head>
                            <title>EduQuest</title>
                            <style>
                                @media print {
                                    @page {
                                        margin: 0;
                                    }
                                    body {
                                        margin: 1.6cm;
                                    }
                                    .no-print { 
                                        display: none; 
                                    }
                                }
                                .header {
                                    margin-bottom: 20px;
                                }
                                .header h1 {
                                    font-size: 14px;
                                    margin: 0;
                                }
                                .header p {
                                    font-size: 12px;
                                    margin: 5px 0 0 0;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>EduQuest</h1>
                                <p>${formattedDate}</p>
                            </div>
                            ${cleanedHtml}
                        </body>
                        </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                });

                // Save as HTML functionality
                document.getElementById('saveBtn').addEventListener('click', () => {
                    const blob = new Blob([cleanedHtml], {type: 'text/html'});
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'EduQuest_Activity.html';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
            } else {
                resultDiv.innerHTML = `No HTML content found in the API response: ${fullResponse}`;
                generatedActivity = "";
            }
        } else {
            resultDiv.innerHTML = 'No response found in the API result.';
            generatedActivity = "";
        }
    } catch (error) {
        resultDiv.innerHTML = `Error: ${error.response ? error.response.data.error.message : error.message}`;
        generatedActivity = "";
    } finally {
        loadActivityBtn.disabled = false;
    }
}

function translateAndListen() {
    if (!generatedActivity) {
        alert('Please generate a story first.');
        return;
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = generatedActivity;

    const scriptElements = tempDiv.getElementsByTagName('script');
    const styleElements = tempDiv.getElementsByTagName('style');

    while (scriptElements.length > 0) {
        scriptElements[0].parentNode.removeChild(scriptElements[0]);
    }
    while (styleElements.length > 0) {
        styleElements[0].parentNode.removeChild(styleElements[0]);
    }

    const textOnlyStory = tempDiv.textContent || tempDiv.innerText || "";

    const encodedText = encodeURIComponent(textOnlyStory);
    const languageSelect = document.getElementById('language');
    const sourceLanguage = languageSelect.options[languageSelect.selectedIndex].value;
    const url = `https://translate.google.com/?sl=auto&tl=en&text=${encodedText}&op=translate`;
    window.open(url, '_blank');
}