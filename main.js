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
  console.group( "Welcome to ESCI Survey Request" )
  console.profile( "Intializing web page..." );

  console.time( "Beginning timeline profile." );
  console.timeStamp( "Setting variables for selectors" );

  ////////////////////////////////////////////////////////////////////////////////
  ///                           * Selectors *                            ///
  ////////////////////////////////////////////////////////////////////////////////

  // Get all the <a> links for "edit course information" and assign event handlers here
  var aEditCourseGroup = document.querySelectorAll( '.link_editCourse' );
  //Get all the sub department groups (if any)
  var subdeptULGroup = document.querySelectorAll( '.course_subdept' ); // get the radio button group of sub departments

  // Screen dimensions for centering
  var myWidth = 0;
  var myHeight = 0;
  var myScroll = 0;
  var myScrollWidth = 0;
  var myScrollHeight = 0;

  if ( window.jQuery ) {
    console.log( "JQuery is loaded - noConflict invoked." )
    window.jQuery.noConflict();
  }

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



  ////////////////////////////////////////////////////////////////////////////////
  ///                              * Methods *                               ///
  ////////////////////////////////////////////////////////////////////////////////


  console.timeStamp( "Function definitions" )

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

  function showPopOver( surveyNumber ) {
    popClearErrorMessages();
    loadScreen();

    var e = window.event;
    if ( e.preventDefault ) e.preventDefault();

    // Blur the background and prevent scrolling while the popOver is shown.
    // Hence the popover gets sole focus until it is finished
    document.getElementById( "content" ).classList.add( 'blur', 'grayout' );
    document.body.style.overflow = "hidden";
    window.addEventListener( 'scroll', function noScroll() {
      return false;
    } );
    window.addEventListener( 'DOMMouseScroll', function noScroll() {
      return false;
    } );
    window.addEventListener( 'mousewheel', function noScroll() {
      return false;
    } );
    // Both must be restored on closing the popOver

    var popEditBox = document.getElementById( "popEdit" );

    popEditBox.style.display = "block";
    popEditBox.style.left = ( ( myWidth / 2 ) - ( popEditBox.offsetWidth / 2 ) ) + "px";
    popEditBox.style.top = ( ( myHeight / 2 ) - ( popEditBox.offsetHeight / 2 ) + myScroll ) + "px";

    document.getElementById( "edit_course" ).innerText = document.getElementById( "course_" + surveyNumber ).innerText;
    // Focus the instructor name text input
    document.getElementById( "edit_instructor" ).focus();
    document.getElementById( "edit_instructor" ).value = document.getElementById( "instructor_" + surveyNumber ).innerText;
    document.getElementById( "edit_instructor" ).addEventListener( 'keypress', inputAlpha );
    document.getElementById( "edit_instructor" ).addEventListener( 'blur', function() {
      // Needs to evaluate at call time
      // Update the field value with the validation result, if good
      var isValidName = validateName( document.getElementById( "edit_instructor" ).value );
      if ( isValidName ) {
        document.getElementById( "edit_instructor" ).classList.remove( 'input_error' );
        document.getElementById( "edit_instructor" ).value = isValidName;
      } else {
        document.getElementById( "edit_instructor" ).classList.add( 'input_error' );
      }
      return isValidName; // Either the (corrected) valid name, or false if not valid
    } );
    // Select the correct <option> for the Ranks <select> element, based on the course's existing value
    var sel_ranks = document.getElementById( "edit_rank" );
    for ( var i = 0; i < sel_ranks.children.length; i++ ) {
      if ( sel_ranks.children[ i ].innerText === document.getElementById( "rank_" + surveyNumber ).innerText ) {
        sel_ranks.selectedIndex = i;
        break; // Found the correct <option> to select; quit the loop
      }
    }

    // Select the correct <option> for the Course Type <select> element, based on the course's existing value
    var sel_types = document.getElementById( "edit_coursetype" );
    for ( i = 0; i < sel_types.children.length; i++ ) {
      if ( sel_types.children[ i ].innerText === document.getElementById( "coursetype_" + surveyNumber ).innerText ) {
        sel_types.selectedIndex = i;
        break; // Found the correct <option> to select; quit the loop
      }
    }

    // Add "Save Changes" and "Cancel" handlers 
    document.getElementById( "edit_save_changes" ).addEventListener( 'mousedown',
      // This prevents the blur event on the name input field if 'save changes' is clicked
      function( e ) {
        e = e || window.event;
        if ( e.preventDefault ) e.preventDefault();
        return false;
      } );
    document.getElementById( "edit_save_changes" ).addEventListener( 'click', saveEditCourse.bind( null, surveyNumber, sel_ranks, sel_types ) );
    document.getElementById( "edit_cancel" ).addEventListener( 'mousedown',
      // This prevents the blur event on the name input field if 'cancel' is clicked
      function( e ) {
        e = e || window.event;
        if ( e.preventDefault ) e.preventDefault();
        return false;
      } );
    document.getElementById( "edit_cancel" ).addEventListener( 'click', hidePopOver );
    document.addEventListener( 'keyup', function escClosePopOver( e ) {
      // Inline handler to capture 'ESC' key to close popover
      e = e || window.event;
      var key = e.keyCode || e.which;
      if ( key === 27 ) { // Close popover on 'ESC' key
        e.stopImmediatePropagation(); // Don't allow any more handlers, like onblur
        hidePopOver();
        document.removeEventListener( 'keyup', escClosePopOver );
        ////////////////////////////////////////////////////////////////////////////////
        // This line causes a new Child to be added to the "#edit_messages" for unknown reasons.
        //document.getElementById( "editCourse_" + surveyNumber ).focus();
        ////////////////////////////////////////////////////////////////////////////////
        return;
      }
    } )

    document.getElementById( 'screen' ).style.display = "block";
    document.getElementById( 'screen' ).style.width = myScrollWidth + "px";
    document.getElementById( 'screen' ).style.height = myScrollHeight + "px";
  }

  function saveEditCourse( survey_number, sel_ranks, sel_types ) {

    var e = window.event;
    if ( e.preventDefault ) e.preventDefault();

    // *****ADD: Validation as usual for the name...
    var nameChange = document.getElementById( "edit_instructor" ).value;
    nameChange = validateName( nameChange ); //  Will set to 'false' if invalid
    if ( nameChange ) {
      // Clear any error messages from the message <section>
      popClearErrorMessages();

      var fieldChange;
      // Update the fields in the DISPLAY to the user...
      document.getElementById( "instructor_" + survey_number ).innerText = nameChange;
      document.getElementById( "rank_" + survey_number ).innerText = sel_ranks.children[ sel_ranks.selectedIndex ].innerText;
      document.getElementById( "rank_" + survey_number ).dataset.rankCode = sel_ranks.children[ sel_ranks.selectedIndex ].value;
      document.getElementById( "coursetype_" + survey_number ).innerText = sel_types.children[ sel_types.selectedIndex ].innerText;
      // ... And create hidden fields in the form to report these changes back to the server on form submission
      // If the field already exists, re-assign it  
      if ( document.getElementsByName( "instructor_" + survey_number )[ 0 ] ) {
        fieldChange = document.getElementsByName( "instructor_" + survey_number )[ 0 ];
      } else {
        // Else create it and add it into the HTML form
        fieldChange = document.createElement( "input" );
        fieldChange.setAttribute( "name", "instructor_" + survey_number );
        document.forms[ 0 ].appendChild( fieldChange );
      }
      fieldChange.setAttribute( "type", "hidden" );
      fieldChange.setAttribute( "value", document.getElementById( "edit_instructor" ).value );


      if ( document.getElementsByName( "rank_" + survey_number )[ 0 ] ) {
        // If the field already exists, re-assign it  
        fieldChange = document.getElementsByName( "rank_" + survey_number )[ 0 ];
      } else {
        // Else create it
        fieldChange = document.createElement( "input" );
        fieldChange.setAttribute( "name", "rank_" + survey_number );
        document.forms[ 0 ].appendChild( fieldChange );
      }
      fieldChange.setAttribute( "type", "hidden" );
      fieldChange.setAttribute( "value", document.getElementById( "edit_rank" ).children[ document.getElementById( "edit_rank" ).selectedIndex ].value );

      if ( document.getElementsByName( "coursetype_" + survey_number )[ 0 ] ) {
        // If the field already exists, re-assign it  
        fieldChange = document.getElementsByName( "coursetype_" + survey_number )[ 0 ];
      } else {
        // Else create it
        fieldChange = document.createElement( "input" );
        fieldChange.setAttribute( "name", "coursetype_" + survey_number );
        document.forms[ 0 ].appendChild( fieldChange );
      }
      fieldChange.setAttribute( "type", "hidden" );
      fieldChange.setAttribute( "value", document.getElementById( "edit_coursetype" ).children[ document.getElementById( "edit_coursetype" ).selectedIndex ].value );

      // Find which subdept (if any) is selected
      var subdept = "";
      if ( document.getElementById( "subdeptSection_" + survey_number ) ) {
        subdept = $( "[name=subdept_" + survey_number + "]:checked" ).value;
      }

      // Update the STD Q list on save
      updateSTDQList( survey_number, subdept );

      hidePopOver();
      return true;
    } else {
      return false;
    }


  }

  function popClearErrorMessages() {
    // Clears any existing messages in the popOver item
    var messageList = document.getElementById( "edit_messages" );
    while ( messageList.firstChild ) {
      messageList.removeChild( messageList.firstChild );
    }
  }

  function popAddErrorMessage( msg ) {
    // Add a new message to the popOver's error list
    var messageList = document.getElementById( "edit_messages" );
    return messageList.appendChild( msg );
  }

  function hidePopOver( survey_number, sel_ranks, sel_types ) {
    if ( window.event.preventDefault ) window.event.preventDefault();

    // Remove background blur and restore scrolling
    document.body.style.overflow = "scroll";
    window.removeEventListener( 'scroll', 'noScroll' );
    window.removeEventListener( 'mousewheel', 'noScroll' );
    window.removeEventListener( 'DOMMouseScroll', 'noScroll' );
    document.getElementById( "content" ).classList.remove( 'blur', 'grayout' );

    // Clear any existing messages
    popClearErrorMessages();

    document.getElementById( "popEdit" ).style.display = "none";
    document.getElementById( 'screen' ).style.display = "none";
  }

  // Limit user input to alpha chars and the dash, space, comma, ampersand chars.
  // CSS transforms this input to DISPLAY all UPPERCASE. The actual value is updated at validation.
  function inputAlpha( e ) {
    e = e || window.event;
    var key = e.keyCode || e.which;
    key = String.fromCharCode( key );

    var functionalKeys = [ 8, 9, 16, 17, 18, 91, 46, 127, 37, 38, 39, 40, 27, 192 ] // Delete, backspace, arrows, TAB, ESC, etc.
    var regex = /[A-Za-z\- &]/;

    e.returnValue = regex.test( key ) || ( functionalKeys.indexOf( parseInt( e.keyCode ) ) >= 0 );
    if ( !e.returnValue && e.preventDefault ) e.preventDefault();

  }

  // Clean up the input in case of bad user input
  // CSS is used with text-transform: uppercase to set the appearance to uppercase; onblur, the value is changed to uppercase also

  function validateName( name ) {

    popClearErrorMessages();

    // Set to UPPERCASE, trim multiple spaces, dashes, commas, ampersands
    name = name.toLocaleUpperCase().replace( / {2,}/g, " " ).replace( /\-{2,}/g, "-" );
    name = name.replace( /,{2,}/, "," ).replace( /&{2,}/, "&" );
    var err_message = document.createElement( 'li' ); // Make an element to show the validation result(s).
    // Next check for basic errors that can be flagged here. e.g. Name begins with a comma or space
    if ( name.match( /^[A-Z]{2,}(\s?[,&\-]?\s?[A-Z]+)*$/ ) ) {
      err_message.classList.add( 'valid' );
      err_message.style.opacity = 1;
      err_message.classList.add( 'fadeout' );
      err_message.innerText = "Instructor: Name is valid.";
      popAddErrorMessage( err_message );
      err_message.removeAttribute('style');

      return name;
    } else {
      err_message.classList.add( 'error' );
      err_message.innerText = ( name === "" || name === null ) ? "Instructor: This field is required." : "Instructor: Field data is not valid.";
      popAddErrorMessage( err_message );
      return false;
    }
  }

  function submitForm( e ) {
    e = e || window.event;
    if ( e.preventDefault ) e.preventDefault();
    e.returnValue = false; // For IE compatibility ... 
    document.getElementById( "srf_submit" ).disabled = true;
    document.getElementById( "srf_submit" ).value = "Processing ... Please wait.";

    //document.getElementById("srf_submit").disabled = false;
    //document.getElementById("srf_submit").value = "Submit Changes";
    document.getElementById( "srf" ).submit();
    // Somehow it would be good to re-enable it after submission ... in case the user goes back to the page.
  }

  // This function only changes the Sub Department variables. Then it calls updateSTDQList.
  function changeSubDepartment( survey_number, subdept ) {

    // Skip the whole method if there is no subdept <section>. Method should never be called this way.
    if ( document.getElementById( "subdeptSection_" + survey_number ) ) {
      var subdeptList = document.getElementById( "subdeptList_" + survey_number );

      // Then show the whole stdq section which is hidden by default before a subdept is chosen     
      var stdqSection = document.getElementById( "stdqSection_" + survey_number );
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


  function updateSTDQList( survey_number, subdept ) { // subdept param should be a String
    // Re-type as RegExp, and add the '|all' to cover stdq choices that are fit for all subdepartments
    subdept = RegExp( subdept + "|all" );

    // The <li> children of stdq <ul> are the different STD Q choices shown
    var stdqList = document.getElementById( "stdqList_" + survey_number ).children;
    var stdqDept, stdqRank; // These will be used to match STD Q choices to the course rank and subdept
    var courseRank = document.getElementById( "rank_" + survey_number ).dataset.rankCode;

    //First show/hide the appropriate individual questionnaires based on their 'data-esci' attributes
    for ( var i = 0; i < stdqList.length; i++ ) {
      stdqDept = stdqList[ i ].firstElementChild.dataset.esciDepartment;
      stdqRank = stdqList[ i ].firstElementChild.dataset.esciRank;

      // Each stdq must match on both rank and subdept to be displayed to the user
      if ( subdept.test( stdqDept ) && ( stdqRank.indexOf( courseRank ) ) != -1 ) {
        stdqList[ i ].removeAttribute( "hidden" );
      } else {
        stdqList[ i ].setAttribute( "hidden", true );
        // If the choice being hidden was already checked, set the checked radio back to
        // "Do not evaluate" (the default, element[0]) to avoid having an unselected radio group
        if ( stdqList[ i ].firstElementChild.checked ) {
          stdqList[ 0 ].firstElementChild.checked = true;
        }
      }
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
  ///////////////////////////////////////////////////////////////////////////////

  console.group( "Processing logic and event handlers" );
  console.timeStamp( "Processing logic and event handlers" );

  // First check what to display, if there is an errror message
  var errMsg = document.getElementById( "error_text" );
  // If there is no error to report, hide the error block
  if ( errMsg.innerText === "" ) {
    document.getElementById( "error_msg" ).style.display = "none";
  } // Else hide the other elements
  else {
    if(document.getElementById( "error_msg" )) document.getElementById( "error_msg" ).style.display = "block";
    if(document.getElementById( "heading" )) document.getElementById( "heading" ).style.display = "none";
    if(document.getElementById( "intro" )) document.getElementById( "intro" ).style.display = "none";
    if(document.getElementById( "list" )) document.getElementById( "list" ).style.display = "none";
  }

  // Does the main form exist?
  if ( document.getElementById( "srf" ) ) {
    document.getElementById( "srf" ).addEventListener( 'submit', submitForm );
  }

  console.timeStamp( "Adding handlers to <a> Edit course links" );
  // Event handlers for the <a>:"Edit Course Information" elements - 7/21/14 Tested OK
  for ( var i = 0; i < aEditCourseGroup.length; i++ ) {
    aEditCourseGroup[ i ].addEventListener( 'click', showPopOver.bind( null, aEditCourseGroup[ i ].id.replace( "editCourse_", "" ) ), false );
  }

  console.timeStamp( "Adding handlers for subdept Radio groups" );
  var subdeptRadios;
  // Loop over each group of Sub Department radio buttons
  for ( var j = 0, survey_number; j < subdeptULGroup.length; j++ ) {
    // Extract the Survey Number from the id field
    survey_number = subdeptULGroup[ j ].id.replace( "subdeptList_", "" );

    // An individual radio group for a single survey <div> block
    subdeptRadios = subdeptULGroup[ j ].children; // The children are <li> elements. Each <li> has a single <input> child.
    for ( var i = 0, subdept; i < subdeptRadios.length; i++ ) {
      subdept = subdeptRadios[ i ].firstElementChild.value;
      subdeptRadios[ i ].addEventListener( 'click', changeSubDepartment.bind( null, survey_number, subdept ) );
    }
  }

  // Add fadeout for any '.valid' elements, once the page has loaded
  forEach.call($('.valid', true ), function (node) { node.classList.add('fadeout');});

  console.timeStamp( "Finished." );
  console.groupEnd();

  console.timeEnd( "Beginning timeline profile." );
  console.log( "Finished loading web page" )
  console.profileEnd();
  console.groupEnd();
} )( window, document );
