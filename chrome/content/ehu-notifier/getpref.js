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
 * The Original Code is EHU Mail Notifier.
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
var gUser;
var gPass;
var gServer;
var gLang;
var gInterval;
var gPrefManager;
var gPassManager;
const URL = "chrome://ehu-notifier/";

function getPref() {
    dump("--- GETPREF ---\n");
    
    // get the preferences
    gPrefManager = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefBranch);
    gUser = gPrefManager.getCharPref("extensions.ehu-notifier.username");            
    gServer = gPrefManager.getCharPref("extensions.ehu-notifier.server");
    gInterval =	gPrefManager.getIntPref("extensions.ehu-notifier.interval");
    lang = gPrefManager.getCharPref("general.useragent.locale"); 
	if(lang.match(/^es/)) {
		gLang = "spa";
	}
	else if(lang.match(/^eu/)) {
		gLang = "eus";
	}
	else if(lang.match(/^en/)) {
		gLang = "eng";
	}

    // get the password from password manager
    gPassManager = Components.classes["@mozilla.org/passwordmanager;1"].createInstance();
    if (gPassManager) {
		var passManagerInt = gPassManager.QueryInterface(Components.interfaces.nsIPasswordManagerInternal);
    }	      
		var tempHost = new Object();
		var tempUser = new Object();
		var tempPass = new Object();
    try {
    	passManagerInt.findPasswordEntry(URL, gUser, "", tempHost, tempUser, tempPass);
    	gPass = tempPass.value;
		dump(gPass + "\n");
    }
    catch(e) {
        dump("Unable to get password for " + gUser + ": " + e +"\n");
    }	
    if (gPass == undefined) {
		gPass = "";
    }	
}
