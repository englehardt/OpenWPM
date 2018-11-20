const {Cc, Ci, CC, Cu, Cr, components} = require("chrome");
const data        = require("sdk/self").data;
const S           = require('string');

const ThirdPartyUtil = Cc["@mozilla.org/thirdpartyutil;1"].getService(
                       Ci.mozIThirdPartyUtil);

var dcEntity;
var dcList;

// Load the disconnect list
exports.loadLists = function(useContentCategory) {
  // Entity List
  var dcEntity = JSON.parse(data.load("disconnect_entity.json"));

  // Block List
  if (useContentCategory) {
    var dcList = JSON.parse(data.load("disconnect_domains_content.json"));
    // Add in `google.com` since they set a tracking cookie `NID`
    // dcList.push('google.com');
  } else {
    var dcList = JSON.parse(data.load("disconnect_domains.json"));
  }
};

// Check if URI loaded in topURI would be classified as tracking
exports.isTracker = function(URI, topURI) {
  var baseDomain = ThirdPartyUtil.getBaseDomain(URI);

  /*
   * Check the entity list
   * we check the full hostname and the base domain of the top-level document.
   * The hostname is included as some entries include the
   * `www.` subdomain. Nearly all entity top-levels are PS+1s.
   */
  if (topURI != null) {
    var topBaseDomain = ThirdPartyUtil.getBaseDomain(topURI);
    if (
      ((topURI.host in dcEntity) &&
      (dcEntity[topURI.host].includes(URI.host) || dcEntity[topURI.host].includes(baseDomain))) ||
      ((topBaseDomain in dcEntity) &&
      (dcEntity[topBaseDomain].includes(URI.host) || dcEntity[topBaseDomain].includes(baseDomain)))) {
      return false;
    }
  }

  /*
   * Check the blacklist
   * https://developers.google.com/safe-browsing/v4/urls-hashing#suffixprefix-expressions
   */
  var host = URI.host;
  for (var i=0; i<5; i++) {
    if (dcList.includes(host)) {
      return true;
    }
    if (host == baseDomain) {
      return false;
    }
    host = S(host).splitLeft('.',1)[1];
  }
  return false;
};
