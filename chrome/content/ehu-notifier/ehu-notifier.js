/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is EHU Notifier.
 *
 * The Initial Developer of the Original Code is
 * Borja Tornero <etxekalte@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// globals
var gParam;
var gUrl;

function ehunCheck() {
    dump("--- CHECK ---\n");
    
    getPref();
    if (gUser != "") {
		// asynchronous xml http request
		var httpReq = new XMLHttpRequest();
		httpReq.open('POST', 'https://www.ehu.es/cgi-bin/postman', true);
		httpReq.onreadystatechange = function () {
			if (httpReq.readyState == 4 && httpReq.status == 200) {
				var htmldoc = new String(httpReq.responseText);
	        
				// Get the url of the inbox page
				if (htmldoc.search(/cclient/) != -1) {
					var indexA = htmldoc.search(/cclient/);
					var indexB = htmldoc.search(/mail.gif/);
					var subUrl = htmldoc.substring(indexA, indexB);
					if (subUrl.search(/default/) != -1) {
						subUrl = htmldoc.substring(indexA, indexB - 44);
					}
					else {
						subUrl = htmldoc.substring(indexA, indexB - 41);
					}
					gUrl = "https://www.ehu.es/cgi-bin/postman/" + subUrl;
					dump("URL: " + gUrl + "\n");
				}	

				var s1 = htmldoc.search(/Correo/);
				var s2 = htmldoc.substring(s1);
				var p1 = s2.search(/\(/);
				var p2 = s2.search(/\)/);
				var msg = s2.slice(p1 + 1, p2);
				var num = 0;

				// Spanish
				if (gLang == "spa") {
					msg = msg.replace("&iacute;", "í");

					if (htmldoc.search(/No tienes/) == -1) {
						var position = htmldoc.search(/Tienes/);
						num = htmldoc.charAt(position + 7);
					}
				}
				// Basque
				else if (gLang == "eus") {
					if (htmldoc.search(/bat/) != -1) {
						num = 1;
					}
					else if (htmldoc.search(/Ez/) == -1) {
						var position = htmldoc.search(/mezu/);
						num = htmldoc.charAt(position - 2);
					}
				}
				// English
				else if (gLang == "eng") {
					if (htmldoc.search(/No/) == -1) {
						var position = htmldoc.search(/have/);
						num = htmldoc.charAt(position +  5);
					}
				}

				if (num == "Y") {
					num = "Error";
				}

				dump("mensajes: "+ num + "\n");

				// Put the number of new emails
				document.getElementById('num').value = num;
				document.getElementById('msg').value = msg;

				// Change the image if there is new mail
				if (num == 0) {
				    document.getElementById('image').src =
					"chrome://ehu-notifier/skin/ehun.png";		    
				}
				else if (num == "Error") {
				    document.getElementById('image').src =
					"chrome://ehu-notifier/skin/ehun3.png"; 
				}
				else
				{
				    document.getElementById('image').src =
					"chrome://ehu-notifier/skin/ehun2.png"; 
				}

				ehunUnread();
			}	    
			else {
				dump("Error loading page\n");
			}
		};
		httpReq.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		
		var gParam = "user=" + gUser+ "&pw=" + gPass+ "&imapserver=" + gServer 
					+ "&lang=" + gLang + "&cmd=login";
		dump(gParam + "\n");
		httpReq.send(gParam);
    }
    
	//Check every gInterval minutes
    var intervalMiliSec = gInterval * 60 * 1000;
    setTimeout(ehunCheck, intervalMiliSec);
}

function ehunUnread(){
    dump("--- UNREAD ---\n");
	var sum = "";
	var httpReq = new XMLHttpRequest();
    httpReq.open('GET', gUrl, true);
	httpReq.onreadystatechange = function () {
		if (httpReq.readyState == 4) {	
			if(httpReq.status == 200) {
				var m1 = httpReq.responseText;
				
				// Delete all info from tooltip
				var tipbox = document.getElementById("tipbox");
				//dump(tipbox.childNodes.length + "\n");
				var l = tipbox.childNodes.length - 1;
				for (i = l; i > 0; i--) {
				    tipbox.removeChild(tipbox.childNodes[i]);
				}
				
				// Loop over unread messages
				while(m1.search(/flag_unseen/) > 0) {
					// Sender
					var f = m1.search(/flag_unseen/);
					var m2 = m1.substring(f + 12);
					var s1 = m2.search(/size/);
					var m3 = m2.substring(s1 + 5);
					var s2 = m3.search(/size/);
					var m4 = m3.substring(s2);
					var b1 = m4.search(/<B>/);
					var b2 = m4.search(/<\/B>/);
					var se = m4.slice(b1 + 3, b2);
					var sender = ehunReplace(se);
					dump(sender + "\n");
					
					// Subject
					var h = m4.search(/HREF/);
					var m5 = m4.substring(h);
					var g = m5.search(/>/);
					var a = m5.search(/<\/A>/);
					var su = m5.slice(g + 1, a);
					var subject = ehunReplace(su); 
					dump(subject + "\n");
					
					// Add tooltip with sender and subject
					var desc = document.createElement("description");
					desc.setAttribute("class", "header");
					desc.setAttribute("value", sender);
					tipbox.appendChild(desc);
					desc = document.createElement("description");
					desc.setAttribute("value", subject);
					tipbox.appendChild(desc);
					var m1 = m5;
				}
			}
			else {
				dump("Error loading page\n");
			}
		}
	};
	httpReq.send(null);
}

function ehunReplace(str)
{
	str = str.replace(/&aacute;/g, "á");
	str = str.replace(/&eacute;/g, "é");
	str = str.replace(/&iacute;/g, "í");
	str = str.replace(/&oacute;/g, "ó");
	str = str.replace(/&uacute;/g, "ú");
	str = str.replace(/&uuml;/g, "ü");
	str = str.replace(/&ntilde;/g, "ñ");
	str = str.replace(/&#91;/g, "[");
	str = str.replace(/&#93;/g, "]");
	str = str.replace(/&#34;/g, "\"");
	return(str);
}

function ehunShowPopup() {
    dump("--- HIDEPOPUP ---\n");
    
    gUser = gPrefManager.getCharPref("extensions.ehu-notifier.username");
    if (gUser == "") {
		document.getElementById('ehun-menu-check').setAttribute("disabled", true);
    }
    else {
    	document.getElementById('ehun-menu-check').setAttribute("disabled", false);
    }
}    

function ehunGo(event) {
    dump("--- GO ---\n");
    
    if (event.button == 0) { 
		var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
       			     .getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = windowMediator.getEnumerator("navigator:browser");
		var browserInstance = browserEnumerator.getNext().getBrowser(); 
        
		// create tab and focus
		var newTab = browserInstance.addTab(gUrl);
		browserInstance.selectedTab = newTab;
    }
}

function ehunConfigure() {
    dump("--- CONFIGURE ---\n");
    
    window.openDialog("chrome://ehu-notifier/content/options.xul", "_blank", "centerscreen,chrome,resizable=no,dependent=yes");
}

function ehunAbout() {
    dump("--- ABOUT ---\n");
    
    window.openDialog("chrome://ehu-notifier/content/about.xul");
}

window.addEventListener("load", ehunCheck, false);
