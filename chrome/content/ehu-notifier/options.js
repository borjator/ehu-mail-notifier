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

function ehunConfigure() {
    dump("--- CONFIGURE ---\n");

    window.openDialog("chrome://ehu-notifier/content/options.xul");
}

function ehunFill() {
    dump("--- FILL ---\n");

    getPref();
    document.getElementById('username').value = gUser;
    document.getElementById('password').value = gPass;
    document.getElementById('server').value = gServer;
    document.getElementById('lang').value = gLang;
    document.getElementById('interval').value = gInterval;
}

function ehunClose() {
    dump("--- ECLOSE ---\n");
    
    userOld = gUser;
    gUser = document.getElementById('username').value;
    gPass= document.getElementById('password').value;
    gServer = document.getElementById('server').value;
    gLang = document.getElementById('lang').value;
    gInterval = document.getElementById('interval').value;
    
    dump(gUser + ":" + gPass+ ":" + gServer + ":" + gLang +
	    ":" + gInterval + "\n");
    
    gPrefManager.setCharPref("extensions.ehu-notifier.username", gUser);            
    gPrefManager.setCharPref("extensions.ehu-notifier.server", gServer);
    gPrefManager.setCharPref("extensions.ehu-notifier.language", gLang);
    gPrefManager.setIntPref("extensions.ehu-notifier.interval", gInterval);

    if (gPassManager) {
	passManager = gPassManager.QueryInterface(Components.interfaces.nsIPasswordManager);
    }
    try {
	passManager.removeUser(URL, userOld);
    }
    catch (e) {
    }
    passManager.addUser(URL, gUser, gPass);
}
