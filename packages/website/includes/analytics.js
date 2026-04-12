/**
 * Google Analytics 4 - one property for all ERMITS marketing sites.
 * Measurement ID: G-VEQXJHYNHG
 */
(function() {
  var id = 'G-VEQXJHYNHG';
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
    linker: {
      domains: ['cybercorrect.com', 'www.cybercorrect.com', 'workspace.cybercorrect.com', 'cybercaution.com', 'www.cybercaution.com', 'platform.cybercaution.com', 'toolkits.cybercaution.com', 'vendorsoluce.com', 'www.vendorsoluce.com', 'platform.vendorsoluce.com', 'portal.vendorsoluce.com', 'cybersoluce.com', 'lite.cybersoluce.com', 'technosoluce.com', 'app.technosoluce.com', 'medisoluce.com', 'www.medisoluce.com', 'ermits.com', 'www.ermits.com', 'socialcaution.com', 'www.socialcaution.com', 'pandagarde.com', 'www.pandagarde.com']
    }
  });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(s);
})();
