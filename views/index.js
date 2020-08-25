var dark = false;

if(document.cookie.includes('dark=')) {
    var cookies = document.cookie.split(';')
    cookies.forEach(function(item){
        if(item.includes('dark=')) {
            dark =  item.split('=')[1];
        }
    })
}

if(dark == 'true') {
    var element = document.body; 
    element.classList.add("dark"); 
}

document.getElementsByClassName("submit-button")[0].addEventListener("click", function() {
    var video = {};
    video.title = document.getElementById("title").value;
    video.tags = [];
    var tags=document.getElementsByName("tags[]");
    tags.forEach(element => {
        video.tags.push(element.value);
    });
    video.url = document.getElementById("url").value;
    video.category = document.getElementById("category").value;
    video.speaker = {};
    video.speaker.name = document.getElementById("name").value;
    video.speaker.title = document.getElementById("s-title").value;
    video.speaker.location = document.getElementById("location").value;
    video.claps = 0;

    fetch("/video", { 
        method: "POST", 
        body: JSON.stringify(video),
        headers: { 
            "Content-type": "application/json"
        } 
    }).then(function(response) {
        return response.json()
    }).then(function(data) {
        console.log(data);
    })
})

var buttons = document.getElementsByClassName("submit-id")
for(var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function() {
        var id = {};
        id.id = parseInt(this.id);
        fetch("/upvote", { 
            method: "POST", 
            body: JSON.stringify(id),
            headers: { 
                "Content-type": "application/json"
            } 
        }).then(function(response) {
            return response.json()
        }).then(function(data) {
            if(data.hasOwnProperty("error")) {
                alert(data.error)
            }
            else console.log(data);
        }).catch(function(err) {
            console.log(err);
        })
    })
}

function myFunction() { 
    var element = document.body; 
    element.classList.toggle("dark"); 
    if(element.classList.contains("dark")) {
        dark = true;
    }
    else dark = false;
    document.cookie = "dark=" + dark;
} 

function getSpeakerList(){
    window.location='/speakers/';
}

function getLeaderBoard() {
    window.location='/leaderboard/';
}