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



// self-executing function with closed scope on loading/ready
( function( window, document, undefined ) {

  'use strict';

  // create a global '$' querying variable
  window.$ = function( selector, all ) {
    if ( all ) {
      return document.querySelectorAll( selector );
    } else {
      return document.querySelector( selector );
    }
  };

  // Convert query object lists to arrays. (Mainly useful for 'forEach' property.)
  window.$A = function( selector, all ) {
    if ( all ) {
      return Array.prototype.slice.call( $( selector, all ) );
    } else {
      return new Array().concat( $( selector, all ) );
    }
  }

  // Make a generic iterator from Array.forEach
  var forEach = Array.prototype.forEach;
  // Shortcut for common function
  var dgi = document.getElementById.bind( document );

  ////////////////////////////////////////////////////////////////////////////////
  ///                           * Selectors *                            ///
  ////////////////////////////////////////////////////////////////////////////////

  // Get all the <a> links for "edit course information" and assign event handlers here
  var aEditCourseGroup = $( 'a.link_editCourse', true );
  //Get all the sub department groups (if any)
  var subdeptULGroup = $( '.course_subdept', true ); // get the radio button group of sub departments
  var subdeptSelectors = $( '.select_subdept', true ); // get the <select> elements that have the sub department choices 
  // Screen dimensions for centering
  var myWidth = 0;
  var myHeight = 0;
  var myScroll = 0;
  var myScrollWidth = 0;
  var myScrollHeight = 0;

  if ( window.jQuery ) {
    window.jQuery.noConflict();
  }

  ////////////////////////////////////////////////////////////////////////////////
  ///                              * Methods *                               ///
  ////////////////////////////////////////////////////////////////////////////////


  function loadScreen() {
    if ( document.all ) {
      // IE
      myWidth = ( document.documentElement.clientWidth ) ? document.documentElement.clientWidth : document.body.clientWidth;
      myHeight = ( document.documentElement.clientHeight ) ? document.documentElement.clientHeight : document.body.clientHeight;
      myScroll = ( document.documentElement.scrollTop ) ? document.documentElement.scrollTop : document.body.scrollTop;
    } else {
      // NON-IE
      myWidth = window.innerWidth;
      myHeight = window.innerHeight;
      myScroll = window.pageYOffset;
    }

    if ( window.innerHeight && window.scrollMaxY ) {
      // NON-IE
      myScrollWidth = document.body.scrollWidth;
      myScrollHeight = window.innerHeight + window.scrollMaxY;
    } else if ( document.body.scrollHeight > document.body.offsetHeight ) {
      // IE
      myScrollWidth = document.body.scrollWidth;
      myScrollHeight = document.body.scrollHeight;
    } else {
      // IE MAC
      myScrollWidth = document.body.offsetWidth;
      myScrollHeight = document.body.offsetHeight;
    }
  }

  function noScroll( e ) {
    return false;
  }

  // Handler function on the '#edit_instructor' text input element
  // 'this' references the element that fired the event (the <input>)
  function setInput( e ) {

    var messageList = dgi( this.id + "_messages" );

    e = e || window.event;

    var bufferName = this.value; // <- [Needs to evaluate at call time]
    if ( e.type === 'blur' && bufferName.charAt ) {
      // Further initial cleanup on blur, not performed on input/change:
      // 1. Strip off leading & trailing non-alpha
      //    NOTE: Cannot do this incrementally (oninput), or else the user is
      //    effectively prevented from typing 'bad end characters' as they go along.
      while ( /[\-& ]/.test( bufferName.charAt( 0 ) ) ) {
        bufferName = bufferName.slice( 1 );
      }
      while ( /[\-& ]/.test( bufferName.charAt( bufferName.length - 1 ) ) ) {
        bufferName = bufferName.substring( 0, bufferName.length - 1 );
      }
      this.value = bufferName;
    }

    // The validateName() does some basic cleanup on bad input
    var isValidName = validateName( this );

    if ( isValidName ) { // validateName() returns 'false' if not good

      if ( e.type === 'blur' ) { // Only change the value on blur, not on every input
        this.value = isValidName;
      }

      this.classList.remove( 'input_error' ); // The <input> field
      this.classList.add( 'input_valid' );

      messageList.classList.add( 'fadeout' ); // This seems to work correctly...8/11/14
    } else {
      // Redisplay error messages (that may have been faded out).
      messageList.classList.remove( 'fadeout' ); // This seems to work correctly...8/11/14
      this.classList.remove( 'input_valid' );
      this.classList.add( 'input_error' );
    }
    return isValidName; // Either the (corrected) valid name, or false if not valid  
  }

  function showPopOver( surveyNumber, e ) {
    popClearErrorMessages( dgi( "edit_instructor" ) );
    loadScreen();

    e = e || window.event;
    if ( e.preventDefault ) e.preventDefault();

    // Blur the background and prevent scrolling while the popOver is shown.
    // Hence the popover gets sole focus until it is finished
    dgi( "content" ).classList.add( 'blurout1' );
    document.body.style.overflow = "hidden";
    window.addEventListener( 'scroll', noScroll );
    window.addEventListener( 'DOMMouseScroll', noScroll );
    window.addEventListener( 'mousewheel', noScroll );
    // Both must be restored on closing the popOver

    var popEditBox = dgi( "popEdit" );
    var sel_ranks = dgi( "edit_rank" );
    var sel_types = dgi( "edit_coursetype" );
    var input_instructor = dgi( "edit_instructor" );

    popEditBox.style.display = "block";
    popEditBox.style.left = ( ( myWidth / 2 ) - ( popEditBox.offsetWidth / 2 ) ) + "px";
    popEditBox.style.top = ( ( myHeight / 2 ) - ( popEditBox.offsetHeight / 2 ) ) + "px";

    dgi( "edit_course" ).textContent = dgi( "course_" + surveyNumber ).textContent;
    // Focus the instructor name text input
    input_instructor.focus();
    input_instructor.value = dgi( "instructor_" + surveyNumber ).textContent;
    input_instructor.select();


    // Select the correct <option> for the Ranks <select> element, based on the course's existing value
    for ( var i = 0; i < sel_ranks.children.length; i++ ) {
      if ( sel_ranks.children[ i ].textContent === dgi( "rank_" + surveyNumber ).textContent ) {
        sel_ranks.selectedIndex = i;
        break; // Found the correct <option> to select; quit the loop
      }
    }

    // Select the correct <option> for the Course Type <select> element, based on the course's existing value
    for ( i = 0; i < sel_types.children.length; i++ ) {
      if ( sel_types.children[ i ].textContent === dgi( "coursetype_" + surveyNumber ).textContent ) {
        sel_types.selectedIndex = i;
        break; // Found the correct <option> to select; quit the loop
      }
    }

    // Add "Save Changes" and "Cancel" handlers 
    dgi( "edit_save_changes" ).addEventListener( 'mousedown',
      // This prevents the blur event on the name input field if 'save changes' is clicked
      function( e ) {
        e = e || window.event;
        if ( e.preventDefault ) e.preventDefault();
        return false;
      } );

    ////////////////////////////////////////////////////////////////////////////////
    // This EventListener (to save changes) needs to be changed each time
    // (from any previous calls to this function), and then reset with the correct parameters.
    // So we create it in a local variable that calls the real processing function with
    // the necessary parameters, and then unbinds itself.
    // The function is bound to the text <input> to catch "enter" keystrokes
    // and to the "Save changes" link to catch clicks. Both are bound/unbound dynamically.
    var saveCourseBound = function( e ) {
      e = e || window.event;
      // Catch the mouseclick events on the 'save changes' button
      if ( e.type === 'click' ) {
        if ( e.preventDefault ) e.preventDefault();
        saveEditCourse( surveyNumber, sel_ranks, sel_types, e );
        dgi( "edit_save_changes" ).removeEventListener( 'click', saveCourseBound );
        dgi( "edit_instructor" ).removeEventListener( 'keypress', saveCourseBound );
        e.stopImmediatePropagation(); // No more event handling for this event
      }
      // Catch the 'enter' key on the text input field
      if ( e.type === 'keypress' && e.keyCode === 13 ) { // This should be the 'Enter' key on the text field (Instructor Name)
        saveEditCourse( surveyNumber, sel_ranks, sel_types, e );
        dgi( "edit_save_changes" ).removeEventListener( 'click', saveCourseBound );
        dgi( "edit_instructor" ).removeEventListener( 'keypress', saveCourseBound );
        e.stopImmediatePropagation(); // No more event handling for this event
      }
      // Else do nothing (pass)
      return;
    };

    dgi( "edit_save_changes" ).addEventListener( 'click', saveCourseBound, false );
    input_instructor.addEventListener( 'keypress', saveCourseBound, false );
    ////////////////////////////////////////////////////////////////////////////////


    dgi( "edit_cancel" ).addEventListener( 'mousedown',
      // This prevents the blur event from firing on the name input field if 'cancel'
      // is clicked while the name input has focus
      function( e ) {
        e = e || window.event;
        if ( e.preventDefault ) e.preventDefault();
        return false;
      } );
    dgi( "edit_cancel" ).addEventListener( 'click', hidePopOver );
    document.addEventListener( 'keyup', function escClosePopOver( e ) {
      // Inline handler to capture 'ESC' key to close popover - placed on document to catch any 'ESC' keypress
      e = e || window.event;
      var key = e.keyCode || e.which;
      if ( key === 27 ) { // Close popover on 'ESC' key
        e.stopImmediatePropagation(); // Don't allow any more handlers, like onblur
        hidePopOver( e );
        document.removeEventListener( 'keyup', escClosePopOver );
        return;
      }
    } );

    dgi( 'screen' ).style.display = "block";    
  }

  function saveEditCourse( survey_number, sel_ranks, sel_types, e ) {

    e = e || window.event;
    if ( e.preventDefault ) e.preventDefault();

    // *****ADD: Validation as usual for the name...
    var nameChange = validateName( dgi( "edit_instructor" ) ); //  Will set to 'false' if invalid
    if ( nameChange ) {

      var fieldChange;
      // Update the fields in the DISPLAY to the user...
      dgi( "instructor_" + survey_number ).textContent = nameChange;
      dgi( "rank_" + survey_number ).textContent = sel_ranks.children[ sel_ranks.selectedIndex ].textContent;
      dgi( "rank_" + survey_number ).dataset.rankCode = sel_ranks.children[ sel_ranks.selectedIndex ].value;
      dgi( "coursetype_" + survey_number ).textContent = sel_types.children[ sel_types.selectedIndex ].textContent;
      // ... And create hidden fields in the form to report these changes back to the server on form submission
      // If the field already exists, re-assign it  
      if ( document.getElementsByName( "instructor_" + survey_number )[ 0 ] ) {
        fieldChange = document.getElementsByName( "instructor_" + survey_number )[ 0 ];
      } else {
        // Else create it and add it into the HTML form
        fieldChange = document.createElement( "input" );
        fieldChange.name = "instructor_" + survey_number;
        document.forms[ 'srf' ].appendChild( fieldChange );
      }
      fieldChange.type = "hidden";
      fieldChange.value = nameChange;


      if ( document.getElementsByName( "rank_" + survey_number )[ 0 ] ) {
        // If the field already exists, re-assign it  
        fieldChange = document.getElementsByName( "rank_" + survey_number )[ 0 ];
      } else {
        // Else create it
        fieldChange = document.createElement( "input" );
        fieldChange.name = "rank_" + survey_number;
        document.forms[ 'srf' ].appendChild( fieldChange );
      }
      fieldChange.type = "hidden";
      fieldChange.value = dgi( "edit_rank" ).children[ dgi( "edit_rank" ).selectedIndex ].value;

      if ( document.getElementsByName( "coursetype_" + survey_number )[ 0 ] ) {
        // If the field already exists, re-assign it  
        fieldChange = document.getElementsByName( "coursetype_" + survey_number )[ 0 ];
      } else {
        // Else create it
        fieldChange = document.createElement( "input" );
        fieldChange.name = "coursetype_" + survey_number;
        document.forms[ 'srf' ].appendChild( fieldChange );
      }
      fieldChange.type = "hidden";
      fieldChange.value = dgi( "edit_coursetype" ).children[ dgi( "edit_coursetype" ).selectedIndex ].value;

      // Find which subdept (if any) is selected
      var subdept = "";
      if ( dgi( "subdeptSection_" + survey_number ) ) {
        // Radio group on Flexbox page
        subdept = $( "[name=subdept_" + survey_number + "]:checked" ).value;
        // Update the STD Q list on save
        updateSTDQList( survey_number, subdept );
      } else if ( dgi( "subdeptSelector_" + survey_number ) ) {
        // Select element on table page
        subdept = dgi( "subdeptSelector_" + survey_number ).value;
        // Update the STD Q Selector on save
        updateSTDQSelect( survey_number, subdept );
      }


      // Clear any error messages from the message <section>
      popClearErrorMessages( dgi( "edit_instructor" ) );

      // And close the popOver    
      hidePopOver( e );
      return true;
    } else {
      return false;
    }


  }

  // Clears error/validation messages for the inputs that require error validation.
  // For the srf_addcourses.shtml page, there may be more than one (created dynamically)
  // so we need to pass some reference to the calling field, from which we can get the
  // associated error message list. The relationship we use is that each instructor input which
  // needs this validation has an associated <ul> with an id of the input's id + "_messages".
  function popClearErrorMessages( inputField, e ) {
    inputField = inputField || this;
    switch ( inputField.nodeName.toLocaleLowerCase() ) {
      case "input":
        // Clears any existing messages in the calling object's error list <ul>
        var messageList = dgi( inputField.id + "_messages" );
        while ( messageList.firstChild ) {
          messageList.removeChild( messageList.firstChild );
        }
        break;
      case "select":
        inputField.classList.remove( 'input_error' );
        if ( this[ 0 ].value === "" ) {
          this.removeChild( this[ 0 ] );
        }
        break;
    }
  }

  function popAddErrorMessage( fieldname, messageText, classType ) {
    // Add a new message to the calling object's error list <ul>
    var messageList = dgi( fieldname.id + "_messages" );
    var msg = document.createElement( 'li' );
    msg.classList.add( classType );
    msg.textContent = messageText;
    return messageList.appendChild( msg );
  }

  function hidePopOver( e ) {

    e = e || window.event;
    if ( e.preventDefault ) {
      e.preventDefault();
    }

    // Remove background blur and restore scrolling
    document.body.style.overflow = "scroll";
    window.removeEventListener( 'scroll', noScroll );
    window.removeEventListener( 'mousewheel', noScroll );
    window.removeEventListener( 'DOMMouseScroll', noScroll );
    dgi( "content" ).classList.remove( 'blurout1' );

    //dgi("edit_save_course").removeEventListener()
    // Clear any existing messages
    popClearErrorMessages( dgi( "edit_instructor" ) );
    dgi( "edit_instructor" ).classList.remove( 'input_error' );

    dgi( "popEdit" ).style.display = "none";
    dgi( 'screen' ).style.display = "none";
  }

  // Limit user input to alpha chars and the dash, space, comma, ampersand chars.
  // CSS transforms this input to DISPLAY all UPPERCASE. The actual value is updated at validation.
  function inputAlpha( e ) {
    e = e || window.event;
    var key = e.which ? e.which : e.keyCode;
    key = String.fromCharCode( key );

    var functionalKeys = [ 8, 9, 16, 17, 18, 91, 46, 127, 37, 38, 39, 40, 27, 192 ] // Delete, backspace, arrows, TAB, ESC, etc.
    var regex = /[A-Za-z\- &]/;

    e.returnValue = regex.test( key ); // || ( functionalKeys.indexOf( parseInt( e.keyCode ) ) >= 0 );
    //if ( !e.returnValue && e.preventDefault ) e.preventDefault();
    return e.returnValue;

  }

  // Clean up the input in case of bad user input
  // CSS is used with text-transform: uppercase to set the appearance to uppercase; onblur, the value is changed to uppercase also

  function validateName( inputField ) {

    popClearErrorMessages( inputField );

    // Make a new element to show the validation result(s); there will always be at least one message.
    var err_message;

    ////////////////////////////////////////////////////////////////////////////////
    // Automatic corrections, cleanup
    // 1. Set to UPPERCASE
    var name = inputField.value,
      bufferName;

    name = name.toLocaleUpperCase();
    // 2. Trim multiple spaces, dashes, commas, ampersands to single
    name = name.replace( / {2,}/g, " " ).replace( /\-{2,}/g, "-" ).replace( /,{2,}/g, "," ).replace( /&{2,}/g, "&" );
    // Pad ampersands with spaces, if there is room

    bufferName = name.replace( /(?=[^ ])&(?=[^ ])/g, ' & ' );
    if ( bufferName.length <= 30 ) {
      name = bufferName;
    }

    // Next check for basic errors that can be flagged here. e.g. Name begins/ends with a comma or space
    if ( name.match( /^[A-Z]{2,}(\s?[,&\-]?\s?[A-Z]+)*$/ ) ) { // Name is good
      popAddErrorMessage( inputField, "Instructor: Name is valid.", "valid" );

      return name;

    } else {

      if ( name === "" || name === null ) {
        popAddErrorMessage( inputField, "Instructor: This field is required.", "error" );
      } else if ( name.length < 2 || ( name.search( /[ \-&]/ ) < 2 && name.search( /[ \-&]/ ) >= 0 ) ) {
        popAddErrorMessage( inputField, "Instructor: Last Name must be at least 2 characters.", "error" );
      } else {

        if ( name.match( /([\-&]\s?){2,}/ ) ) {
          popAddErrorMessage( inputField, "Instructor: The data doesn't make sense:" + name.match( /([\-&]\s?){2,}/ )[ 0 ] + ".", "error" );
        }
        if ( name.match( /[^A-Za-z \-&]/ ) ) { // Bad characters can be entered via copy/paste.
          popAddErrorMessage( inputField, "Instructor: Invalid characters: \"" + name.match( /[^A-Za-z \-&]/g ).join( "\" , \"" ) + "\"", "error" );
        }

        if ( name.match( /^ / ) ) {
          popAddErrorMessage( inputField, "Instructor: Field must not begin with a space.", "error" );
        } else if ( name.match( / $/ ) ) {
          popAddErrorMessage( inputField, "Instructor: Field must not end with a space.", "error" );
        }

        if ( name.match( /^-/ ) ) {
          popAddErrorMessage( inputField, "Instructor: Field must not begin with a dash.", "error" );
        } else if ( name.match( /-$/ ) ) {
          popAddErrorMessage( inputField, "Instructor: Field must not end with a dash.", "error" );
        }

        if ( name.match( /^&/ ) ) {
          popAddErrorMessage( inputField, "Instructor: Field must not begin with an ampersand.", "error" );
        } else if ( name.match( /&$/ ) ) {
          popAddErrorMessage( inputField, "Instructor: Field must not end with an ampersand.", "error" );
        }
      }

      return false;
    }
    ////////////////////////////////////////////////////////////////////////////////

  }

  function submitForm( action, e ) {
    e = e || window.event;
    if ( e.preventDefault ) e.preventDefault();
    e.returnValue = false; // For IE compatibility ...
    // Set the return page for the server to send back
    switch ( action ) {
      case "Add Flex":
        dgi( "return_page" ).value = "srf_addcourses.shtml";
        dgi( "display_style" ).value = "flex";
        break;
      case "Add Table":
        dgi( "return_page" ).value = "srf_addcourses.shtml";
        dgi( "display_style" ).value = "table";
        break;
      case "Switch Flex":
        dgi("return_page").value = "srf_list.shtml";
        dgi("display_style").value = "flex";
        break;
      case "Switch Table":
        dgi("return_page").value = "srf_table.shtml";
        dgi("display_style").value = "table";
        break;
      case "Submit":
      default:
        dgi( "return_page" ).value = "srf_submit.shtml";
        break;

    }

    dgi( "srf" ).submit();
  }

  function submitAddCourses( e ) {
    e = e || window.event;
    if ( e.preventDefault ) e.preventDefault();
    e.returnValue = false; // For IE compatibility ...
    // Basic Validation:
    // 1. Are all Instructor input fields valid? ('add_instructor_###')
    // 2. Are all select elements valid? The only one that has a default state of 'Please select something...'
    //    is the Course ('add_course_###'). Both Rank and Type default to the first in the list, so they don't need to be checked here.
    var formElements = dgi( "add_courses" ).elements;
    var valid = true;
    var errors = document.createElement( "ul" );
    var errMsg = document.createElement( "li" );
    errMsg.textContent = "Please correct errors and submit again. Required fields in error are highlighted in red.";
    errMsg.classList.add( "input_error" );
    errors.appendChild( errMsg );
    // Clear the error-holding <div> of any previous entries
    while ( dgi( "error_msg" ).firstElementChild ) {
      dgi( "error_msg" ).removeChild( dgi( "error_msg" ).firstElementChild );
    }

    for ( var i = 0, element; i < formElements.length; i++ ) {
      element = formElements[ i ];
      if ( element.hasAttribute( "required" ) ) {
        switch ( element.nodeName.toLocaleLowerCase() ) {
          case "select":
            if ( element.selectedIndex === 0 && element.value === "" ) {
              valid = false;
              errMsg = document.createElement( "li" );
              errMsg.textContent = "You must choose a course. This field is required.";
              errors.appendChild( errMsg );
              element.classList.add( "input_error" );
            } else {
              element.classList.remove( "input_error" );
            }
            break;
          case "input":
            // Either the presence of 'error' or the absence of 'valid' should be an error,
            // according to the way our code (is supposed to) work.
            if ( element.className.indexOf( "input_error" ) >= 0 || element.className.indexOf( "input_valid" ) < 0 ) {
              valid = false;
              errMsg = document.createElement( "li" );
              errMsg.textContent = "Instructor name is invalid. This field is required.";
              errors.appendChild( errMsg );
              // Add a class to highlight the individual item in error.
              element.classList.add( "input_error" );
            } else {
              element.classList.remove( "input_error" );
            }
            break;
        }
      }
    }

    if ( valid ) {
      // Set the return page for the server to send back
      dgi( "return_page" ).value = "srf_addcourses.shtml";

      this.removeEventListener( e.type, submitAddCourses );
      this.submit();
    } else {
      dgi( "error_msg" ).appendChild( errors );
      dgi( "error_msg" ).hidden = false; // Remove default 'hidden' attribute
      dgi( "error_msg" ).removeAttribute( "style" ); // It has been given a style of 'display:none' on page load.
      dgi( "error_msg" ).setAttribute( "style", "height:" +
        String( parseInt( errors.scrollHeight ) + 15 ) + "px" );
      dgi( "error_msg" ).scrollIntoView( true );
      return false;
    }
  }

  // Flexbox page with radio buttons
  // This function only changes the Sub Department variables. Then it calls updateSTDQList.
  function clickSubDepartment( survey_number, subdept ) {

    // Skip the whole method if there is no subdept <section>. Method should never be called this way.
    if ( dgi( "subdeptSection_" + survey_number ) ) {
      var subdeptList = dgi( "subdeptList_" + survey_number );

      // Then show the whole stdq section which is hidden by default before a subdept is chosen     
      var stdqSection = dgi( "stdqSection_" + survey_number );
      stdqSection.removeAttribute( "hidden" );

      // Finally remove the default "Choose Sub Department" button, if it has not been already.
      // subdeptList is the <ul>, then <li>, then <input>
      var chooseSubDeptButton = subdeptList.firstElementChild.firstElementChild;
      if ( chooseSubDeptButton.value === "" || chooseSubDeptButton.value === 0 ) {
        subdeptList.removeChild( chooseSubDeptButton.parentNode );
      }
      updateSTDQList( survey_number, subdept );
    }
  }

  // For the Flexbox page with radio groups
  function updateSTDQList( survey_number, subdept ) { // subdept param should be a String
    // Re-type as RegExp, and add the '|all' to cover stdq choices that are fit for all subdepartments
    subdept = RegExp( subdept + "|all" );

    // The <li> children of stdq <ul> are the different STD Q choices shown
    var stdqList = dgi( "stdqList_" + survey_number ).children;
    var stdqDept, stdqRank; // These will be used to match STD Q choices to the course rank and subdept
    var courseRank = dgi( "rank_" + survey_number ).dataset.rankCode;

    // Next, check if Instructor name and/or rank are missing, so as to display the warning messages
    // Set a blank rank to 'R' (i.e. none).
    courseRank = courseRank.length === 0 ? "R" : courseRank;
    // Set a blank instructor name to 'N'.
    if ( dgi( "instructor_" + survey_number ).textContent.length === 0 ) {
      courseRank = courseRank === "R" ? "N" + courseRank : "N";
    }
    // Ranks 'N', 'R' and "NR" will only match the 'Do Not Evaluate' Questionnaire choice,
    // but will also trigger the error messages prompting to fill in the missing information.

    //First show/hide the appropriate individual questionnaires based on their 'data-esci' attributes
    for ( var i = 0; i < stdqList.length; i++ ) {
      stdqDept = stdqList[ i ].firstElementChild.dataset.esciDepartment;
      stdqRank = stdqList[ i ].firstElementChild.dataset.esciRank;

      // Each stdq must match on both rank and subdept to be displayed to the user
      if ( subdept.test( stdqDept ) && ( stdqRank.indexOf( courseRank ) ) != -1 ) {
        stdqList[ i ].removeAttribute( "hidden" );
      } else {
        //stdqList[ i ].setAttribute( "hidden", true );
        stdqList[ i ].hidden = true;
        // If the choice now being hidden was already checked, set the checked radio back to
        // "Do not evaluate" (the default, element[0]) to avoid having an unselected radio group
        if ( stdqList[ i ].firstElementChild.checked ) {
          stdqList[ 0 ].firstElementChild.checked = true;
        }
      }
    }
  }

  //Table page with <select> menus
  // This function only changes the Sub Department variables. Then it calls updateSTDQList.
  function selectSubDepartment( e ) {
    e = e || window.event;
    if ( e.preventDefault ) e.preventDefault();

    var survey_number = this.id.replace( "subdeptSelector_", "" );
    var subdept = this.value;
    updateSTDQSelect( survey_number, subdept );
  }

  // For the Table page with <select> elements
  function updateSTDQSelect( survey_number, subdept ) {
    // Re-type as RegExp, and add the '|all' to cover stdq choices that are fit for all subdepartments
    subdept = RegExp( subdept + "|all" );

    // Due to cross-browser differences we cannot simple show/hide various <option>s in the
    // <select> element, as we do with the radio button version. Instead, on each change necessitating
    // update, we replace the original <select> element with a clone from a hidden "Master" <select>.
    // Then we strip out the inappropriate choices.

    var newSTDQSelect = dgi( "master_select" ).cloneNode( true );
    var oldSTDQSelect = dgi( "stdqSelector_" + survey_number );
    var oldSelected = oldSTDQSelect.value;

    // The <options> of the <select> element are the different STD Q choices shown
    var stdqOptions = newSTDQSelect.options;

    var stdqDept, stdqRank; // These will be used to match STD Q choices to the course rank and subdept
    var courseRank = dgi( "rank_" + survey_number ).dataset.rankCode;

    // Next, check if Instructor name and/or rank are missing, so as to display the warning messages
    // Set a blank rank to 'R' (i.e. none).
    courseRank = courseRank.length === 0 ? "R" : courseRank;
    // Set a blank instructor name to 'N'.
    if ( dgi( "instructor_" + survey_number ).textContent.length === 0 ) {
      courseRank = courseRank === "R" ? "N" + courseRank : "N";
    }
    // Ranks 'N', 'R' and "NR" will only match the 'Do Not Evaluate' Questionnaire choice,
    // and will also trigger the corresponding error message prompting to fill in the missing information.

    //First show/hide the appropriate individual questionnaires based on their 'data-esci' attributes
    var removeList = [];
    // We go through the <options> list in reverse, since each removal will dynamically adjust
    // the size, and hence the positioning of the remaining elements.
    for ( var i = stdqOptions.length - 1; i >= 0; --i ) {
      stdqDept = stdqOptions[ i ].dataset.esciDepartment;
      stdqRank = stdqOptions[ i ].dataset.esciRank;

      if ( stdqOptions[ i ].value === oldSelected ) {
        stdqOptions[ i ].selected = true;
      }

      // Each stdq must match on both rank and subdept to be displayed to the user.
      // Since we are working from a "Master" element, we just delete those that don't match.
      if ( !( subdept.test( stdqDept ) && ( stdqRank.indexOf( courseRank ) ) != -1 ) ) {
        // If the <option> now being removed was previously selected, reset the selectedIndex back to zero.
        if ( stdqOptions[ i ].selected ) {
          newSTDQSelect.selectedIndex = 0;
        }
        // We don't remove them here, since it dynamically changes the size/length of the HTMLOptionsCollection.
        stdqOptions.remove( i );
      }
    }

    // Reset the 'id' and 'name' attributes on the new clone to replace the old one
    newSTDQSelect.id = oldSTDQSelect.id;
    newSTDQSelect.name = oldSTDQSelect.name;
    // Finally replace the old <select> with the new
    oldSTDQSelect.parentNode.replaceChild( newSTDQSelect, oldSTDQSelect );
    // and make it visible
    newSTDQSelect.hidden = false;
  }

  // Clones the 'template' <div> with children; renames the variables appropriately;
  // and appends it to new course list container.
  // We might consider forcing the previous add courses to be valid before allowing a clone.
  // This is not implemented right now. - 8/22/14
  function addNewCourse( e ) {
    e = e || window.event;
    if ( e.preventDefault ) {
      e.preventDefault();
    }
    // Always start the clone from the first <div> (the 'template')
    if ( dgi( "add_survey_1" ) ) {
      var cloneCourse = dgi( "add_survey_1" ).cloneNode( true );
      //Get the last cloned child appended to determine the re-numbering of variables
      var lastCloneNumber = dgi( "new_surveys" ).lastChild.id.replace( "add_survey_", "" );
      var currentCloneNumber = String( parseInt( lastCloneNumber ) + 1 );

      var incrementClone = function( node ) {
        // Increment values that have the [var_name_number] format for 'id', 'name', and 'for'
        if ( node.hasAttribute( 'id' ) ) {
          node.id = node.id.replace( "_1", "_" + currentCloneNumber );
        }
        if ( node.hasAttribute( 'name' ) ) {
          node.name = node.name.replace( "_1", "_" + currentCloneNumber );
        }
        if ( node.hasAttribute( 'htmlFor' ) ) {
          node.htmlFor = node.htmlFor.replace( "_1", "_" + currentCloneNumber );
        }
        // Remove any dynamic classing (i.e. 'valid' , 'error')
        node.classList.remove( 'valid' );
        node.classList.remove( 'error' );
      };

      walkDOM( cloneCourse, incrementClone );


      // Append new clonedCourse to the container <div>
      dgi( "new_surveys" ).appendChild( cloneCourse );
      // Kill any existing error messages that my have gotten cloned
      popClearErrorMessages( dgi( "add_instructor_" + currentCloneNumber ) );
      dgi( "add_instructor_" + currentCloneNumber ).classList.remove( "input_error" );
      dgi( "add_instructor_" + currentCloneNumber ).classList.remove( "input_valid" );

      // Re-assign the event handlers for the child elements in the newly cloned <div>
      dgi( "add_instructor_" + currentCloneNumber ).addEventListener( 'keypress', inputAlpha );
      dgi( "add_instructor_" + currentCloneNumber ).addEventListener( 'blur', setInput, false );
      dgi( "add_instructor_" + currentCloneNumber ).addEventListener( 'change', setInput, false );
      dgi( "add_instructor_" + currentCloneNumber ).addEventListener( 'input', setInput, false );
      dgi( "add_course_" + currentCloneNumber ).addEventListener( 'change',
        function() {
          popClearErrorMessages.bind( ( dgi( "add_course_" + currentCloneNumber ),
            dgi( "add_course_" + currentCloneNumber ) ) )();
        }, false );

      // Clear the instructor name input. The other inputs are <select> type and the clone
      // call does not preserve their .selectedIndex.
      dgi( "add_instructor_" + currentCloneNumber ).value = "";
    }
  }


  // Standard recursive tree-traversal routine that executes the function 'func' for each node.
  function walkDOM( node, func ) {
    func( node );

    node = node.firstElementChild;
    while ( node ) {
      walkDOM( node, func );
      node = node.nextElementSibling;
    }
  }

  // IE 8 and older compatibility
  if ( !Function.prototype.bind ) {
    Function.prototype.bind = function( oThis ) {
      if ( typeof this !== "function" ) {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError( "Function.prototype.bind - what is trying to be bound is not callable" );
      }

      var aArgs = Array.prototype.slice.call( arguments, 1 ),
        fToBind = this,
        fNOP = function() {},
        fBound = function() {
          return fToBind.apply( this instanceof fNOP && oThis ? this : oThis, aArgs.concat( Array.prototype.slice.call( arguments ) ) );
        };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }



  ///////////////////////////////////////////////////////////////////////////////
  ///               * Processing logic and event handlers *               ///
  /// This logic needs to be conditioned somewhat based on which page we  ///
  /// are dealing with. Since there are only a few pages in this site,    ///
  /// we do best to keep all the .js in a single file, and separate it by ///
  /// id# attributes in the <body> tag for each different .html page.     ///    
  ///////////////////////////////////////////////////////////////////////////////

  var _page_type = dgi( "body" ).dataset.pageName;
  switch ( _page_type ) {
    case "List Surveys Flex":
      {
        // Does the main form exist?
        if ( dgi( "srf" ) ) {
          dgi( "srf" ).addEventListener( 'submit', submitForm.bind( dgi( "srf" ), "Submit" ) );
        }
        if ( dgi( "add_submit" ) ) {
          dgi( "add_submit" ).addEventListener( 'click', submitForm.bind( dgi( "srf" ), "Add Flex" ) );
        }
        if ( dgi( "switch_display" ) ) {
          dgi( "switch_display" ).addEventListener( 'click', submitForm.bind( dgi( "srf" ), "Switch Table" ) );
        }
        
        // Event handlers for the <a>:"Edit Course Information" elements.
        // Survey Number bound as argument; second  parameter should be automatically passed as the Event by the browser.
        for ( var i = 0; i < aEditCourseGroup.length; i++ ) {
          aEditCourseGroup[ i ].addEventListener( 'click', showPopOver.bind( null, aEditCourseGroup[ i ].id.replace( "editCourse_", "" ) ), false );
        }

        ////////////////////////////////////////////////////////////////////////////////
        // These 4 listeners are OK to remain through the life of the page.
        if ( dgi( "edit_instructor" ) ) {
          dgi( "edit_instructor" ).addEventListener( 'keypress', inputAlpha );
          dgi( "edit_instructor" ).addEventListener( 'blur', setInput, false );
          dgi( "edit_instructor" ).addEventListener( 'change', setInput, false );
          dgi( "edit_instructor" ).addEventListener( 'input', setInput, false );
        }
        ////////////////////////////////////////////////////////////////////////////////
        var subdeptRadios;
        // Loop over each group of Sub Department radio buttons
        for ( var j = 0, survey_number; j < subdeptULGroup.length; j++ ) {
          // Extract the Survey Number from the id field
          survey_number = subdeptULGroup[ j ].id.replace( "subdeptList_", "" );

          // An individual radio group for a single survey <div> block
          subdeptRadios = subdeptULGroup[ j ].children; // The children are <li> elements. Each <li> has a single <input> child.
          for ( var i = 0, subdept; i < subdeptRadios.length; i++ ) {
            subdept = subdeptRadios[ i ].firstElementChild.value;
            subdeptRadios[ i ].addEventListener( 'click', clickSubDepartment.bind( null, survey_number, subdept ) );
          }
        }

        break;
      }
      // Some of he event handling logic is different on the Table formatted version of the page
    case "List Surveys Table":
      {
        // Does the main form exist?
        if ( dgi( "srf" ) ) {
          dgi( "srf" ).addEventListener( 'submit', submitForm.bind( dgi( "srf" ), "Submit" ) );
        }
        if ( dgi( "add_submit" ) ) {
          dgi( "add_submit" ).addEventListener( 'click', submitForm.bind( dgi( "srf" ), "Add Table" ) );
        }
        if ( dgi( "switch_display" ) ) {
          dgi( "switch_display" ).addEventListener( 'click', submitForm.bind( dgi( "srf" ), "Switch Flex" ) );
        }

        // Event handlers for the <a>:"Edit Course Information" elements.
        // Survey Number bound as argument; second  parameter should be automatically passed as the Event by the browser.
        for ( var i = 0; i < aEditCourseGroup.length; i++ ) {
          aEditCourseGroup[ i ].addEventListener( 'click', showPopOver.bind( null, aEditCourseGroup[ i ].id.replace( "editCourse_", "" ) ), false );
        }

        ////////////////////////////////////////////////////////////////////////////////
        // These 4 listeners are OK to remain through the life of the page.
        if ( dgi( "edit_instructor" ) ) {
          dgi( "edit_instructor" ).addEventListener( 'keypress', inputAlpha );
          dgi( "edit_instructor" ).addEventListener( 'blur', setInput, false );
          dgi( "edit_instructor" ).addEventListener( 'change', setInput, false );
          dgi( "edit_instructor" ).addEventListener( 'input', setInput, false );
        }
        ////////////////////////////////////////////////////////////////////////////////

        // Loop over each SubDepartment select element
        for ( var j = 0, survey_number; j < subdeptSelectors.length; j++ ) {
          // Extract the Survey Number from the id field
          survey_number = subdeptSelectors[ j ].id.replace( "subdeptSelector_", "" );
          subdeptSelectors[ j ].addEventListener( 'change', selectSubDepartment, false );
        }

        break;
      }

    case "Submit Surveys":
      {
        break;
      }

    case "Add New Courses":
      {

        var displayStyle = dgi( "display_style" ).value;

        dgi( "add_courses" ).addEventListener( 'submit', submitAddCourses, false );

        if ( dgi( "btn_append_course" ) ) {
          dgi( "btn_append_course" ).addEventListener( 'click', addNewCourse, false );
        }

        if ( dgi( "add_instructor_1" ) ) {
          // These are the same input filters as the input_instructor field
          // of the main srf_list.shtml page. They start on the one default
          // new course field, and will have to be added again to the new
          // instructor input upon cloning the add_course <div>.
          dgi( "add_instructor_1" ).addEventListener( 'keypress', inputAlpha );
          dgi( "add_instructor_1" ).addEventListener( 'blur', setInput, false );
          dgi( "add_instructor_1" ).addEventListener( 'change', setInput, false );
          dgi( "add_instructor_1" ).addEventListener( 'input', setInput, false );

          // This filter simply clears validation error messages on input change
          dgi( "add_course_1" ).addEventListener( 'change',
            function() {
              popClearErrorMessages.bind( ( dgi( "add_course_1" ), dgi( "add_course_1" ) ) )();
            }, false );
        }

        // Set the correct return page based on display type: table | flex
        if ( document.forms[ "return" ] ) {
          switch ( displayStyle ) {
            case "flex":
              document.forms[ "return" ].action = '../4DACTION/WEB_SRF_SendFlex';
              break;
            case "table":
              document.forms[ "return" ].action = '../4DACTION/WEB_SRF_SendTable';
              break;
          }
        }

        break;
      }
  }


  ////////////////////////////////////////////////////////////////////////////////
  ////////// Common to all pages //////////
  // First check what to display, if there is an errror message
  var errMsg = dgi( "error_text" );
  // If there is no error to report, hide the error block
  errMsg.textContent = errMsg.textContent.trim(); // Kill extra HTML-source whitespace
  if ( errMsg.textContent === undefined || errMsg.textContent === "" ) {
    //dgi( "error_msg" ).style.display = "none";
    dgi( "error_msg" ).hidden = true;
  } // Else hide the other elements
  else {
    dgi( "error_msg" ).hidden = false;
    if ( dgi( "error_msg" ) ) dgi( "error_msg" ).style.display = "block";
    //if ( dgi( "heading" ) ) dgi( "heading" ).style.display = "none";
    //if ( dgi( "intro" ) ) dgi( "intro" ).style.display = "none";
    //if ( dgi( "list" ) ) dgi( "list" ).style.display = "none";
    if ( dgi( "heading" ) ) dgi( "heading" ).hidden = true;
    if ( dgi( "intro" ) ) dgi( "intro" ).hidden = true;
    if ( dgi( "list" ) ) dgi( "list" ).hidden = true;
  }

  // Add fadeout for any '.valid' elements, once the page has loaded
  forEach.call( $( '.valid', true ), function( node ) {
    node.classList.add( 'fadeout' );
  } );
  ////////////////////////////////////////////////////////////////////////////////

} )( window, document );
