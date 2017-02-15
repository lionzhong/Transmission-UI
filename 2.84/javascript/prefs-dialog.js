function PrefsDialog(e){var t={dialog:null,remote:null,elements:{},keys:["alt-speed-down","alt-speed-time-begin","alt-speed-time-day","alt-speed-time-enabled","alt-speed-time-end","alt-speed-up","blocklist-enabled","blocklist-size","blocklist-url","dht-enabled","download-dir","encryption","idle-seeding-limit","idle-seeding-limit-enabled","lpd-enabled","peer-limit-global","peer-limit-per-torrent","peer-port","peer-port-random-on-start","pex-enabled","port-forwarding-enabled","rename-partial-files","seedRatioLimit","seedRatioLimited","speed-limit-down","speed-limit-down-enabled","speed-limit-up","speed-limit-up-enabled","start-added-torrents","utp-enabled"],groups:{"alt-speed-time-enabled":["alt-speed-time-begin","alt-speed-time-day","alt-speed-time-end"],"blocklist-enabled":["blocklist-url","blocklist-update-button"],"idle-seeding-limit-enabled":["idle-seeding-limit"],seedRatioLimited:["seedRatioLimit"],"speed-limit-down-enabled":["speed-limit-down"],"speed-limit-up-enabled":["speed-limit-up"]}},i=function(e){var t,i,s,n,o;for(t=0;t<96;++t)i=parseInt(t/4,10),s=t%4*15,n=15*t,o=i+":"+(s||"00"),e.options[t]=new Option(o,n)},s=function(e){var i=e.arguments["port-is-open"],s="Port is <b>"+(i?"Open":"Closed")+"</b>",n=t.elements.root.find("#port-label");setInnerHTML(n[0],s)},n=function(e,i){var s,n,o,a;if(e in t.groups)for(a=t.elements.root,o=t.groups[e],s=0;n=o[s];++s)a.find("#"+n).attr("disabled",!i)},o=function(){t.remote.updateBlocklist(),a(!1)},a=function(e){var i=t.elements.blocklist_button;i.attr("disabled",!e),i.val(e?"Update":"Updating...")},l=function(e){var t;switch(e[0].type){case"checkbox":case"radio":return e.prop("checked");case"text":case"url":case"email":case"number":case"search":case"select-one":return t=e.val(),parseInt(t,10).toString()===t?parseInt(t,10):parseFloat(t).toString()===t?parseFloat(t):t;default:return null}},d=function(e){var i={};i[e.target.id]=l($(e.target)),t.remote.savePrefs(i)},r=function(e){t.oldValue=l($(e.target))},c=function(e){var i=l($(e.target));if(i!==t.oldValue){var s={};s[e.target.id]=i,t.remote.savePrefs(s),delete t.oldValue}},p=function(){return{width:$(window).width(),height:$(window).height(),position:["left","top"]}},m=function(e){var s,n,a,l;for(t.remote=e,a=$("#prefs-dialog"),t.elements.root=a,i(a.find("#alt-speed-time-begin")[0]),i(a.find("#alt-speed-time-end")[0]),l=isMobileDevice?p():{width:350,height:400},l.autoOpen=!1,l.show=l.hide="fade",l.close=b,a.tabbedDialog(l),a=a.find("#blocklist-update-button"),t.elements.blocklist_button=a,a.click(o),s=0;n=t.keys[s];++s)switch(a=t.elements.root.find("#"+n),a[0].type){case"checkbox":case"radio":case"select-one":a.change(d);break;case"text":case"url":case"email":case"number":case"search":a.focus(r),a.blur(c)}},u=function(){var e,i,s,n={},o=t.keys,a=t.elements.root;for(e=0;i=o[e];++e)s=l(a.find("#"+i)),null!==s&&(n[i]=s);return n},b=function(){transmission.hideMobileAddressbar(),$(t.dialog).trigger("closed",u())};this.set=function(e){var i,s,o,l,d=t.keys,r=t.elements.root;for(a(!0),s=0;o=d[s];++s)if(l=e[o],i=r.find("#"+o),"blocklist-size"===o)i.text(""+l.toStringWithCommas());else switch(i[0].type){case"checkbox":case"radio":i.prop("checked",l),n(o,l);break;case"text":case"url":case"email":case"number":case"search":i[0]!==document.activeElement&&i.val(l);break;case"select-one":i.val(l)}},this.show=function(){transmission.hideMobileAddressbar(),a(!0),t.remote.checkPort(s,this),t.elements.root.dialog("open")},this.close=function(){transmission.hideMobileAddressbar(),t.elements.root.dialog("close")},this.shouldAddedTorrentsStart=function(){return t.elements.root.find("#start-added-torrents")[0].checked},t.dialog=this,m(e)}