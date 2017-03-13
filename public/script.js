// Initialize Firebase
var config = {
    apiKey: "AIzaSyDKis9ipJ3fiPgjAe3DeoXkB1waqDg2knU",
    authDomain: "cse-134b-hw4.firebaseapp.com",
    databaseURL: "https://cse-134b-hw4.firebaseio.com",
    storageBucket: "cse-134b-hw4.appspot.com",
    messagingSenderId: "47888727463"
};
firebase.initializeApp(config);
var storage = firebase.storage();
var database = firebase.database();
var mobile = "";
var disableScroll = false;
var home = document.getElementById("homepage-container");
var nextTime = 0;
var snackbar = document.getElementById("snackbar");

//Global user variable
var user = firebase.auth().currentUser;
var logout = document.getElementById("logout");
var userShow = document.getElementById("user");
firebase.auth().onAuthStateChanged(function(users) {
  user = users;
  if (users) {
    logout.classList.remove("hidden");
    userShow.classList.remove("hidden");
    userShow.innerHTML = user.email;
  } else {
    logout.classList.add("hidden");
    userShow.classList.add("hidden");
  }
});

logout.onclick = function(){
    firebase.auth().signOut();
}

function getImages() {
    var startRef = database.ref("/images");

    startRef.orderByChild("time").limitToFirst(7).once('value', function(snapshot){
        console.log("updating main list");
        while(home.hasChildNodes()){
            home.removeChild(home.lastChild);
        }
        if(snapshot.numChildren() < 7){
        	$("#loadMore").addClass("hidden");
        }
        var count = 0;
        snapshot.forEach(function(childSC){
        	if(count == 6){
        		nextTime = childSC.val().time;
        		return; 		
        	}
            createImgTag(childSC.val().imageName, childSC.val().storageLink, home, false);
	        count++;       
        });
        $("#loadMore").removeClass("hidden");
    });
}

//Get 3 images
window.onload = function(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        mobile = "_m";
    }
    getImages();
    var ref = database.ref("/images");
    ref.on('child_added', function(snapshot){
    	if($("#loadMore").is(":disabled")){
    		$("#loadMore").prop('disabled', false);
    	}
    })
}

//Add images as needed
$("#loadMore").click(function(){
	var startRef = database.ref("/images");

    startRef.orderByChild("time").limitToFirst(7).startAt(nextTime).once('value').then(function(snapshot){
        var count = 0;
        if(snapshot.numChildren() < 7){
        	$("#loadMore").prop('disabled', true);
        }
        snapshot.forEach(function(childSC){
        	if(count == 6){
        		nextTime = childSC.val().time;   		
        		return;
        	}
            createImgTag(childSC.val().imageName, childSC.val().storageLink, home, false);
            count++;
        }); 
       
    });
});

// Login
var loginSubmit = document.getElementById('loginSubmit');
loginSubmit.onclick = function() {
    var loginEmail = document.getElementById('loginEmail').value;
    var loginPassword = document.getElementById('loginPassword').value;
    firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        window.alert(errorMessage);
    }).then( function(){ 
        $("#loginModal").modal('hide'); 
        snackbar.className = "show";
        snackbar.innerHTML = "Logged in! Welcome back " + user.email;
        setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
    });
};

// register
var registerSubmit = document.getElementById('registerSubmit');
registerSubmit.onclick = function() {
    var registerEmail = document.getElementById('registerEmail').value;
    var registerPassword = document.getElementById('registerPassword').value;
    firebase.auth().createUserWithEmailAndPassword(registerEmail, registerPassword).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        window.alert(errorMessage);
    }).then( function(){ 
    	$("#registerModal").modal('hide'); 
    	snackbar.className = "show";
        snackbar.innerHTML = "Registered! Now you can log in!";
        setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
    });
};

// login with Google
var provider = new firebase.auth.GoogleAuthProvider();
var googleLogin = document.getElementById('googleLogin');
googleLogin.onclick = function() {
    firebase.auth().signInWithPopup(provider).then(function(result) {3
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        user = result.user;
        // ...3
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    }).then( function(){ 
        $("#loginModal").modal('hide');
        snackbar.className = "show";
        snackbar.innerHTML = "Logged in! Welcome back " + user.email;
        setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000); 
    });
};

//style image and put into DOM tree
function createImgTag(name, link, home, toFront) {
    for(var i = 0; i < home.childNodes.length; i++){
		var img = home.childNodes[i].getElementsByTagName("img");
		if(img[0].getAttribute("data-imgData") == name){
			return;
		}
	}

    var newImg = document.createElement("img");
    var link = storage.ref(link + mobile);
    link.getDownloadURL().then(function(url){
    	newImg.src = url;
    	newImg.setAttribute("data-toggle", "modal");
    	newImg.setAttribute("data-target", "#imageModal");
    	newImg.setAttribute("data-imgData", name);

    	var newDiv = document.createElement("div");
    	newDiv.className = "homepage-image";
   	 	newDiv.appendChild(newImg);
   	 	if(toFront){
   	 		home.insertBefore(newDiv, home.firstChild);
   	 	}
   	 	else{
   	 		home.appendChild(newDiv);
   	 	}
    });    
}

//Image Modal Behaviors (view/delete/edit)
$("#imageModal").on('show.bs.modal', function(e) {
    var img = $(e.relatedTarget); // img that triggered modal
    var newImg = document.createElement("img");

    var imgInfo;
    var imageData = img[0].dataset.imgdata;
    var imgModal = this;
    var modalBody = imgModal.getElementsByClassName("modal-body")[0];

    modalBody.textContent = "Content Loading...";

    var newDiv = document.createElement("div");
    newDiv.id = "imgDetails";
    //Begin adding content
    database.ref("/images").child(imageData).once('value').then(function(snapshot){    		
        imgInfo = snapshot.val();
        //Add image info to modal body
		var newDiv = document.createElement("div");
        newDiv.id = "imgDetails";
	    

        if(!imgInfo){
            modalBody.innerHTML = "Image not found!";
        	return;
        }

        //Set modal title to name of image
        var modalHeader = document.getElementById("imageModalTitle");
        if(imgInfo["imageName"]){
            modalHeader.textContent = imgInfo["imageName"];
        }
        //Add image info to modal body
		var newDiv = document.createElement("div");
        newDiv.id = "imgDetails";
	    newDiv.insertAdjacentHTML('beforeend', genTemplate(imgInfo));
        //Add image to body
        storage.ref(imgInfo.storageLink + mobile).getDownloadURL().then(function(url){
            modalBody.textContent = "";
            newImg.src = url;

            var infoBody = document.createElement("div");
            infoBody.id = "infoBody";
            //Add hidden edit view 
            infoBody.appendChild(newDiv);
            infoBody.appendChild(newImg);
            modalBody.appendChild(infoBody);
            modalBody.insertAdjacentHTML('beforeend', addHiddenEdit());

        });
    });

    //Delete an image
	var delBtn = document.getElementById("deleteImgBtn");
	delBtn.onclick = function(){
        if(!user){
            alert("You must log in to use this function.");
            return;
        }
        if(imgInfo){
			var link = imgInfo.storageLink;
			database.ref("/images").child(imageData).remove();
			storage.ref(link).delete();

		//Find image on page and remove
			for(var i = 0; i < home.childNodes.length; i++){
				var img = home.childNodes[i].getElementsByTagName("img");
				if(img[0].getAttribute("data-imgData") == imgInfo.imageName){
					home.removeChild(home.childNodes[i]);
				}
			}
		}
		$("#imageModal").modal('hide');
		snackbar.className = "show";
        snackbar.innerHTML = imgInfo.imageName + " is gone forever!";
        setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
	}

	//Edit an image
	var editBtn = document.getElementById("editImgBtn");
    var confirmBtn = document.getElementById("confirmEditsBtn");
	var cancelEditsBtn = document.getElementById("cancelEditsBtn");
    editBtn.onclick = function(){
        if(!user){
            alert("You must log in to use this function.");
            return;
        }    
        if($("#editView").hasClass("hidden")){
            var eV = document.getElementById("editView");
            eV.classList.remove("hidden");
            confirmBtn.classList.remove("hidden");
            cancelEditsBtn.classList.remove("hidden");
            $("#editImgBtn").addClass("hidden");
            $("#deleteImgBtn").addClass("hidden");
        }				
	}
	
    cancelEditsBtn.onclick = function(){
        var eV = document.getElementById("editView");
        var inputs = eV.getElementsByTagName("input");
        for(var i = 0; i < inputs.length; i++){
            if(inputs[i].type == "radio"){
                inputs[i].checked = false;
                continue;
            }
            inputs[i].value = "";
        }
        eV.classList.add("hidden");
        confirmBtn.classList.add("hidden");
        cancelEditsBtn.classList.add("hidden");
        $("#editImgBtn").removeClass("hidden");            
        $("#deleteImgBtn").removeClass("hidden"); 
    }

	confirmBtn.onclick = function() {

		var titleField = document.getElementById("editTitle").value;
	    var locField = document.getElementById("editLocation").value;
	    var sfwField = getRadioVal("editSFW");
	    var desField = document.getElementById("editDescription").value;
	    var tagField = document.getElementById("editTags").value;
	    var fileField = document.getElementById("editFile").files[0];
        var removeOld = 0;
	    //If nothing was filled let the user know!
	    if(!titleField){
	        titleField = imgInfo.imageName;
	    }
        else{
            database.ref("images").child(imgInfo.imageName).remove();
        }
	    if(!locField){
	        locField = imgInfo.location;
	    }
	    if(!sfwField){
			sfwField = imgInfo.safety;
		}
	    if(!desField){
	        desField = imgInfo.description;
	    }
	    if(!tagField){
	    	tagField = imgInfo.tags;
	    }

	    var theButton = this;
	    var editView = document.getElementById("editView");

	    //Cool, we can edit now

        //If a new file was uploaded, change the entry in storage
        if(fileField){
            storage.ref(imgInfo.storageLink).delete();
            storage.ref().child(fileField.name).put(fileField).then(function(snapshot){
                storageLinkName = snapshot.a.fullPath;

            //Push info to firebase only after storage
                var imgRef = firebase.database().ref("/images");
                imgRef = imgRef.child(titleField).update({
                    imageName: titleField,
                    location: locField,
                    safety: sfwField,
                    description: desField,
                    tags: tagField,
                    storageLink: storageLinkName
                }).then(function(){ 
                $("#cancelEditsBtn").click(); 
                $("#imageModal").modal('hide');
            })});
        }
        else{
            console.log("No infile update");
    	    var imgRef = database.ref("/images");
        	imgRef.child(titleField).update({
    	        imageName: titleField,
    	        location: locField,
    	        safety: sfwField,
    	        description: desField,
    	        tags: tagField,
    	        storageLink: imgInfo.storageLink
    		}).then(function(){
                $("#cancelEditsBtn").click();
                $("#imageModal").modal('hide');			
    		});
        }
        snackbar.className = "show";
        snackbar.innerHTML = "Changes to " + titleField + " have been saved!";
        setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
	}
});

//Empty the modal body when hidden
$("#imageModal").on('hide.bs.modal', function(){
    document.getElementById("imageModalTitle").textContent = "";
    var body = this.getElementsByClassName("modal-body")[0];
    // var children = body.children;
    while(body.hasChildNodes()){
        body.removeChild(body.lastChild);
    }

    var confirmBtn = document.getElementById("confirmEditsBtn");
    confirmBtn.classList.add('hidden');
    $("#cancelEditsBtn").addClass("hidden");
    $("#editImgBtn").removeClass("hidden");            
    $("#deleteImgBtn").removeClass("hidden");
});

//Empty login modal fields when hidden
$("#loginModal").on('hide.bs.modal', function(){
	var inputs = this.getElementsByTagName("input");
	console.log(inputs);
	for(var i = 0; i < inputs.length; i++){
		inputs[i].value = "";
	}

});

//Empty register modal fields when hidden
$("#registerModal").on('hide.bs.modal', function(){
    var inputs = this.getElementsByTagName("input");
    console.log(inputs);
    for(var i = 0; i < inputs.length; i++){
        inputs[i].value = "";
    }
});

//Empty addArt modal fields when hidden
$("#addArtModal").on('hide.bs.modal', function(){
	var inputs = this.getElementsByTagName("input");
	for(var i = 0; i < inputs.length; i++){
        if(inputs[i].type == "radio"){
            inputs[i].checked = false;
            continue;
        }
		inputs[i].value = "";
	}
})

//Add art
var changesBtn = document.getElementById("saveChanges");
changesBtn.onclick = function() {
    //Check if someone is logged in before adding
    if(!user){
        alert("You must log in to use this function..");
        $("#addArtModal").modal('hide');
        return;
    }

    //Grab content of form
    var titleField = document.getElementById("title").value;
    var locField = document.getElementById("location").value;
    var sfwField = getRadioVal("SFW");
    var desField = document.getElementById("description").value;
    var tagField = document.getElementById("tags").value;
    var fileField = document.getElementById("file").files[0];
    var storageLinkName = ""
    var out = "";
    if(!titleField){
        out += "Please include a title. \n";
    }
    if(!locField){
        out += "Please include a location. \n";
    }
    if(!sfwField){
        out += "Please indicate a safety rating. \n";
    }
    if(!desField){
        out += "Please include a description.";
    }
    //Also check if file is an image (later)
    if(!fileField){
    	out += "Please attach an image";
    }

    //Notify user of unfilled fields and stop
    if(out){
        window.alert(out);
        return;
    }

    //Push info to storage
    if(fileField){
        mobileScale(fileField);
        var fileName = fileField.name.split(".")[0];
    	var newImage = storage.ref().child(fileName);
    	newImage.put(fileField).then(function(snapshot){
    		storageLinkName = snapshot.a.fullPath;

    		//Push info to firebase only after storage
		    var imgRef = firebase.database().ref("/images");
		    imgRef = imgRef.child(titleField).set({
		        imageName: titleField,
		        location: locField,
		        safety: sfwField,
		        description: desField,
		        tags: tagField,
		        time: buildTime(),
		        storageLink: storageLinkName.split(".")[0]
		    });
		}).then( function(){ 
			$("#addArtModal").modal('hide'); 
			var link = storageLinkName.split(".")[0];
			createImgTag(titleField, link, home, true);
			if(home.childNodes.length <= 1){
				$("#loadMore").prop("disabled", true);
			}
			snackbar.className = "show";
	        snackbar.innerHTML = titleField + " has been added. Good work!";
	        setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
		});
	}
}

function getRadioVal(radioName){
    var value = "";
    var radios = document.getElementsByName(radioName);
    for(var i = 0; i < radios.length; i++){
        if(radios[i].checked){
            value = radios[i].value;
        }
    }
    return value;        
} 

function genTemplate(childSCval){
	var returnString = "";
	for(var key in childSCval){
        if(key == "imageName"){
            continue;
        }

        //Check if the field is empty and let the user know
        var value = childSCval[key];
        if(!value){
            value = "No " + key + "!";
        }
        else if(key == "time"){
        	value = readableDate(String(value));
        }

        //Capitalize the field name for prettiness
        var prettyKey = key.charAt(0).toUpperCase() + key.slice(1);

		returnString += "<h3>" + prettyKey + "</h3><br/>";
		returnString += "<p>" + value + "</p><br/><br/>";
	}
	return returnString;
}

function addHiddenEdit(){
	var content = "<div id=\"editView\" class=\"hidden\">" +
                  "<h2 style=\"text-align: center\">Edit Art</h2>" +
               	  "<p>Title:</p><input type=\"text\" id=\"editTitle\"><br/><br/>" +
                  "<p>Location:</p><input type=\"text\" id=\"editLocation\"><br/><br/>" +
                  "<p>Safe for work:<div id=\"sfwRadios\"></p><input type=\"radio\" name=\"editSFW\" value=\"Yes\">Yes<input type=\"radio\" name=\"SFW\" value=\"No\">No</div><br/><br/>" +
                  "<p>Description:</p><input type=\"text\" id=\"editDescription\"><br/><br/>" +
	              "<p>Tags:</p><input type=\"text\" id=\"editTags\"><br/><br/>" +
	              "<p>File:</p><input type=\"file\" id=\"editFile\"><br/><br/>" +
                  "</div>";

    return content;
}

function mobileScale(file){
    var image = new Image();
    var reader = new FileReader();

    var fileName = file.name.split(".")[0];

    reader.onload = function(e){
        image.src = reader.result;
        var canvas = resizeInCanvas(image);
        canvas.toBlob(function(blob){
            storage.ref().child(fileName + "_m").put(blob);
        }, "image/jpeg");
    }

    image.src = reader.readAsDataURL(file);   
}

function resizeInCanvas(img){
    var canvas = document.createElement('canvas');
    var MWidth = 300;
    var MHeight = 300;
    var width = img.width;
    var height = img.height;

    if (width > height) {
      if (width > MWidth) {
        height *= MWidth / width;
        width = MWidth;
      }
    } else {
      if (height > MHeight) {
        width *= MHeight / height;
        height = MHeight;
      }
    }
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    // console.log(canvas.toDataURL()); 
    return canvas;
}

function buildTime(){
	var d = new Date();
	var month = d.getMonth() + 1, day = d.getDate(), hour = d.getHours(), minute = d.getMinutes(), second = d.getSeconds();
	if(month < 10){
		month = "0" + month;
	}
	if(d.getDate() < 10){
		day = "0" + d.getDate();
	}
	if(d.getHours() < 10){
		hour = "0" + d.getHours();
	}
	if(d.getMinutes() < 10){
		minute = "0" + d.getMinutes();
	}
	if(d.getSeconds() < 10){
		second = "0" + d.getSeconds();
	}
	return d.getFullYear() + "" + month + "" + day + "" + hour + "" + minute + "" + second; 
}

function readableDate(date){
	var year = date.substring(0, 4);
	var month = date.substring(4, 6);
	var day = date.substring(6, 8);
	var hour = date.substring(8, 10);
	var minute = date.substring(10, 12);

	if(hour > 12){
		hour = hour - 12;
		minute += "pm";
	}
	else{
		minute += "am";
	}

	return month + "/" + day + "/" + year + ", " + hour + ":" + minute;
}