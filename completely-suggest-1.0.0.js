/**
 * completely-suggest.js
 *
 * MIT Licensing
 * Copyright (c) 2014 Tom Medema, based on work by Lorenzo Puccetti.
 * 
 * This Software shall be used for doing good things, not bad things.
 * 
**/

window.completelySuggest = function(txtInput, config) {
    config = config || {};
    config.fontSize =                       config.fontSize   || getStyle(txtInput, 'font-size');
    config.fontFamily =                     config.fontFamily || getStyle(txtInput, 'font-family');
    config.promptInnerHTML =                config.promptInnerHTML || ''; 
    config.color =                          config.color || getStyle(txtInput, 'color');
    config.hintColor =                      config.hintColor || '#aaa';
    config.backgroundColor =                config.backgroundColor || '#fff';
    config.dropDownBorderColor =            config.dropDownBorderColor || '#aaa';
    config.dropDownZIndex =                 config.dropDownZIndex || '100'; // to ensure we are in front of everybody
    config.dropDownOnHoverBackgroundColor = config.dropDownOnHoverBackgroundColor || '#ddd';
    config.ignoreCase = (typeof config.ignoreCase === 'boolean') ? config.ignoreCase : true;

    txtInput.setAttribute('spellcheck', 'false');
    txtInput.setAttribute('autocomplete', 'off');
    txtInput.style.fontSize =        config.fontSize;
    txtInput.style.fontFamily =      config.fontFamily;
    txtInput.style.color =           config.color;
    txtInput.style.backgroundColor = config.backgroundColor;
    txtInput.className += ' completely-input';
    txtInput.style.backgroundColor ='transparent';
    txtInput.placeholder_orig = txtInput.placeholder;
    
    var txtHint = txtInput.cloneNode();
    txtHint.style.position = 'absolute';
    txtHint.style.borderColor = 'transparent';
    txtHint.style.boxShadow = 'none';
    txtHint.style.color = config.hintColor;
    txtHint.style.zIndex = -1;
    if (txtHint.getAttribute('placeholder')) txtHint.removeAttribute('placeholder');
    txtHint.setAttribute('disabled', 'disabled');
    if (txtHint.className) txtHint.className = txtHint.className.replace('completely-input', 'completely-hint');
        
    var dropDown = document.createElement('div');
    dropDown.style.position = 'absolute';
    dropDown.style.visibility = 'hidden';
    dropDown.style.outline = '0';
    dropDown.style.margin =  '0';
    dropDown.style.padding = '0';  
    dropDown.style.textAlign = 'left';
    dropDown.style.fontSize =   config.fontSize;      
    dropDown.style.fontFamily = config.fontFamily;
    dropDown.style.backgroundColor = config.backgroundColor;
    dropDown.style.zIndex = config.dropDownZIndex; 
    dropDown.style.cursor = 'default';
    dropDown.style.borderStyle = 'solid';
    dropDown.style.borderWidth = '1px';
    dropDown.style.borderColor = config.dropDownBorderColor;
    dropDown.style.overflowX= 'hidden';
    dropDown.style.whiteSpace = 'pre';
    dropDown.style.overflowY = 'auto';  // note: this might be ugly when the scrollbar is not required. however in this way the width of the dropDown takes into account
    dropDown.className = 'completely-dropdown';
    dropDown.style.maxHeight = (txtInput.clientHeight * 10) + 'px';

    var pTop = getStyle(txtInput, 'padding-top');
    var pBot = getStyle(txtInput, 'padding-bottom');
    var pLeft = getStyle(txtInput, 'padding-left');
    var pRight = getStyle(txtInput, 'padding-right');
    if (pTop) dropDown.style.paddingTop = pTop;
    if (pBot) dropDown.style.paddingBottom = pBot;
    
    var createDropDownController = function(elem) {
        var rows = [];
        var ix = 0;
        var oldIndex = -1;
        
        var onMouseOver =  function() { this.style.outline = '1px solid #ddd'; }
        var onMouseOut =   function() { this.style.outline = '0'; }
        var onMouseDown =  function() { p.hide(); p.onmouseselection(this.__hint); }
        
        var p = {
            hide :  function(hint) { 
                elem.style.visibility = 'hidden';
                if (hint !== false) txtHint.style.visibility = 'hidden';
                txtInput.placeholder = txtInput.placeholder_orig;
            },
            show :  function() { 
                elem.style.visibility = 'visible';
                txtHint.style.visibility = 'visible';
                txtInput.placeholder = '';
            }, 
            refresh : function(token, array) {
                elem.style.visibility = 'hidden';
                ix = 0;
                elem.innerHTML ='';
                
                rows = [];
                for (var i=0;i<array.length;i++) {
                    var _token = config.ignoreCase ? token.toLowerCase() : token,
                        _entry = config.ignoreCase ? array[i].toLowerCase() : array[i],
                        _normalizedToken = array[i].substring(0, token.length);
                    if (_entry.indexOf(_token)!==0) { continue; }
                    var divRow =document.createElement('div');
                    if (pLeft) divRow.style.paddingLeft = pLeft;
                    if (pRight) divRow.style.paddingRight = pRight;
                    divRow.style.color = config.color;
                    divRow.onmouseover = onMouseOver; 
                    divRow.onmouseout =  onMouseOut;
                    divRow.onmousedown =  onMouseDown;
                    
                    divRow.__hint = token + array[i].substring(token.length); //array[i];
                    divRow.innerHTML = _normalizedToken+'<b>'+array[i].substring(token.length)+'</b>';
                    rows.push(divRow);
                    elem.appendChild(divRow);
                }
                if ((rows.length===1 && token === rows[0].__hint) || rows.length < 2) {
                    
                    // do not show the dropDown if it has only one element which matches what we have just displayed.
                    return (document.activeElement === txtInput) ? p.hide(false) : p.hide();
                }
                
                //always highlight the first suggestion
                p.highlight(0);

                //hide initially if input is not focused
                (document.activeElement === txtInput) ? p.show() : p.hide();

            },
            highlight : function(index) {
                if (oldIndex !=-1 && rows[oldIndex]) { 
                    rows[oldIndex].style.backgroundColor = config.backgroundColor;
                }
                rows[index].style.backgroundColor = config.dropDownOnHoverBackgroundColor; // <-- should be config
                oldIndex = index;
            },
            move : function(step) { // moves the selection either up or down (unless it's not possible) step is either +1 or -1.
                if (elem.style.visibility === 'hidden')             return ''; // nothing to move if there is no dropDown. (this happens if the user hits escape and then down or up)
                if (ix+step === -1 || ix+step === rows.length) return rows[ix].__hint; // NO CIRCULAR SCROLLING. 
                ix+=step; 
                p.highlight(ix);
                return rows[ix].__hint;//txtShadow.value = uRows[uIndex].__hint ;
            },
            onmouseselection : function() {} // it will be overwritten. 
        };
        return p;
    }
    
    var dropDownController = createDropDownController(dropDown);
    
    dropDownController.onmouseselection = function(text) {
        txtInput.value = txtHint.value = leftSide+text; 
        rs.onChange(txtInput.value); // <-- forcing it.
        registerOnTextChangeOldValue = txtInput.value; // <-- ensure that mouse down will not show the dropDown now.
        setTimeout(function() { txtInput.focus(); },0);  // <-- I need to do this for IE 
    }

    //set dynamic positions and sizes
    dropDown.style.top = txtInput.offsetTop + txtInput.clientHeight + txtInput.clientTop + 'px';
    dropDown.style.left = txtInput.offsetLeft + 'px';
    dropDown.style.width = txtInput.clientWidth + txtInput.clientLeft + 'px';

    //add to container
    var container = txtInput.parentNode;
    container.insertBefore(dropDown, txtInput);
    container.insertBefore(txtHint, txtInput);

    //avoid duplicate IDs when possible, while preserving styles
    if (txtHint.getAttribute('id') && window.getComputedStyle) {
        txtHint.style.cssText = window.getComputedStyle(txtHint, '').cssText;
        txtHint.removeAttribute('id');
    }
    
    var spacer; 
    var leftSide; // <-- it will contain the leftSide part of the textfield (the bit that was already autocompleted)   
    
    var rs = { 
        onArrowDown : function() {},               // defaults to no action.
        onArrowUp :   function() {},               // defaults to no action.
        onEnter :     function() {},               // defaults to no action.
        onTab :       function() {},               // defaults to no action.
        onChange:     function() { rs.repaint() }, // defaults to repainting.
        startFrom:    0,
        options:      [],
        setText : function(text) {
            txtHint.value = text;
            txtInput.value = text; 
        },
        getText : function() {
            return txtInput.value; 
        },
        hideDropDown : function() {
            dropDownController.hide();
        },
        repaint : function() {
            var text = txtInput.value;
            var startFrom =  rs.startFrom; 
            var options =    rs.options;
            var optionsLength = options.length; 
            
            // breaking text in leftSide and token.
            var token = text.substring(startFrom);
            leftSide =  text.substring(0,startFrom);
            
            // updating the hint. 
            txtHint.value ='';
            for (var i=0;i<optionsLength;i++) {
                var opt = options[i];
                if (opt.indexOf(token)=== 0 || config.ignoreCase && opt.toLowerCase().indexOf(token.toLowerCase()) === 0) { 
                    if(config.ignoreCase){
                        var opt = token + opt.substring(token.length)
                    }
                    txtHint.value = leftSide +opt;
                    break;
                }
            }
            
            dropDownController.refresh(token, rs.options);
        }
    };

    //show drop down on focus and hide on blur
    if (txtInput.addEventListener) {
        txtInput.addEventListener('focus',  rs.repaint, false);
        txtInput.addEventListener('blur',  rs.repaint, false);
    }
    else {
        txtInput.attachEvent('onfocusin', rs.repaint); // IE<9
        txtInput.attachEvent('onfocusout', rs.repaint); // IE<9
    }
    
    var registerOnTextChangeOldValue;

    /**
     * Register a callback function to detect changes to the content of the input-type-text.
     * Those changes are typically followed by user's action: a key-stroke event but sometimes it might be a mouse click.
    **/
    var registerOnTextChange = function(txt, callback) {
        registerOnTextChangeOldValue = txt.value;
        
        var handler = function() {
            var value = txt.value;
            if (registerOnTextChangeOldValue !== value) {
                registerOnTextChangeOldValue = value;
                callback(value);
            }
        };

        //  
        // For user's actions, we listen to both input events and key up events
        // It appears that input events are not enough so we defensively listen to key up events too.
        // source: http://help.dottoro.com/ljhxklln.php
        //
        // The cost of listening to three sources should be negligible as the handler will invoke callback function
        // only if the text.value was effectively changed. 
        //  
        // 
        if (txt.addEventListener) {
            txt.addEventListener("input",  handler, false);
            txt.addEventListener('keyup',  handler, false);
            txt.addEventListener('change', handler, false);
        }
        else {
            txt.attachEvent('oninput', handler); // IE<9
            txt.attachEvent('onkeyup', handler); // IE<9
            txt.attachEvent('onchange',handler); // IE<9
        }
    };
    
    
    registerOnTextChange(txtInput,function(text) { // note the function needs to be wrapped as API-users will define their onChange
        rs.onChange(text);
    });
    
    
    var keyDownHandler = function(e) {
        e = e || window.event;
        var keyCode = e.keyCode;
        
        if (keyCode == 33) { return; } // page up (do nothing)
        if (keyCode == 34) { return; } // page down (do nothing);
        
        if (keyCode == 27) { //escape
            dropDownController.hide();
            txtHint.value = txtInput.value; // ensure that no hint is left.
            txtInput.focus(); 
            return; 
        }
        
        if (keyCode == 39 || keyCode == 35 || keyCode == 9) { // right,  end, tab  (autocomplete triggered)
            if (keyCode == 9) { // for tabs we need to ensure that we override the default behaviour: move to the next focusable HTML-element 
                e.preventDefault ? (e.preventDefault() && e.stopPropagation()) : window.event.returnValue = false;
                if (txtHint.value.length == 0) {
                    rs.onTab(); // tab was called with no action.
                                // users might want to re-enable its default behaviour or handle the call somehow.
                }
            }
            if (txtHint.value.length > 0) { // if there is a hint
                dropDownController.hide();
                txtInput.value = txtHint.value;
                var hasTextChanged = registerOnTextChangeOldValue != txtInput.value
                registerOnTextChangeOldValue = txtInput.value; // <-- to avoid dropDown to appear again. 
                                                          // for example imagine the array contains the following words: bee, beef, beetroot
                                                          // user has hit enter to get 'bee' it would be prompted with the dropDown again (as beef and beetroot also match)
                if (hasTextChanged) {
                    rs.onChange(txtInput.value); // <-- forcing it.
                }
            }
            return; 
        }
        
        if (keyCode == 13) {       // enter  (autocomplete triggered)
            if (txtHint.value.length == 0) { // if there is a hint
                rs.onEnter();
            } else {
                var wasDropDownHidden = (dropDown.style.visibility == 'hidden');
                dropDownController.hide();
                
                if (wasDropDownHidden) {
                    txtHint.value = txtInput.value; // ensure that no hint is left.
                    txtInput.focus();
                    rs.onEnter();    
                    return; 
                }
                
                txtInput.value = txtHint.value;
                var hasTextChanged = registerOnTextChangeOldValue != txtInput.value
                registerOnTextChangeOldValue = txtInput.value; // <-- to avoid dropDown to appear again. 
                                                          // for example imagine the array contains the following words: bee, beef, beetroot
                                                          // user has hit enter to get 'bee' it would be prompted with the dropDown again (as beef and beetroot also match)
                if (hasTextChanged) {
                    rs.onChange(txtInput.value); // <-- forcing it.
                }
                
            }
            return; 
        }
        
        if (keyCode == 40) {     // down
            var m = dropDownController.move(+1);
            if (m == '') { rs.onArrowDown(); }
            txtHint.value = leftSide+m;
            return; 
        } 
            
        if (keyCode == 38 ) {    // up
            var m = dropDownController.move(-1);
            if (m == '') { rs.onArrowUp(); }
            txtHint.value = leftSide+m;
            e.preventDefault ? (e.preventDefault() && e.stopPropagation()) : window.event.returnValue = false;
            return; 
        }
            
        // it's important to reset the txtHint on key down.
        // think: user presses a letter (e.g. 'x') and never releases... you get (xxxxxxxxxxxxxxxxx)
        // and you would see still the hint
        txtHint.value =''; // resets the txtHint. (it might be updated onKeyUp)
        
    };
    
    if (txtInput.addEventListener) {
        txtInput.addEventListener("keydown",  keyDownHandler, false);
    }
    else {
        txtInput.attachEvent('onkeydown', keyDownHandler); // IE<9
    }
    return rs;

    function getStyle(oElm, strCssRule){
        var strValue = "";
        if(document.defaultView && document.defaultView.getComputedStyle){
            strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
        }
        else if(oElm.currentStyle){
            strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
                return p1.toUpperCase();
            });
            strValue = oElm.currentStyle[strCssRule];
        }
        return strValue;
    }
};