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

function ehunInit() {
	dump("--- INIT ---\n");
    
    getPref();
    if (gUser != "") {
		// asynchronous xml http request
		var httpReq = new XMLHttpRequest();
		httpReq.open('POST', 'https://www.ehu.es/horde/imp/redirect.php', true);
		httpReq.onreadystatechange = function () {
			if (httpReq.readyState == 4 && httpReq.status == 200) {
				var htmldoc = new String(httpReq.responseText);
				if(htmldoc.search(/notice/) != -1) {
					dump("Login failed. Check login data\n");
					ehunNum("Error");
				}
				else {
					dump("Login successfull\n");
					ehunCheck();
				}
			}	    
			else {
				dump("Error loading page\n");
			}
		};
		httpReq.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		
		var gParam = "imapuser=" + gUser+ "&pass=" + gPass+ "&server_key=" + gServer 
					+ "&new_lang=" + gLang;
		dump(gParam + "\n");
		httpReq.send(gParam);
	}
}

function ehunCheck() {
    dump("--- CHECK ---\n");
    
    getPref();
    if (gUser != "") {
		// asynchronous xml http request
		var httpReq = new XMLHttpRequest();
		httpReq.open('POST', 'https://www.ehu.es/horde/imp/redirect.php', true);
		httpReq.onreadystatechange = function () {
			if (httpReq.readyState == 4 && httpReq.status == 200) {
				var htmldoc = new String(httpReq.responseText);
				if(htmldoc.search(/enter_key_trap/) != -1) {	
					dump("Login failed. Check login data\n");
					ehunNum("Error");
				}
				else {
					dump("Login successfull\n");
					ehunNum(htmldoc);
				}
			}	    
			else {
				dump("Error loading page\n");
			}
		};
		httpReq.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		
		var gParam = "imapuser=" + gUser+ "&pass=" + gPass+ "&server_key=" + gServer 
					+ "&new_lang=" + gLang;
		dump(gParam + "\n");
		httpReq.send(gParam);
    }
    
	//Check every gInterval minutes
    var intervalMiliSec = gInterval * 60 * 1000;
    setTimeout(ehunCheck, intervalMiliSec);
}

function ehunNum(h){
    dump("--- NUM ---\n");

	var num = 0;
	if(h.match(/Error/)) {
			num = "Error";
	}
	else {
		var t1 = h.search(/title/);
		var h2 = h.substring(t1 + 6);
		var t2 = h2.search(/<\/title/);
		var title = h2.slice(0, t2);
		dump(title + "\n");
		
		var num = 0;
		var t3 = title.search(/\(/);
		if(t3 != -1) {
			var t4 = title.search(/\)/);
			num = title.slice(++t3, t4);
		}
	}
	dump("Mensajes nuevos: " + num + "\n");

	// Put the number of new emails
	document.getElementById('num').value = num;
		
	// Change the image and message
	var img;
	var msg;
	switch(num) {
		case "Error":
			img = "chrome://ehu-notifier/skin/ehun3.png"; 
			
			switch(gLang) {
				case "en_US":
					msg = "Some kind of error has ocurred";
					break;
				case "es_ES":
					msg = "Ha sucedido algún tipo de error";
					break;
				case "eu_ES":
					msg = "Erroren bat gertatu da";
					break;
			}	
			break;
		case 0:
			img = "chrome://ehu-notifier/skin/ehun.png";		    
			
			switch(gLang) {
				case "en_US":
					msg = "There is no unread messages";
					break;
				case "es_ES":
					msg = "No hay mensajes nuevos";
					break;
				case "eu_ES":
					msg = "Ez dago mezu berririk";
					break;
			}
			break;
		case 1:
			img = "chrome://ehu-notifier/skin/ehun2.png"; 
				
			switch(gLang) {
				case "en_US":
					msg = "There is a new message";
					break;
				case "es_ES":
					msg = "Hay un mensaje nuevo";
					break;
				case "eu_ES":
					msg = "Mezu berri bat dago";
					break;
			}
			break;
		default:	
			img = "chrome://ehu-notifier/skin/ehun2.png";
			
			switch(gLang) {
				case "en_US":
					msg = "There are " + num + " new messages";
					break;
				case "es_ES":
					msg = "Hay " + num + " mensajes sin leer";
					break;
				case "eu_ES":
					msg = num + " mezu berri daude";
					break;
			}
	}
	document.getElementById('image').src = img; 
	document.getElementById('msg').value = msg;
	
	ehunUnread();
}

function ehunUnread() {
    dump("--- UNREAD ---\n");

	var sum = "";
	var httpReq = new XMLHttpRequest();
    httpReq.open('GET', "https://www.ehu.es/horde/imp/", true);
	httpReq.onreadystatechange = function () {
		if(httpReq.readyState == 4 && httpReq.status == 200) {	
			var mailbox = httpReq.responseText;
			
			// Delete all info from tooltip
			var tipbox = document.getElementById("tipbox");
			//dump(tipbox.childNodes.length + "\n");
			var l = tipbox.childNodes.length - 1;
			for (i = l; i > 0; i--) {
				tipbox.removeChild(tipbox.childNodes[i]);
			}
				
			var tml1 = mailbox.search(/messageList/);
			var mailbox2 = mailbox.substring(tml1);
			var tml2 = mailbox2.search(/\<\/table>/);
			var m = mailbox2.slice(0, tml2);
			//dump(m);
			// Loop over unread messages
			while(m.search(/mail_unseen/) > 0) {
				// Sender
				var m1 = m.search(/mail_unseen/);
				var m2 = m.substring(m1 + 150);
				var s1 = m2.search(/title/);
				var m3 = m2.substring(s1 + 5);
				var s2 = m3.search(/\<b/);
				var s3 = m3.search(/<\/b/);
				var sender = m3.slice(s2 +3, s3);
				dump(sender + "\n");
			
				
				// Subject
				var s4 = m3.search(/title/);
				var m4 = m3.substring(s4 + 7);
				var s5 = m4.search(/\"/);
				var subject = m4.slice(0, s5);
				dump(subject + "\n");
				
				
				// Add tooltip with sender and subject
				var desc = document.createElement("description");
				desc.setAttribute("class", "header");
				desc.setAttribute("value", sender);
				tipbox.appendChild(desc);
				desc = document.createElement("description");
				desc.setAttribute("value", subject);
				tipbox.appendChild(desc);
				
				m = m.substring(m1 + 10);
			}
		}
		else {
			dump("Error loading page\n");
		}
	};
	httpReq.send(null);
}

function ehunReplace(str)
{
	dump("--- REPLACE ---\n");

	str = str.replace(/&aacute;/g, "á");
	str = str.replace(/&eacute;/g, "é");
	str = str.replace(/&iacute;/g, "í");
	str = str.replace(/&oacute;/g, "ó");
	str = str.replace(/&uacute;/g, "ú");
	str = str.replace(/&Aacute;/g, "á");
	str = str.replace(/&Eacute;/g, "é");
	str = str.replace(/&Iacute;/g, "í");
	str = str.replace(/&Oacute;/g, "ó");
	str = str.replace(/&Uacute;/g, "ú");
	str = str.replace(/&uuml;/g, "ü");
	str = str.replace(/&Uuml;/g, "ü");
	str = str.replace(/&ntilde;/g, "ñ");
	str = str.replace(/&Ntilde;/g, "ñ");
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
		var newTab = browserInstance.addTab("https://www.ehu.es/horde/");
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

window.addEventListener("load", ehunInit, false);
