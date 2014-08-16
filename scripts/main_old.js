//   main.js
// 
//   Written by: George H. Michaels, Ph.D.
//   Copyright 2014 The Regents, The University of California, All Rights Reserved.
// 
//   Main ESCI SUrvey Request Form Javascripts
// 
//   Created: Wed May 14 10:01:00 PDT 2014
// 
// 
// 

function updateSTDQList(subDepartment, instructorRank) {
    var deptList = document.getElementById(subDepartment);
    var stdQList = document.getElementById(subDepartment.replace("_subdepartment", "_stdq_choice"));

    stdQList.removeAttribute("disabled");

    if (deptList.options[0].value === "nil") {
        deptList.removeChild(deptList.options[0])
    }
    // 'subDepartment_FAC_List' and 'subDepartment_TA_List'
    // are globally declared vars which are created in the 4D code.
    switch (instructorRank) {
    case "F":
        stdQList.innerHTML = subDepartment_FAC_List[deptList.selectedIndex];
        break;
    case "T":
        stdQList.innerHTML = subDepartment_TA_List[deptList.selectedIndex];
        break;
    case "A":
        stdQList.innerHTML = subDepartment_FAC_List[deptList.selectedIndex] + subDepartment_TA_List[deptList.selectedIndex];
        // The "Do not evaluate" item will be duplicated since it is in both lists.
        // Delete it.
        stdQList.remove(stdQList.length / 2);
        break;
    }
}

function editCourse(surveyNumber) {
    if (confirm("Are you sure you want to leave this page and edit the course information? Any changes you have made so far will be saved.")) {
        document.getElementById("edit_course").value = surveyNumber;
        document.getElementById("srf").submit();
    } else {
        return false;
    }
}

// Limit user input to alpha chars and the dash, space, comma, ampersand     chars.

function inputAlpha(e) {
    var theEvent = e || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    var regex = /[A-Za-z\- ,&]/;
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }
}

// Clean up the input in case of bad user input
// CSS is used with text-transform: uppercase to set the appearance to uppercase; onblur, the value is changed to uppercase also

function validateName(e) {
    //e = e || window.event;
    var target = document.getElementById("edit_instructor") // e.target || e.srcElement;
    var err_message = document.getElementById("error_list");
    // Set to UPPERCASE, trim multiple spaces, dashes, commas, ampersands
    target.value = target.value.toLocaleUpperCase().replace(/ {2,}/g, " ").replace(/\-{2,}/g, "-");
    target.value = target.value.replace(/,{2,}/, ",").replace(/&{2,}/, "&");
    // Next check for basic errors that can be flagged here. e.g. Name begins with a comma or space
    if (target.value.match(/^[A-Z]{2,}([ ]?[,&\-]?[ ]?[A-Z]+)*$/)) {
        err_message.innerHTML = "<li class=\"valid\">Instructor: Name is valid.</li>";
        err_message.classList.remove("hidden");
        return true;
    } else {
        err_message.innerHTML = (target.value === "" || target.value == null) ? "<li class=\"error\">Instructor: This field is required.</li>" : "<li class=\"error\">Instructor: Field data is not valid.</li>";
        err_message.classList.remove("hidden");
        return false;
    }
}

if (document.getElementById("edit_course")) {
    document.getElementById("edit_course").onsubmit = function() {
        return validateName();
    }
}

if (document.getElementById("srf")) {

    document.getElementById("srf").onsubmit = function(e) {
        e = e ? e : window.event;
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false; // For IE compatibility ... 
        
        document.getElementById("srf_submit").disabled = true;
        document.getElementById("srf_submit").value = "Processing ... Please wait.";

        var selectList = document.querySelectorAll("#srf>table>tbody>tr>td>select");
        for (var i = 0; i < selectList.length; i++) {
            // enable any disabled selectors, else the variables will not be submitted
            selectList[i].removeAttribute("disabled");
        }
        alert("done processing.")

        document.getElementById("srf_submit").disabled = false;
        document.getElementById("srf_submit").value = "Submit Changes";

        document.getElementById("srf").submit();
    }
}

onload = function() {
    errMsg = document.getElementById("error_text")
    // If there is no error to report, hide the error block
    if (errMsg.innerText == "" ) {
        document.getElementById("error_msg").style.display = "none";        
    } // Else hide the other elements
    else {
        document.getElementById("error_msg").style.display = "block";
        document.getElementById("heading").style.display = "none";
        document.getElementById("intro").style.display = "none";
        document.getElementById("list").style.display = "none";
    }
}



