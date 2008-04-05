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

var gParam;
var gUrl;

function ehunCheck() {
    dump("--- CHECK ---\n");
    
    getPref();
    if (gUser != "") {
	httpReq = new XMLHttpRequest();
	httpReq.open('POST', 'https://www.ehu.es/cgi-bin/postman', true);
	httpReq.onreadystatechange = function () {
	    if (httpReq.readyState == 4) 
		if (httpReq.status == 200) {
		    htmldoc = new String(httpReq.responseText);
	        
			// Get the url of the inbox page
		    if (htmldoc.search(/cclient/) != -1) {
				indexA = htmldoc.search(/cclient/);
				indexB = htmldoc.search(/mail/);
				subUrl = htmldoc.substring(indexA, indexB);
				if (subUrl.search(/default/) != -1) {
					subUrl = htmldoc.substring(indexA, indexB - 44);
				}
				else {
					subUrl = htmldoc.substring(indexA, indexB - 41);
				}
		        gUrl = "https://www.ehu.es/cgi-bin/postman/" + subUrl;
				dump("URL: " + gUrl + "\n");
		    }	

		    if ( gLang == "spa") {
				search = htmldoc.search(/Correo/);
				s2 = htmldoc.substring(search);
				p0 = s2.search(/\(/);
				p1 = s2.search(/\)/);
				msg = s2.slice(p0 + 1, p1);
				msg = msg.replace("&iacute;", "í");

				if (htmldoc.search(/No tienes/) != -1) {
					num = 0;
				}    
				else {
					pos = htmldoc.search(/Tienes/);
					num = htmldoc.charAt(pos +  7);
				}
		    }
		    else if (gLang == "eus") {
				search = htmldoc.search(/Correo/);
				s2 = htmldoc.substring(search);
				p0 = s2.search(/\(/);
				p1 = s2.search(/\)/);
				msg = s2.slice(p0 + 1, p1);

				if (htmldoc.search(/Ez/) != -1) {
					num = 0;
				}    
				else if (htmldoc.search(/bat/) != -1) {
					num = 1;
				}
				else {
					pos = htmldoc.search(/mezu/);
					num = htmldoc.charAt(pos - 2);
				}
		    }
		    else if (gLang == "eng") {
				search = htmldoc.search(/Correo/);
				s2 = htmldoc.substring(search);
				p0 = s2.search(/\(/);
				p1 = s2.search(/\)/);
				msg = s2.slice(p0 + 1, p1);
			
				if (htmldoc.search(/No/) != -1) {
					num = 0;
				}    
				else {
					pos = htmldoc.search(/have/);
					num = htmldoc.charAt(pos +  5);
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
	gParam = "user=" + gUser+ "&pw=" + gPass+ "&imapserver=" + gServer + "&lang=" + gLang 
            + "&cmd=login";
	dump(gParam + "\n");
	httpReq.send(gParam);
    }
    
	//Check every gInterval minutes
    intervalMiliSec = gInterval * 60 * 1000;
    setTimeout(ehunCheck, intervalMiliSec);
}

function ehunUnread(){
    dump("--- UNREAD ---\n");
	var sum = "";
	httpReq = new XMLHttpRequest();
    httpReq.open('GET', gUrl, true);
	httpReq.onreadystatechange = function () {
		if (httpReq.readyState == 4) {	
			if(httpReq.status == 200) {
				mailbox = httpReq.responseText;
				tipbox = document.getElementById("tipbox");
				dump(tipbox.childNodes.length + "\n");
				l = tipbox.childNodes.length - 1;
				for (i = l; i > 0 ; i--) {
				  tipbox.removeChild(tipbox.childNodes[i]);
				}
				while(mailbox.search(/flag_unseen/) > 0) {
					f = mailbox.search(/flag_unseen/);
					mailbox2 = mailbox.substring(f + 12);
					s = mailbox2.search(/size/);
					mailbox3 = mailbox2.substring(s + 5);
					t = mailbox3.search(/size/);
					mailbox4 = mailbox3.substring(t);
					u = mailbox4.search(/<B>/);
					v = mailbox4.search(/<\/B>/);
					sender = mailbox4.slice(u + 3, v);
					dump(sender + "\n");
					w = mailbox4.search(/HREF/);
					mailbox5 = mailbox4.substring(w);
					x = mailbox5.search(/>/);
					y = mailbox5.search(/<\/A>/);
					subject = mailbox5.slice(x + 1, y);
					dump(subject + "\n");
					desc = document.createElement("description");
					desc.setAttribute("class", "header");
					desc.setAttribute("value", sender);
					tipbox.appendChild(desc);
					desc = document.createElement("description");
					desc.setAttribute("value", subject);
					tipbox.appendChild(desc);
					mailbox = mailbox5;
				}
			}
			else {
				dump("Error loading page\n");
			}
		}
	};
	httpReq.send(null);
}

function ehunShowPopup() {
    dump("--- HIDEPOPUP ---\n");
    
    gUser = gPrefManager.getCharPref("extensions.ehu-notifier.username");
    if (gUser == "") {
	document.getElementById('ehun-context-menu-check').setAttribute("disabled", true);
    }
    else {
    	document.getElementById('ehun-context-menu-check').setAttribute("disabled", false);
    }
}    

function ehunGo(event) {
    dump("--- GO ---\n");
    
    if (event.button == 0) { 
	windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
       			     .getService(Components.interfaces.nsIWindowMediator);
	browserEnumerator = windowMediator.getEnumerator("navigator:browser");
	browserInstance = browserEnumerator.getNext().getBrowser(); 
        
	// create tab and focus
	newTab = browserInstance.addTab(gUrl);
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
