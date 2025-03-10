// The body of this function will be executed as a content script inside the current page
function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
        document.body.style.backgroundColor = color;
    });
}

// Generate random question
let getQuestion = document.getElementById("getQuestion");
if (getQuestion) {
    getQuestion.addEventListener("click", () => {
        let loader = document.getElementsByClassName("loader1")[0];
        loader.style.display = "block";

        let topicElement = document.getElementById("topic");
        let topic = topicElement.value;
        
        if (topic === "all") {
            let allTopics = ["array", "string", "dynamic-programming", "hash-table", "binary-tree", "tree", "binary-search-tree", "recursion", "backtracking", "graph", "linked-list", "trie"];
            topic = allTopics[Math.floor(Math.random() * allTopics.length)];
        }

        let myHeaders = { "Content-Type": "application/json" };
        let graphql = JSON.stringify({
            query: `query getTopicTag($slug: String!) {
                topicTag(slug: $slug) {
                    name 
                    translatedName 
                    questions { status title difficulty titleSlug acRate }
                }
            }`,
            variables: { "slug": topic }
        });

        fetch(`https://api.allorigins.win/raw?url=https://leetcode.com/graphql`, {
            method: 'POST',
            headers: myHeaders,
            body: graphql
        })
        .then(response => response.text())
        .then(text => {
            console.log("Raw Response:", text);
            try {
                return JSON.parse(text);
            } catch (error) {
                throw new Error("Invalid JSON response. Possible CORS or API error.");
            }
        })
        .then(parsedData => {
            let difficulties = ["Easy", "Medium", "Hard"];
            let difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || "Random";
            
            if (difficulty === "Random") {
                difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            }

            let questionsArray = parsedData?.data?.topicTag?.questions || [];
            let filteredQuestions = questionsArray.filter(item => item.difficulty === difficulty);

            if (filteredQuestions.length === 0) {
                throw new Error("No questions found for this difficulty.");
            }

            let randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
            let problemURL = `https://leetcode.com/problems/${randomQuestion.titleSlug}`;

            loader.style.display = "none";
            document.getElementById("problemURL").setAttribute("href", problemURL);
            document.getElementById("problemURL").style.display = "block";
            document.getElementById("question").textContent = randomQuestion.title;
            document.getElementById("difficulty").textContent = difficulty;
            document.getElementById("topic1").textContent = topic;
        })
        .catch(error => {
            loader.style.display = "none";
            document.getElementById("question").textContent = `Error: ${error.message}`;
        });
    });
}

// Sign-Up Button
const signupBtn1 = document.getElementById('submit-btn-signup');
if (signupBtn1) {
    signupBtn1.addEventListener('click', () => {
        let loader = document.getElementsByClassName("loader1")[0];
        loader.style.display = "block";

        let leetCodeId = document.getElementById("leetcodeId").value.trim();
        if (!leetCodeId) {
            document.getElementById("invalidCreds").textContent = 'Please enter a LeetCode ID';
            document.getElementById("invalidCreds").style.display = "block";
            loader.style.display = "none";
            return;
        }

        fetch(`https://leetcode-stats-api.herokuapp.com/${leetCodeId}`)
        .then(response => response.text())
        .then(text => {
            console.log("Raw Response:", text);
            return JSON.parse(text);
        })
        .then(data => {
            if (data.message === 'User not found') {
                document.getElementById("invalidCreds").textContent = 'Invalid LeetCode Id';
                document.getElementById("invalidCreds").style.display = "block";
            } else {
                localStorage.setItem("leetCodeUser", leetCodeId);
                document.getElementById("stats").textContent = `Total Solved: ${data.totalSolved}, Easy: ${data.easySolved}, Medium: ${data.mediumSolved}, Hard: ${data.hardSolved}`;
                
                document.getElementById("signupDiv").classList.add("slide-up");
                document.getElementById("loginDiv").classList.remove("slide-up");
                document.getElementById("loginDiv").style.visibility = "visible";
                document.getElementById("signupDiv").style.visibility = "hidden";
                document.getElementById("invalidCreds").style.display = "none";
            }
        })
        .catch((err) => {
            document.getElementById("stats").textContent = `Error: ${err.message}`;
            console.log('Error: ', err);
        })
        .finally(() => loader.style.display = "none");
    });
}

// Logout Button
const loginBtn = document.getElementById("login");
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        localStorage.removeItem("leetCodeUser");
        document.getElementById("signupDiv").classList.remove("slide-up");
        document.getElementById("loginDiv").classList.add("slide-up");
        document.getElementById("loginDiv").style.visibility = "hidden";
        document.getElementById("signupDiv").style.visibility = "visible";
    });
}
