// This is our javascript, which will pop up our message
// in an alert box.

var gUser;
var gPass;
var gServer;
var gLang;
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
    gLang = gPrefManager.getCharPref("extensions.ehu-notifier.language"); 
    
    // get the password from password manager
    gPassManager = Components.classes["@mozilla.org/passwordmanager;1"].createInstance();
    if (gPassManager) {
	passManagerInt = gPassManager.QueryInterface(Components.interfaces.nsIPasswordManagerInternal);
    }	      
    tempHost = new Object();
    tempUser = new Object();
    tempPass = new Object();
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
