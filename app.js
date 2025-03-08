// The body of this function will be executed as a content script inside the current page
function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
      document.body.style.backgroundColor = color;
    });
}

// Generate random question
let getQuestion = document.getElementById("getQuestion");
getQuestion.addEventListener("click", (z) => {
    document.getElementsByClassName("loader1")[0].style.display = "block";
    var e = document.getElementById("topic");
    var topic = e.value;
    console.log(topic);
    
    if (topic === "all") {
        var allTopics = ["array", "string", "dynamic-programming", "hash-table", "binary-tree", "tree", "binary-search-tree", "recursion", "backtracking", "graph", "linked-list", "trie"];
        topic = allTopics[Math.floor(Math.random() * allTopics.length)];
    }
    
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var graphql = JSON.stringify({
        query: `query getTopicTag($slug: String!) {
            topicTag(slug: $slug) {
                name translatedName questions {status title difficulty titleSlug acRate}
            } 
        }`,
        variables: { "slug": `${topic}` }
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: graphql
    };

    fetch("https://salty-waters-49462.herokuapp.com/leetcode.com/graphql", requestOptions)
        .then(response => response.json())
        .then(result => {
            var array = ["Easy", "Medium", "Hard"];
            let difficulty = document.querySelector('input[name="difficulty"]:checked').value;
            
            if (difficulty === "Random") {
                difficulty = array[Math.floor(Math.random() * array.length)];
            }

            let questionsArray = result.data.topicTag.questions || [];
            let filteredquestions = questionsArray.filter(item => item.difficulty === difficulty);
            
            if (filteredquestions.length === 0) {
                throw new Error("No questions found for this difficulty.");
            }
            
            let randomQuestion = Math.floor(Math.random() * filteredquestions.length);
            var problemURL = `https://leetcode.com/problems/${filteredquestions[randomQuestion].titleSlug}`;
            
            document.getElementsByClassName("loader1")[0].style.display = "none";
            document.getElementById("problemURL").setAttribute("href", problemURL);
            document.getElementById("problemURL").style.display = "";
            document.getElementById("question").innerHTML = filteredquestions[randomQuestion].title;
            document.getElementById("difficulty").innerHTML = difficulty;
            document.getElementById("topic1").innerHTML = topic;
        })
        .catch(error => {
            document.getElementsByClassName("loader1")[0].style.display = "none";
            document.getElementById("question").innerHTML = `Error: ${error.message}`;
        });
});

// Sign-Up Button
const signupBtn1 = document.getElementById('submit-btn-signup');

signupBtn1.addEventListener('click', (e) => {
    var signupDiv = document.getElementById("signupDiv");
    var loginDiv = document.getElementById("loginDiv");
    document.getElementById("getQuestion").click();
    document.getElementsByClassName("loader1")[0].style.display = "block";

    // Display the problem solved status
    let leetCodeId = document.getElementById("leetcodeId").value;

    fetch(`https://salty-waters-49462.herokuapp.com/leetcode-stats-six.vercel.app/api?username=${leetCodeId}&theme=dark`, { 'Access-Control-Allow-Origin': '*' })
        .then(response => response.text())
        .then(data => {
            if (leetCodeId.length <= 0 || data === 'Username does not exist') {
                document.getElementsByClassName("loader")[0].style.display = "none";
                document.getElementById("invalidCreds").innerHTML = 'Invalid LeetCode Id';
                document.getElementsByClassName("invalidCreds")[0].style.display = "block";
            } else {
                document.getElementById("stats").innerHTML = data;
                document.getElementsByClassName("loader")[0].style.display = "none";
                
                signupDiv.classList.add("slide-up");
                loginDiv.classList.remove("slide-up");
                document.getElementById("loginDiv").style.visibility = "visible";
                document.getElementById("signupDiv").style.visibility = "hidden";
                document.getElementsByClassName("invalidCreds")[0].style.display = "none";
            }
        })
        .catch((err) => {
            document.getElementById("stats").innerHTML = `Error: ${err.message}`;
            console.log('Error: ', err);
        });
});

// Login Button
document.getElementById("login").addEventListener("click", goToLogin);

function goToLogin() {
    let signupDiv = document.getElementById("signupDiv");
    let loginDiv = document.getElementById("loginDiv");

    signupDiv.classList.remove("slide-up");
    loginDiv.classList.add("slide-up");
    document.getElementById("loginDiv").style.visibility = "hidden";
    document.getElementById("signupDiv").style.visibility = "visible";
}
