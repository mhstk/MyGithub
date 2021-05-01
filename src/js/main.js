const username_input = document.getElementById("input-username");
const name_textbox = document.getElementById("name")
const blogaddr_textbox = document.getElementById("blogaddr")
const profile_img = document.getElementById("img-profile")
const loader_img = document.querySelector(".loader-img")
const country_city_textbox = document.getElementById("country_city")
const favlanguage_textbox = document.getElementById("favlanguage")
const bio_textbox = document.getElementById("bio-text")
const left_container = document.querySelector(".left-container")
const message_div = document.getElementById("message");
const not_searched_div = document.getElementById("not_searched");
const loader_div = document.querySelector(".loader");
const error_div = document.querySelector(".err-not-found")




document.getElementById("btn-submit").addEventListener("click", (e) => {
    e.preventDefault();
    let username = username_input.value;
    if (username === "") return;
    showLoader();
    if (localStorage.getItem(username) === null){
        sendUser_req(username);
    }else{
        let data = JSON.parse(localStorage.getItem(username));
        setUserData(data);
    }
    
})

function setFavLang(favlang){
    favlanguage_textbox.innerHTML = favlang;
}


function sendRepos_req(username, user_data){
    let url = `https://api.github.com/users/${username}/repos`
    fetch(url)
    .then(res => {
        return res.json()
        .then(data => {
            return {
                data: data,
                response: res
            }
        })
        .then(result => {
            let data = result.data;
            let status = result.response.status;
            if (status != 200){
                console.log(data);
                showErr(data.message);
                return Promise.reject(data.message);
            }
            let favlang = "Not Found";
            console.log(data.length);
            //check lasted {check_number} pushed commits
            let check_number = 20;
            if (data.length >= 5){

                let sorted = data.sort((a, b) => (a.pushed_at < b.pushed_at ? 1 : -1)).slice(0,check_number);
                let counts = {}
                for (let val of sorted){
                    if (val.language === null) continue;
                    if (counts[val.language] === undefined){
                        counts[val.language] = 1;
                        continue;
                    }
                    counts[val.language]++;
                }
                console.log(sorted);
                console.log(counts);
                if (Object.keys(counts).length > 0){
                    favlang = Object.keys(counts).reduce((a, b) => counts[a] < counts[b] ? b : a);
                }
                console.log(favlang);
            }
            data = {...user_data, favlang:favlang};
            localStorage.setItem(username, JSON.stringify(data));
            setUserData(data);

        })
        .catch(err => {});
    })
}

function setUserData(data){
    showUserInfo();
    setFavLang(data.favlang);
    setName(data.name);
    setblogAddr(data.blog);
    setCountry_city(data.location);
    setBio(data.bio);
    setProfileImg(data.avatar_url);
}


function sendUser_req(username){
    clear_all();
    let url = "https://api.github.com/users/" + username;
    fetch(url)
    .then(res => {
        return res.json().then(data => ({data: data, status: res.status}))
    })
    .then(result =>  {
        let data = result.data;
        let status = result.status;
        if (status != 200){
            console.log(data);
            showErr(data.message);
            return Promise.reject(data.message);
        }
        sendRepos_req(username, data);
    })
    .catch(err => {});
}

function clear_all(){
    favlanguage_textbox.innerHTML = "";
    name_textbox.innerHTML = "";
    country_city_textbox.innerHTML = "";
    blogaddr_textbox.innerHTML = "";
    bio_textbox.innerHTML = "";
    remove_add_classlist(profile_img, ["show"] , "hide");
    remove_add_classlist(loader_img, ["hide"] , "show");
}


function remove_add_classlist(obj, rm_c, add_c){
    // console.log(obj);
    // console.log(rm_c);
    // console.log(add_c);
    rm_c.map(e => obj.classList.remove(e));
    obj.classList.add(add_c);
}

function showUserInfo(){
    [not_searched_div, loader_div, error_div, message_div].map(obj => 
        remove_add_classlist(obj, ["show", "flex"] , "hide"));
    [left_container].map(obj => remove_add_classlist(obj, ["hide"], "flex"));
}



function showLoader(){
    [left_container, not_searched_div, error_div].map(obj => remove_add_classlist(obj, ["show", "flex"], "hide"));
    [message_div, loader_div].map(obj => remove_add_classlist(obj, ["hide"], "flex"));
    [loader_div].map(obj => remove_add_classlist(obj, ["hide"], "show"));
}

function showErr(err_message){
    [left_container, not_searched_div, loader_div].map(obj => 
        remove_add_classlist(obj, ["show", "flex"], "hide"));
    if (err_message === "Not Found") err_message = "User not found!";
    error_div.querySelector("p").innerHTML = err_message;
    [message_div, error_div].map(obj => 
        remove_add_classlist(obj, ["hide"], "flex"));
}



function setName(name) {
    if (name === "" || name === null){
        name_textbox.innerHTML = "Not Found";
        return;
    }
    name_textbox.innerHTML = name;
}

function setblogAddr(blogaddr) {
    if (blogaddr === "" || blogaddr === null){
        blogaddr_textbox.innerHTML = "Not Found";
        blogaddr_textbox.removeAttribute("href")
        return;
    }
    blogaddr_textbox.innerHTML = blogaddr;
    blogaddr_textbox.href = blogaddr;
}

function setBio(bio) {
    if (bio === "" || bio === null){
        bio_textbox.innerHTML = "User dosn't have any bio information!";
        return;
    }
    bio_textbox.innerHTML = bio;
}

function setCountry_city(country_city) {
    if (country_city === "" || country_city === null){
        country_city_textbox.innerHTML = "Not Found";
        return;
    }
    country_city_textbox.innerHTML = country_city;
}

function setProfileImg(img) {
    if (img === "" || img === null){
        profile_img.src = "../../res/img/prof.png";
        return;
    }
    profile_img.src = img;
    if (profile_img.complete){
        remove_add_classlist(loader_img, ["show"] , "hide");
        remove_add_classlist(profile_img, ["hide"] , "show");
    }
    
}

profile_img.addEventListener("load", () => {
    remove_add_classlist(loader_img, ["show"] , "hide");
    remove_add_classlist(profile_img, ["hide"] , "show");
})

window.localStorage.clear();