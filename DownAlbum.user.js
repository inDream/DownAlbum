// ==UserScript==
// @name          DownAlbum
// @author        indream
// @version       0.17.3.1
// @description   Download Facebook, Instagram, Pinterest, Twitter, Ask.fm, Weibo Album.
// @namespace     DownAlbum
// @updateURL     https://raw.githubusercontent.com/inDream/DownAlbum/master/DownAlbum.meta.js
// @downloadURL   https://raw.githubusercontent.com/inDream/DownAlbum/master/DownAlbum.user.js
// @grant         unsafeWindow
// @grant         GM_xmlhttpRequest
// @include       htt*://*.facebook.com/*
// @include       htt*://*.facebook.com/*/*
// @include       htt*://instagram.com/*
// @include       htt*://*.instagram.com/*
// @include       htt*://twitter.com/*
// @include       htt*://weibo.com/*
// @include       htt*://www.pinterest.com/*
// @include       htt*://ask.fm/*
// @exclude       htt*://*static*.facebook.com*
// @exclude       htt*://*channel*.facebook.com*
// @exclude       htt*://developers.facebook.com/*
// @exclude       htt*://upload.facebook.com/*
// @exclude       htt*://*onnect.facebook.com/*
// @exclude       htt*://*acebook.com/connect*
// @exclude       htt*://*.facebook.com/plugins/*
// @exclude       htt*://*.facebook.com/l.php*
// @exclude       htt*://*.facebook.com/ai.php*
// @exclude       htt*://*.facebook.com/extern/*
// @exclude       htt*://*.facebook.com/pagelet/*
// @exclude       htt*://api.facebook.com/static/*
// @exclude       htt*://*.facebook.com/contact_importer/*
// @exclude       htt*://*.facebook.com/ajax/*
// @exclude       htt*://www.facebook.com/places/map*_iframe.php*
// @exclude       https://www.facebook.com/xti.php
// @exclude       https://*.ak.facebook.com/*
// @exclude       https://www.facebook.com/ajax/pagelet/generic.php/*
// @exclude       https://www.facebook.com/*/plugins/*
// @exclude       https://www.facebook.com/xti.php*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// ==/UserScript==

var log = function(s) {
  try {
    console.log(s);
  } catch(e) {
    GM_log(s);
  }
};

var dFAinit = function(){
  var href = location.href;
  var site = href.match(/(facebook|instagram|twitter|pinterest|weibo)\.com|ask\.fm/);
  if (document.querySelector('#dFA') || !site) {
    return;
  }
  var k, k2, klass;
  if (site[0] == 'instagram.com') {
    klass = qS('header div:nth-of-type(2) div span button').parentNode;
    k = document.createElement('div');
    k.className = klass ? klass.className : '';
  } else {
    k = document.createElement('li');
  }
  k2 = k.cloneNode();
  k.innerHTML = '<a id="dFA" class="navSubmenu">DownAlbum</a>';
  k2.innerHTML = '<a id="dFAsetup" class="navSubmenu">DownAlbum(Setup)</a>';
  var t = qS('.uiContextualLayerPositionerFixed ul') || qS('.Dropdown ul') ||
    qS('.gn_topmenulist.gn_topmenulist_set ul') || qS('.uiContextualLayer [role="menu"]') ||
    qS('.me.dropdown .dropdown-menu') || qS('header div:nth-of-type(2) div');
  if(t){
    t.appendChild(k); t.appendChild(k2);
    k.addEventListener("click", function(){
      dFAcore();
    });
    k2.addEventListener("click", function(){
      dFAcore(true);
    });
  }
  if(href.indexOf('facebook.com') > 0){
    if (t) {
      var pBtn = document.createElement('li');
      pBtn.innerHTML = '<a id="photosOf" class="navSubmenu">[FB] Open "Photos of"</a>';
      t.appendChild(pBtn);
      pBtn.addEventListener('click', photosOfHelper);
    }
    if(!t && qS('#userNavigation, #logoutMenu')){
      // Handle async menu
      $('#pageLoginAnchor, #logoutMenu').on('click.dfainit', function(){
        setTimeout(dFAinit, 500);
      });
    }
  }else if(href.indexOf('instagram.com') > 0){
    var o = window.WebKitMutationObserver || window.MutationObserver;
    if(o && !window.addedObserver){
      window.addedObserver = true;
      var observer = new o(runLater);
      observer.observe(document.body, {subtree: true, childList: true});
      runLater();
    }
  }else if(href.indexOf('pinterest.com') > 0){
    if(!qS('#dfaButton')){
      var t = qS('.boardFollowButtonWrapper');
      klass = 'Button boardFollowUnfollowButton';
      t.innerHTML += '<button id="dfaButton" class="' + klass + '"><span class="buttonText">DownAlbum</span></button><button id="dfaSetButton" class="' + klass + '"><span class="buttonText">DownAlbum(Setup)</span></button>';
      qS('#dfaButton').addEventListener("click", function(){
        dFAcore();
      });
      qS('#dfaSetButton').addEventListener("click", function(){
        dFAcore(true);
      });
    }
  }else if(href.indexOf('ask.fm') > 0){
    k = qS('.profileButton').parentNode;
    if (k) {
      k.innerHTML += '<a class="link-green" onClick="dFAcore();">DownAlbum</a>' + 
        '<a class="link-green" onClick="dFAcore(true);">DownAlbum(Setup)</a>';
    } else {
      setTimeout(dFAinit, 300);
    }
  }
};
function runLater(){clearTimeout(window.addLinkTimer);window.addLinkTimer = setTimeout(addLink, 300);}
function addLink(){
  dFAinit();
  var k = qSA('article>div:nth-of-type(1), header>div:nth-of-type(1)');
  for(var i = 0; i<k.length; i++){
    if (k[i].nextElementSibling) {
      _addLink(k[i], k[i].nextElementSibling);
    }
  }
  var k = qSA('header');
  for(var i = 0; i<k.length; i++){
    _addLink(k[i], k[i]);
  }
}

function _addLink(k, target) {
  var isProfile = (k.tagName == 'HEADER' || k.parentNode.tagName == 'HEADER');
  var tParent = target.parentNode;
  if (tParent.querySelectorAll('img').length > 2) {
    return;
  }
  var t = k.querySelector('img, video');
  if (t) {
    var src = parseFbSrc(t.getAttribute("src"));
    if (qS('.dLink [href="' + src + '"]')) {
      return;
    }
    var next = isProfile ? target.querySelector('.dLink') : 
      target.nextElementSibling;
    if (next) {
      if (next.childNodes[0] &&
        next.childNodes[0].getAttribute('href') == src) {
        return;
      } else {
        (isProfile ? target : tParent).removeChild(next);
      }
    }
  }
  if (t && src) {
    var link = document.createElement('div');
    link.className = 'dLink';
    var title = '(provided by DownAlbum)';
    var html = '<a href="' + src + '" download title="' + title + '">Download';
    if (src.match('mp4')) {
      var poster = t.getAttribute('poster');
      html += ' Video</a><a href="' + poster + '" download  title="' + title +
        '">Download Photo</a>';
    } else {
      html += '</a>';
    }
    link.innerHTML = html;
    if (isProfile) {
      k.appendChild(link);
    } else if (target.insertAdjacentElement) {
      target.insertAdjacentElement("afterEnd", link);
    } else {
      if (target.nextSibling) {
        tParent.insertBefore(link, target.nextSibling);
      } else {
        tParent.appendChild(link);
      }
    }
  }
}
function photosOfHelper() {
  var userId;
  var timeline = qS('#pagelet_timeline_main_column');
  try {
    if (timeline) {
      userId = JSON.parse(timeline.getAttribute('data-gt')).profile_owner;
    }
  } catch(e) {}

  var cover = qS('.coverWrap') || qS('.coverImage');
  try {
    if (cover && !userId) {
      userId = cover.href.match(/set=([\w\d\.]+)/)[1].split('.')[3];
    }
  } catch(e) {}

  if (userId) {
    location.href = 'https://www.facebook.com/search/' + userId +
      '/photos-of/intersect';
  }
}
var g = {};
function getParent(child, selector){
  var target = child;
  while(target && !target.querySelector(selector)){
    if (target.parentNode && target.parentNode.tagName == 'BODY') {
      return target;
    }
    target = target.parentNode;
  }
  return target ? target.querySelector(selector) : null;
}
function getText(s, html, parent){
  var q = parent ? parent.querySelector(s) : qS(s);
  var t = 'textContent';
  if(q && q.querySelectorAll('br').length){t = 'innerHTML';}
  if(q && html && q.querySelectorAll('a').length){t = 'innerHTML';}
  return q ? q[t] : "";
}
function getDOM(html){
  var doc;
  if(document.implementation){
    doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = html;
  }else if(DOMParser){
    doc = (new DOMParser).parseFromString(html, 'text/html');
  }else{
    doc = document.createElement('div');
    doc.innerHTML = html;
  }
  return doc;
}
function quickSelect(s){
  var method = false;
  switch(s){
    case /#\w+$/.test(s):
      method = 'getElementById'; break;
    case /\.\w+$/.test(s):
      method = 'getElementsByClassName'; break;
  }
  return method;
}
function qS(s){var k = document[quickSelect(s) || 'querySelector'](s);return k&&k.length ? k[0] : k;}
function qSA(s){return document[quickSelect(s) || 'querySelectorAll'](s);}
function padZero(str, len) {
  str = str.toString();
  while (str.length < len) {
    str = '0' + str;
  }
  return str;
}
function parseTime(t){
  var d = new Date(t * 1000);
  return d.getFullYear() + '-' + padZero(d.getMonth() + 1, 2) + '-' +
    padZero(d.getDate(), 2) + ' ' + padZero(d.getHours(), 2) + ':' +
    padZero(d.getMinutes(), 2) + ':' + padZero(d.getSeconds(), 2);
}
function parseQuery(s){
  var data = {};
  var n = s.split("&");
  for(var i=0; i<n.length; i++){
    var t = n[i].split("=");
    data[t[0]] = t[1];
  }
  return data;
}
function parseFbSrc(s, fb) {
  if (fb) {
    return s.replace(/s\d{3,4}x\d{3,4}\//g, '');
  } else {
    return s.replace(/\w\d{3,4}x\d{3,4}\//g, '');
  }
}
function getFbid(s){
  var fbid = s.match(/fbid=(\d+)/);
  if(!fbid){
    if(s.match('opaqueCursor')){
      var index = s.indexOf('/photos/');
      if(index != -1){
        fbid = getFbid(s.slice(index + 8));
        if(fbid){
          return fbid;
        }
      }
      if(!fbid){
        fbid = s.match(/\/([0-9]+)\//);
        if(!fbid){
          fbid = s.match(/([0-9]{5,})/);
        }
      }
    }else if(s.match('&') && s.indexOf('/photos/') == -1){
      try{
        fbid = s.slice(s.indexOf('=') + 1, s.indexOf('&'));
      }catch(e){}
      return fbid ? fbid : false;
    } else {
      // id for page's photos
      fbid = s.match(/\/photos\/[\w\d\.-]+\/(\d+)/);
    }
  }
  return fbid && fbid.length ? fbid[1] : false;
}
function extractJSON(str) {
  // http://stackoverflow.com/questions/10574520/
  var firstOpen, firstClose, candidate;
  firstOpen = str.indexOf('{', firstOpen + 1);
  var countOpen = 0, countClose = 0;
  do {
    countOpen++;
    firstClose = str.lastIndexOf('}');
    if (firstClose <= firstOpen) {
      return null;
    }
    countClose = 0;
    do {
      countClose++;
      candidate = str.substring(firstOpen, firstClose + 1);
      var res;
      try {
        res = JSON.parse(candidate);
        return res;
      } catch (e) {}
      try {
        res = eval("(" + candidate + ")");
        return res;
      } catch (e) {}
      firstClose = str.substr(0, firstClose).lastIndexOf('}');
    } while (firstClose > firstOpen && countClose < 20);
    firstOpen = str.indexOf('{', firstOpen + 1);
  } while (firstOpen != -1 && countOpen < 20);
}
function createDialog() {
  if (qS('#daContainer')) {
    qS('#daContainer').style = '';
    qS('#stopAjaxCkb').checked = false;
    return;
  }
  var d = document.createElement('div');
  var s = document.createElement('style');
  s.textContent = '#daContainer {position: fixed; width: 360px; \
    top: 20%; left: 50%; margin-left: -180px; background: #FFF; \
    padding: 1em; border-radius: 0.5em; line-height: 2em; z-index: 9999;\
    box-shadow: 1px 3px 3px 0 rgba(0,0,0,.2),1px 3px 15px 2px rgba(0,0,0,.2);}\
    #daHeader {font-size: 1.5rem; font-weight: 700; background: #FFF; \
    padding: 1rem 0.5rem; color: rgba(0,0,0,.85); \
    border-bottom: 1px solid rgba(34,36,38,.15);} \
    #daContent {font-size: 1.2em; line-height: 1.4; padding: .5rem;} \
    #stopAjaxCkb {display: inline-block; -webkit-appearance: checkbox; \
    width: auto;}';
  document.head.appendChild(s);
  d.id = 'daContainer';
  d.innerHTML = '<div id="daHeader">DownAlbum</div><div id="daContent">' +
    'Status: <span class="daCounter"></span><br>' +
    '<label>Stop <input id="stopAjaxCkb" type="checkbox"></label><br>' +
    '<a href="javascript:;" class="daClose">Close</a></div>';
  document.body.appendChild(d);
  qS('.daClose').addEventListener('click', hideDialog);
}
function hideDialog() {
  qS('#daContainer').style = 'display: none;';
}
function closeDialog() {
  document.body.removeChild(qS('#daContainer'));
}
function output(){
  g.photodata.dTime = (new Date()).toLocaleString();
  if(location.href.match(/.*facebook.com/)){
    document.title = document.title.match(/(?:.*\|\|)*(.*)/)[1];
  }
  document.title=g.photodata.aName;
  if(g.photodata.photos.length>1000 && !g.largeAlbum){
    if(confirm('Large amount of photos may crash the browser:\nOK->Use Large Album Optimize Cancel->Continue'))g.photodata.largeAlbum = true;
  }
  sendRequest({type:'export',data:g.photodata});
}
function handleFbAjax(fbid) {
  var d = g.dataLoaded[fbid];
  if (d !== undefined) {
    var photos = g.photodata.photos;
    var i = g.ajaxLoaded;
    if (!photos[i]) {
      return true;
    }
    if (g.urlLoaded[fbid]) {
      photos[i].url = g.urlLoaded[fbid];
      delete g.urlLoaded[fbid];
    }
    if (g.commentsList[fbid]) {
      photos[i].comments = g.commentsList[fbid];
      delete g.commentsList[fbid];
    }
    photos[i].title = d.title;
    photos[i].tag = d.tag;
    photos[i].date = d.date;
    delete g.dataLoaded[fbid];
    delete photos[i].ajax;
    if (g.ajaxLoaded + 1 < photos.length) {
      g.ajaxLoaded++;
    }
    return true;
  }
  return false;
}
function handleFbAjaxProfiles(data) {
  var profiles = Object.keys(data.profiles);
  for (var j = 0; j < profiles.length; j++) {
    try {
      var p = data.profiles[profiles[j]];
      g.profilesList[p.id] = {name: p.name, url: p.uri};
    } catch(e) {}
  }
}
function handleFbAjaxComment(data) {
  try {
    var comments = data.comments;
    var commentsList = [data.feedbacktarget.commentcount];
    var fbid = comments[0].ftentidentifier;
    var timeFix = new Date(parseTime(data.servertime)) - new Date();
  } catch(e) {
    console.log('Cannot parse comment');
    return;
  }
  for (j = 0; j < comments.length; j++){
    try {
      var c = comments[j];
      p = g.profilesList[c.author];
      commentsList.push({
        fbid: fbid,
        id: c.legacyid,
        name: p.name,
        url: p.url,
        text: c.body.text,
        date: parseTime(c.timestamp.time)
      });
    } catch(e) {}
  }
  g.commentsList[fbid] = commentsList;
  g.commentsList.count++;
}
function fbAjax(){
  var len=g.photodata.photos.length,i=g.ajaxLoaded;
  var src;
  try{
    src = getFbid(g.photodata.photos[i].href);
  }catch(e){
    if(i + 1 < len){g.ajaxLoaded++; fbAjax();}else{output();}
    return;
  }
  if (handleFbAjax(src)) {
    if(len<50||i%15==0)log('Loaded '+(i+1)+' of '+len+'. (cached)');
    g.statusEle.textContent='Loading '+(i+1)+' of '+len+'.';
    if(i+1!=len){document.title="("+(i+1)+"/"+(len)+") ||"+g.photodata.aName;fbAjax();
    }else{output();}
  }else if(!qS('#stopAjaxCkb')||!qS('#stopAjaxCkb').checked){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    clearTimeout( g.timeout );
    var r=this.response,htmlBase=document.createElement('html');
    htmlBase.innerHTML=r.slice(6,-7);
    var targetJS=htmlBase.querySelectorAll('script'),list=[src];
    for(var k=0;k<targetJS.length;k++){
      var t=targetJS[k].textContent,content=t.slice(t.indexOf('(2, {')+4,t.indexOf('}, true);}')+1);
      if(!content.length||t.indexOf('JSONPTransport')<0){continue;}
      content=JSON.parse(content);
      var require=content.payload.jsmods.require;
      if (!content.payload || !content.payload.jsmods || 
        !content.payload.jsmods.require) {
        alert('Autoload failed, go to photo tab and try again.');
        return output();
      }
      if(require&&(content.id=='pagelet_photo_viewer'||require[0][1]=='addPhotoFbids')){list=require[0][3][0];}
      for (var ii = 0; ii < require.length; ii++) {
        if (!require[ii] || !require[ii].length) {
          continue;
        }
        if (require[ii].length > 2 && require[ii][0] == 'UFIController') {
          var inst = require[ii][3];
          if (inst.length && inst[2]) {
            handleFbAjaxProfiles(inst[2]);
          }
        }
      }
      for (var ii = 0; ii < require.length; ii++) {
        if (!require[ii] || !require[ii].length) {
          continue;
        }
        if (require[ii].length > 2 && require[ii][0] == 'UFIController') {
          var inst = require[ii][3];
          if (inst.length && inst[2].comments && inst[2].comments.length) {
            handleFbAjaxComment(inst[2]);
          }
        }
        if (require[ii][1] == 'storeFromData') {
          var image = require[ii][3][0].image;
          if (image) {
            var keys = Object.keys(image);
            for (var j = 0; j < keys.length; j++) {
              var pid = keys[j];
              if (image[pid].url) {
                g.urlLoaded[pid] = image[pid].url;
              }
            }
          }
        }
      }
      if(t.indexOf('fbPhotosPhotoTagboxBase')>0||t.indexOf('fbPhotosPhotoCaption')>0){
        var markup=content.payload.jsmods.markup;
        for(var ii=0;ii<markup.length;ii++){
          var markupContent=markup[ii];
          for(var j=0;j<markupContent.length;j++){
            var test=markupContent[j].__html;
            if(!test){continue;}
            var h=document.createElement('div');h.innerHTML=unescape(test);
            var box = h.querySelectorAll('.snowliftPayloadRoot');
            if(!box.length){continue;}
            for (var kk = 0; kk < box.length; kk++) {
              var c = box[kk].querySelector('.fbPhotosPhotoCaption');
              var b = box[kk].querySelector('.fbPhotosPhotoTagboxes');
              var a = box[kk].querySelector('abbr');
              if (!a) {continue;}

              var s = c.querySelector('.hasCaption');
              s = !s ? '' : s.innerHTML.match(/<br>|<wbr>/) ?
                s.outerHTML.replace(/'/g,'&quot;') : s.textContent;
              var tag = b.querySelector('.tagBox');
              tag = !tag ? '' : b.outerHTML;
              var date = a ? parseTime(a.dataset.utime):'';
              pid = getFbid(a.parentNode.href);
              g.dataLoaded[pid] = {tag: tag, title: s, date: date};
            }
          }
        }
      };
      // Fallback to old comment
      var instances = content.payload.jsmods.instances;
      for(ii = 0; instances && ii<instances.length; ii++){
        if (!instances[ii] || !instances[ii].length ||
          !instances[ii][1] || !instances[ii][1].length) {
          continue;
        }
        if (instances[ii][1][0] === 'UFIController') {
          inst = instances[ii][2];
          if (inst.length && inst[2].comments && inst[2].comments.length) {
            handleFbAjaxProfiles(inst[2]);
          }
        }
      }
      for(ii = 0; instances && ii<instances.length; ii++){
        if (!instances[ii] || !instances[ii].length ||
          !instances[ii][1] || !instances[ii][1].length) {
          continue;
        }
        if (instances[ii][1][0] === 'UFIController') {
          inst = instances[ii][2];
          if (inst.length && inst[2].comments && inst[2].comments.length) {
            handleFbAjaxComment(inst[2]);
          }
        }
      };
    }
    handleFbAjax(src);
    if(len<50||i%15==0)log('Loaded '+(i+1)+' of '+len+'.');
    g.statusEle.textContent = 'Loaded ' + (i+1) + ' of ' + len;
    if(i+1>=len){
      output();
    }else{
      if(i==g.ajaxLoaded){g.ajaxRetry++}
      if (g.ajaxRetry > 5) {
        if (g.ajaxAutoNext) {
          g.ajaxRetry = 0;
          g.ajaxLoaded++;
        } else {
          var retryReply = prompt('Retried 5 times.\nTry again->OK\n' +
            'Try next photo->Type 1\nAlways try next->Type 2\n' +
            'Output loaded photos->Cancel');
          if (retryReply !== null) {
            g.ajaxRetry = 0;
            if (+retryReply === 2){
              g.ajaxAutoNext = true;
              g.ajaxLoaded++;
            } else {
              g.ajaxLoaded++;
            }
          } else {
            output();
            return;
          }
        }
      }
      document.title="("+(i+1)+"/"+(len)+") ||"+g.photodata.aName;fbAjax();
    }
  };
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 2 && xhr.status != 200){
      g.ajaxLoaded++;
      fbAjax();
    }
  };
  xhr.open("GET", g.photodata.photos[i].ajax);
  g.timeout=setTimeout(function(){
    xhr.abort();
    g.ajaxRetry++;
    if(g.ajaxRetry>5){if(confirm('Timeout reached.\nTry again->OK\nOutput loaded photos->Cancel')){g.ajaxRetry=0;fbAjax();}else{output();}}
  },10000);
  xhr.send();}else{output();}
}
function getPhotos(){
  if(g.start!=2||g.start==3){return;}
  var scrollEle = !!(qS('#fbTimelinePhotosScroller *') || 
    qS('.uiSimpleScrollingLoadingIndicator') || qS('.fbStarGrid~img') ||
    qS('.fbStarGridWrapper~img') || qS('#browse_result_below_fold') ||
    (!qS('#browse_end_of_results_footer') && qS('#contentArea div.hidden_elem')
    && location.href.match('search')) ||
    qS('span[aria-busy="true"]'));
  if(g.ajaxFailed&&g.mode!=2&&scrollEle){scrollTo(0, document.body.clientHeight);setTimeout(getPhotos,2000);return;}
  var i, photodata = g.photodata, testNeeded = 0, ajaxNeeded = 0;
  var elms = g.elms || qS('#album_pagelet') || qS('#static_set_pagelet') || qS('#pagelet_photos_stream') || qS('#group_photoset') || qS('#initial_browse_result') || qS('#contentArea') || qS('._2eec');
  var grid = qSA('.fbStarGrid');
  var selector = 'a[rel="theater"]';
  var tmp = [], tmpE, eLen;
  if(g.elms){ajaxNeeded=1;}
  else if(grid.length){
    if(grid.length>1){
      for(eLen = 0; eLen<grid.length; eLen++){
        tmpE = grid[eLen].querySelectorAll(g.thumbSelector);
        for(var tmpLen = 0; tmpLen<tmpE.length; tmpLen++){
          tmp.push(tmpE[tmpLen]);
        }
      }
      elms = tmp; ajaxNeeded=1;
    }else{elms=grid[0].querySelectorAll(g.thumbSelector);ajaxNeeded=1;}
  }else if(elms){
    var temp = elms.querySelectorAll(g.thumbSelector);ajaxNeeded=1;
    if(!temp.length){
      testNeeded = 1;
      tmpE = elms.querySelectorAll(selector);
      for(eLen = 0; eLen < tmpE.length; eLen++){
        if (tmpE[eLen].querySelector('img')) {
          tmp.push(tmpE[eLen]);
        }
      }
      elms = tmp;
    }else{
      elms = temp;
    }
  }
  else{elms=qSA(selector);testNeeded=1;}
  if(qSA('.fbPhotoStarGridElement')){ajaxNeeded=1;}

  if (g.isPage) {
    if (qS('input[type="file"][accept="image/*"]')) {
      g.pageType = 'other';
    } else {
      g.pageType = 'posted';
    }
  }

  if(g.mode!=2&&!g.lastLoaded&&scrollEle&&(!qS('#stopAjaxCkb')||!qS('#stopAjaxCkb').checked)){
    fbAutoLoad(g.isPage ? [] : elms);return;
  }
  for (i = 0;i<elms.length;i++) {
    if (testNeeded) {
      var test1 = (getParent(elms[i],'.mainWrapper')&&getParent(elms[i],'.mainWrapper').querySelector('.shareSubtext')&&elms[i].childNodes[0]&&elms[i].childNodes[0].tagName=='IMG');
      var test2 = (getParent(elms[i],'.timelineUnitContainer')&&getParent(elms[i],'.timelineUnitContainer').querySelector('.shareUnit'));
      var test3 = (elms[i].querySelector('img')&&!elms[i].querySelector('img').scrollHeight);
      if (test1 || test2 || test3) {
        continue;
      }
    }
    try{
    var ajaxify = unescape(elms[i].getAttribute('ajaxify')) || '';
    var parentSrc = elms[i].parentNode ?
      elms[i].parentNode.getAttribute('data-starred-src') : '';
    var bg = elms[i].childNodes[0];
    var src = bg ? bg.getAttribute('src') : '';
    if (src && src.indexOf('?') === -1) {
      src = parseFbSrc(src);
    }
    bg = bg && bg.style ? (bg.style.backgroundImage || '').slice(5, -2) : '';
    var url = src || (ajaxify.indexOf('&src') < 0 ? ajaxify : (parentSrc || bg));
    var href = elms[i].href;
    var fbid = getFbid(href);
    if(href.match('opaqueCursor')){
      if(fbid){
        href = 'https://www.facebook.com/photo.php?fbid=' + fbid;
      }else{
        continue;
      }
    }else if(href.match('&')){
      href=href.slice(0, href.indexOf('&'));
    }
    if(!g.downloaded[fbid]){g.downloaded[fbid]=1;}else{continue;}
    if(!g.notLoadCm){
      var q = {};
      var ajax = '';
      if (url.indexOf('&src') != -1) {
        ajax = url.slice(url.indexOf("?")+1,url.indexOf("&src")).split("&");
        url = parseFbSrc(url.match(/&src.(.*)/)[1]).replace(/&smallsrc=.*\?/, '?', true);
      } else {
        ajax = elms[i].href.slice(elms[i].href.indexOf('?') + 1).split('&');
        var pset = elms[i].href.match(/\/photos\/([\.\d\w-]+)\//);
        if (pset) {
          q = {set: pset[1]};
        }
      }
      for(var j=0;j<ajax.length;j++){var d=ajax[j].split("=");q[d[0]]=d[1];}
      if(!q.fbid && fbid){
        q.fbid = fbid;
      }
      ajax='https://www.facebook.com/ajax/pagelet/generic.php/PhotoViewerInitPagelet?ajaxpipe=1&ajaxpipe_token='+g.Env.ajaxpipe_token+'&no_script_path=1&data='+JSON.stringify(q)+'&__user='+g.Env.user+'&__a=1&__adt=2';
    }
    if(url.match(/\?/)){
      var b=url.split('?'), t='', a=b[1].split('&');
      for(var ii=0;ii<a.length;ii++){
        if(a[ii].match(/oh|oe|__gda__/))t+=a[ii]+'&';
      }
      url = b[0] + (t.length?('?'+t.slice(0, -1)):'');
    }else{url=url.slice(0, url.indexOf('&'));}
    var title = elms[i].getAttribute('title')||elms[i].querySelector('img')?elms[i].querySelector('img').getAttribute('alt'):''||'';
    title=title.indexOf(' ')>0?title:'';
    title=title.indexOf(': ')>0||title.indexOf('： ')>0?title.slice(title.indexOf(' ')+1):title;
    if(!title){
    var t=getParent(elms[i],'.timelineUnitContainer')||getParent(elms[i],'.mainWrapper');
    if(t){var target1=t.querySelectorAll('.fwb').length>1?'':t.querySelector('.userContent');}
    var target2=elms[i].getAttribute('aria-label')||'';
    if(target2){title=target2;}
    if(title===''&&target1){title=target1.innerHTML.match(/<br>|<wbr>/)?target1.outerHTML.replace(/'/g,'&quot;'):target1.textContent;}
    }
    var newPhoto={url: url, href: href};
    newPhoto.title=title;
    if (elms[i].dataset.date) {
      newPhoto.date = parseTime(elms[i].dataset.date);
    }
    if(!g.notLoadCm)newPhoto.ajax=ajax;
    photodata.photos.push(newPhoto);
    }catch(e){continue;}
  }
  if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){qS('#stopAjaxCkb').checked=false;}
  log('export '+photodata.photos.length+' photos.');
  if(!g.notLoadCm){
    if (ajaxNeeded && (g.loadCm || confirm("Try to load photo's caption?"))) {
      g.elms = null;
      fbAjax();
    } else {output();}
  }else{output();}
}
function getFbMessagesPhotos() {
  if (!g.offset) {
    g.ajaxRetry = {};
    g.offset = 0;
    g.photodata.aName = getText('.fb_content [role="main"] h2');
    g.photodata.aDes = '';
    getFbDtsg();
    var headers = qSA('[role="rowheader"]');
    var rows = [];
    for (var i = 0; i < headers.length; i++) {
      rows.push({e: headers[i], len: headers[i].parentNode.className.length});
    }
    rows.sort(function(a, b) {
      return a.len > b.len ? -1 : a.len === b.len ? 0 : 1;
    });
    g.threadId = rows[0].e.id.split(':')[1];
  }
  var url = 'https://www.facebook.com/ajax/messaging/attachments/sharedphotos.php';
  var data = 'thread_id='+g.threadId+'&offset='+g.offset+'&limit=30&__user='+g.Env.user+'&__a=1&__req=7&fb_dtsg='+g.fb_dtsg;
  var xhr = new XMLHttpRequest();
  xhr.onload = function(){
    var elms = g.elms.length ? g.elms : [];
    var payload = JSON.parse(this.response.slice(9)).payload;
    if(payload.imagesData){
      elms = elms.concat(payload.imagesData);
      if(elms.length){
        g.elms = elms;
        if(payload.moreImagesToLoad){
          g.offset += 30;
          getFbMessagesPhotos();
        }else{
          fbAjaxAttachment();
        }
      }else{
        alert('No photo attachments found.');
      }
    }
  };
  xhr.open('POST', url);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(data);
}
function fbAjaxAttachment(){
  var len = g.elms.length, i = g.ajaxLoaded;
  if(len && len > g.photodata.photos.length){
    var elms = g.elms[i];
    var fbid = elms.fbid;
    if(!g.ajaxRetry[fbid]){
      g.ajaxRetry[fbid] = 0;
    }
    if(!g.dataLoaded[fbid] && g.ajaxRetry[fbid]<3){
      g.ajaxRetry[fbid]++;
      var xhr = new XMLHttpRequest();
      xhr.onload = function(){
        var output = JSON.parse(JSON.parse(this.response.slice(9)).payload.output);
        var images = output[g.threadId].message_images.edges
        for(var i = 0; i < images.length; i++){
          g.dataLoaded[images[i].node.id] = 1;
          g.photodata.photos.push({
            href: '',
            url: images[i].node.image2.uri
          });
        }
        g.ajaxLoaded++;
        fbAjaxAttachment();
      };
      xhr.open('POST', 'https://www.facebook.com/ajax/graphql/query/');
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      var after = i > 0 ? ('&params[after]=' + g.elms[i - 1].fbid) : '';
      var data = 'queryName=MESSAGE_THREAD_IMAGES_FIRST'+after+'&params[first]=19&params[thread_id]='+g.threadId+'&__user='+g.Env.user+'&__a=1&__req=7&fb_dtsg='+g.fb_dtsg;
      xhr.send(data);
    }else{
      if(g.ajaxRetry[fbid] > 3){
        g.photodata.photos.push({
          href: '',
          url: elms.url
        });
      }
      g.ajaxLoaded++;
      fbAjaxAttachment();
    }
  }else if(g.photodata.photos.length){
    output();
  }
}
function getQL(type, target, key) {
  if (g.pageType === 'album') {
    if (!g.elms.length && !g.ajaxStartFrom) {
      return 'Query PhotoAlbumRoute {node(' + g.pageAlbumId +
        ') {id,__typename,@F8}} QueryFragment F0 : Photo {album {' +
        'album_type,id},can_viewer_edit,id,owner {id,__typename}} ' +
        'QueryFragment F1 : Photo {can_viewer_delete,id} QueryFragment F2 : ' +
        'Feedback {does_viewer_like,id} QueryFragment F3 : Photo {id,album {' +
        'id,name},feedback {id,can_viewer_comment,can_viewer_like,likers {' +
        'count},comments {count},@F2}} QueryFragment F4 : Photo {' +
        'can_viewer_edit,id,image as _image1LP0rd {uri},url,modified_time,' +
        'message {text},@F0,@F1,@F3} QueryFragment F5 : Node {id,__typename}' +
        ' QueryFragment F6 : Album {can_upload,id} QueryFragment F7 : Album' +
        ' {id,media.first(28) as ' + key + ' {edges {node {__typename,@F4,' +
        '@F5},cursor},page_info {has_next_page,has_previous_page}},owner {' +
        'id,__typename},@F6} QueryFragment F8 : Album {can_edit_caption,' +
        'can_upload,id,media.first(28) as ' + key + ' {edges {node {' +
        '__typename,@F4,@F5},cursor},page_info {has_next_page,' +
        'has_previous_page}},message {text},modified_time,owner {' +
        'id,name,__typename},@F6,@F7}';
    }
    return 'Query ' + type + ' {node('+ g.pageAlbumId +
      ') {@F6}} QueryFragment F0 : Photo {album {album_type,id},' +
      'can_viewer_edit,id,owner {id,__typename}} QueryFragment F1 : ' +
      'Photo {can_viewer_delete,id} QueryFragment F2 : Feedback ' +
      '{does_viewer_like,id} QueryFragment F3 : Photo {id,album {id,name},' +
      'feedback {id,can_viewer_comment,can_viewer_like,likers {count},' +
      'comments {count},@F2}} QueryFragment F4 : Photo {can_viewer_edit,id,' +
      'image as _image1LP0rd {uri},url,modified_time,message {text},' +
      '@F0,@F1,@F3} QueryFragment F5 : Node ' +
      '{id,__typename} QueryFragment F6 : ' + target +
      '.first(28) as ' + key +' {edges {node {__typename,@F4,@F5},cursor},' +
      'page_info {has_next_page,has_previous_page}}}';
  } else {
    if (g.pageType === 'other' && !g.elms.length && !g.ajaxStartFrom) {
      return 'Query MediaPageRoute {node(' + g.pageId + ') {id,__typename,' +
        '@F5}} QueryFragment F0 : Photo {album {album_type,id},' +
        'can_viewer_edit,id,owner {id,__typename}} QueryFragment F1 : ' +
        'Photo {can_viewer_delete,id} QueryFragment F2 : Feedback {' +
        'does_viewer_like,id} QueryFragment F3 : Photo {id,album {id,name}' +
        ',feedback {id,can_viewer_comment,can_viewer_like,likers {count},' +
        'comments {count},@F2}} QueryFragment F4 : Photo {can_viewer_edit,' +
        'id,image as _image1LP0rd {uri},url,modified_time,message {text},' +
        '@F0,@F1,@F3} QueryFragment F5 : Page {id,photos_by_others.first(28)' +
        ' as _photos_by_others4vtdVT {count,edges {node {id,@F4},cursor}, ' +
        'page_info {has_next_page,has_previous_page}}}';
    }
    return 'Query ' + type + ' {node(' + g.pageId +
      ') {@F3}} QueryFragment F0 : Feedback {does_viewer_like,id} ' +
      'QueryFragment F1 : Photo {id,album {id,name},feedback ' +
      '{id,can_viewer_comment,can_viewer_like,likers {count},' +
      'comments {count},@F0}} QueryFragment F2 : Photo {image' +
      ' as _image1LP0rd {uri},url,id,modified_time,message {text},@F1} ' +
      'QueryFragment F3 : ' + target + '.first(28) as ' + key + ' {edges {' +
      'node {id,@F2},cursor},page_info {has_next_page,has_previous_page}}}';
  }
}
function fbLoadPage() {
  var xhr = new XMLHttpRequest();
  var key, type, target;
  switch (g.pageType) {
    case 'album':
      key = '_media1xY4vu';
      type = 'PagePhotosTabAlbumPhotosGrid_react_AlbumRelayQL';
      target = 'Album {id,media' + (g.elms.length || g.last_fbid ?
        ('.after(' + g.last_fbid + ')') : '');
      break;
    case 'other':
      key = '_photos_by_others4vtdVT';
      type = 'PagePhotosTabPostByOthersPhotoGrids_react_PageRelayQL';
      target = 'Page {id,photos_by_others' + (g.elms.length || g.last_fbid ?
        ('.after(' + g.last_fbid + ')') : '');
      break;
    case 'posted':
    default:
      key = '_posted_photos1B25GG';
      type = 'PagePhotosTabAllPhotosGrid_react_PageRelayQL';
      target = 'Page {id,posted_photos' + (g.elms.length || g.last_fbid ?
        ('.after(' + g.last_fbid + ')') : '');
  }
  xhr.onload = function() {
    var r = extractJSON(this.responseText);
    var d = r.q0.response[g.pageAlbumId || g.pageId][key];
    var images = d.edges, img, e = [];
    var doc = document.createElement('div');
    for (var i = 0; i < images.length; i++) {
      img = images[i].node;
      doc.innerHTML = '<a href="' + img.url + '" rel="theater" data-date="' +
        img.modified_time + '"><img src="' + img._image1LP0rd.uri + '" alt="' +
        (img.message ? img.message.text : '') + '"></a>';
      e.push(doc.childNodes[0].cloneNode(true));
      g.last_fbid = images[i].cursor || img.id;
    }
    g.elms = g.elms.concat(e);
    if (g.pageType === 'album' && images.length) {
      g.photodata.aName = images[0].node.album.name;
    }

    g.statusEle.textContent = 'Loading album... (' + g.elms.length + ')';
    document.title = '(' + g.elms.length + ') ||' + g.photodata.aName;

    if (d.page_info && d.page_info.has_next_page && !qS('#stopAjaxCkb').checked) {
      setTimeout(fbLoadPage, 1000);
    } else {
      console.log('Loaded ' + g.elms.length + ' photos.');
      g.lastLoaded = 1;
      setTimeout(getPhotos, 1000);
    }
  }
  xhr.open('POST', 'https://www.facebook.com/api/graphqlbatch/');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  var q = JSON.stringify({q0 : {
    priority: 0,
    q: getQL(type, target, key),
    query_params: {}
  }});
  var data = '__user=' + g.Env.user + '&method=GET&response_format=json' +
    '&fb_dtsg=' + g.fb_dtsg + '&batch_name=' + type + '&queries=' + q;
  xhr.send(data);
}
function getFbDtsg() {
  var s = qSA('script');
  for (var i = 0; i < s.length; i++) {
    if (s[i].textContent.indexOf('DTSGInitialData') > 0) {
      s = s[i].textContent;
      break;
    }
  }
  s = s.slice(s.indexOf('DTSGInitialData'));
  s = s.slice(0, s.indexOf('}')).split('"');
  if (!s.length || !s[4]) {
    fbAutoLoadFailed();
    return;
  }
  g.fb_dtsg = s[4];
}
function fbAutoLoadFailed(){
  if(confirm('Cannot load required variable, refresh page to retry?')){
    location.reload();
  }else{
    g.lastLoaded=1;getPhotos();
  }
}
function fbAutoLoad(elms){
  var l; if(g.ajaxStartFrom){
    elms = [];
    g.elms = [];
    l = g.ajaxStartFrom;
  } else if (elms.length) {
    for (var i = elms.length - 1; i > elms.length - 5 && !l; i--) {
      l = getFbid(elms[i].href);
    }
    if(!l){
      alert("Autoload failed!");g.lastLoaded=1;getPhotos();
      return;
    }
  }
  if(!g.last_fbid){
    g.last_fbid = l;
  }else if(g.last_fbid==l){
    if(g.ajaxRetry<5 && elms.length > 2){l=elms[elms.length-2].href;l=l.slice(l.indexOf('=')+1,l.indexOf('&'));g.ajaxRetry++;}
    else if(confirm('Reaches end of album / Timeouted.\nTry again->OK\nOutput loaded photos->Cancel')){g.ajaxRetry=0;}else{g.lastLoaded=1;getPhotos();return;}
  }else{
    g.last_fbid=l;
  }
  var p=location.href+'&';var isAl=p.match(/media\/set|set=a/),aInfo={},isPS=p.match(/photos_stream/),isGp=p.match(/group/),isGraph=p.match(/search/);
  if (g.isPage) {
    if (!g.pageId){
      fbAutoLoadFailed();
      return;
    }
    if (p.match(/album_id=/)) {
      p = qS('.uiMediaThumb, [data-token] a');
      if (!p) {
        return fbAutoLoadFailed();
      }
      p = p.getAttribute('href').match(/a\.[\.\d]+/g);
      g.pageType = 'album';
      g.pageAlbumId = p[p.length - 1].split('.')[1];
    }
    getFbDtsg();
    g.elms = [];
    return fbLoadPage();
  }
  if(isGp){
    p=elms[0].href.split('&')[1];p=p.slice(p.indexOf('.')+1)
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":108,"group_id":p};
  }else if(isAl){
    if (!g.isPage) {
      p=p.match(/set=([a\.\d]*)&/)[1] || p.slice(p.indexOf('=')+1,p.indexOf('&'));
      aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":+p.slice(p.lastIndexOf('.')+1),"viewmode":null,"set":p,"type":"1"};
    }

    var token = qS("div[aria-role='tabpanel']");
    if (token && token.id) {
      token = token.id.split("_")[4];
      var user = token.split(':')[0];
      var tnext = qS('.fbPhotoAlbumTitle').nextSibling;
      var isCollab = tnext.className != 'fbPhotoAlbumActions' &&
        tnext.querySelectorAll('[data-hovercard]').length > 1;
      
      if (location.href.match(/collection_token/) || isCollab) {
        aInfo.collection_token = token;
        aInfo.profile_id = user;
      }
    }
  }else if(isGraph){
    var query = {};
    if(!g.query){
      var s=qSA("script"), temp=[];
      for(var i=0;i<s.length;i++){
        if (s[i].textContent.indexOf('encoded_query') > 0) {
          temp[0] = s[i].textContent;
        }
        if(s[i].textContent.indexOf('"cursor"') > 0 && 
          s[i].textContent.indexOf('"cursor":null') == -1) {
          temp[1] = s[i].textContent;
        }
      }
      query = temp[0];
      var cursor = temp[1];
      query = extractJSON(query);
      cursor = extractJSON(cursor);
      if (!query || !cursor) {
        fbAutoLoadFailed();
        return;
      }
      var rq = query.jsmods.require;
      for(i=0; i<rq.length; i++){
        if(rq[i][0] == "BrowseScrollingPager"){
          query = rq[i][3][1];
          break;
        }
      }
      rq = cursor.jsmods.require;
      for(i=0; i<rq.length; i++){
        if(rq[i][0] == "BrowseScrollingPager"){
          cursor = rq[i][3][0].cursor;
          break;
        }
      }
      query.cursor = cursor;
      query.ads_at_end = false;
      g.query = query;
    }else{
      query = g.query;
      query.cursor = g.cursor;
    }
    aInfo = query;
  }else if(!g.newL){
    var ele = qS('#pagelet_timeline_main_column');
    if (ele) {
      p = JSON.parse(ele.dataset.gt).profile_owner;
    } else if (ele = qS('#pagesHeaderLikeButton [data-profileid]')) {
      p = ele.dataset.profileid;
    } else {
      alert('Cannot get profile id!');
      return;
    }
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":+p,"tab_key":"photos"+(isPS?'_stream':''),"sk":"photos"+(isPS?'_stream':'')};
  }else{
    p = qS('#pagelet_timeline_medley_photos a[aria-selected="true"]');
    if (!p) {
      return alert('Please go to photos tab or album.');
    }
    p = p.getAttribute('aria-controls').match(/.*_(.*)/)[1];
    var userId = p.match(/(\d*):.*/)[1];
    var tab = p.split(':')[2];
    if(qS('.hidden_elem .fbStarGrid')){
      var t=qS('.hidden_elem .fbStarGrid');t.parentNode.removeChild(t);getPhotos();return;
    }
    aInfo={"scroll_load":true,"last_fbid":l,"fetch_size":32,"profile_id":userId,"tab_key":"photos"+(tab==5?'_stream':''),"sk":"photos"+(tab==5?'_stream':'')};
  }
  var ajaxAlbum = '';
  if(isGraph){
    ajaxAlbum=location.protocol+'//www.facebook.com/ajax/pagelet/generic.php/BrowseScrollingSetPagelet?data='+escape(JSON.stringify(aInfo))+'&__user='+g.Env.user+'&__a=1';
  }else if(!g.newL || isGp || isAl){
    var targetURL=(isGp?'GroupPhotoset':'TimelinePhotos'+(isAl?'Album':(isPS?'Stream':'')));
    ajaxAlbum=location.protocol+'//www.facebook.com/ajax/pagelet/generic.php/'+targetURL+'Pagelet?ajaxpipe=1&ajaxpipe_token='+g.Env.ajaxpipe_token+'&no_script_path=1&data='+JSON.stringify(aInfo)+'&__user='+g.Env.user+'&__a=1&__adt=2';
  }else{
    var req = 5+(qSA('.fbStarGrid>div').length-8)/8*2
    var tab=qSA('#pagelet_timeline_medley_photos a[role="tab"]');
    var pType = +p.split(':')[2], targetURL = "";
    switch(pType){
      case 4: targetURL = 'TimelinePhotos'; break;
      case 5: targetURL = 'TimelinePhotosStream'; break;
      case 70: targetURL = "UntaggedPhotosAppCollection";
      cursor = btoa('0:not_structured:'+l);
      aInfo = {"collection_token": p, "cursor": cursor, "tab_key": "photos_untagged","profile_id": +userId,"overview":false,"ftid":null,"sk":"photos"}; break;
    }
    ajaxAlbum=location.protocol+'//www.facebook.com/ajax/pagelet/generic.php/'+targetURL+'Pagelet?data='+escape(JSON.stringify(aInfo))+'&__user='+g.Env.user+'&__a=1';
  }
  var xhr = new XMLHttpRequest();
  xhr.onload = function(){
    clearTimeout( g.timeout );
    if(this.status!=200){
      if(!confirm('Autoload failed.\nTry again->OK\nOutput loaded photos->Cancel')){g.lastLoaded=1;}getPhotos();return;
    }
    var r=this.response,htmlBase=document.createElement('html');
    var newL = r.indexOf('for')==0;

    var eCount=0;
    if(!newL){
      htmlBase.innerHTML=r.slice(6,-7);
      var targetJS=htmlBase.querySelectorAll('script');
      for(var k=0;!newL && k<targetJS.length;k++){
        var t=targetJS[k].textContent,content=t.slice(t.indexOf(', {')+2,t.indexOf('}, true);}')+1);
        if(!content.length||t.indexOf('JSONPTransport')<0){continue;}
        content=JSON.parse(content);
        var d=document.createElement('div');
        d.innerHTML=content.payload.content.content;
        var e=d.querySelectorAll(g.thumbSelector);
        if(!e||!e.length)continue;
        eCount+=e.length;
        var old=elms?Array.prototype.slice.call(elms,0):'';
        g.elms=old?old.concat(Array.prototype.slice.call(e,0)):e;
      }
    }else{
      htmlBase.innerHTML = JSON.parse(r.slice(9)).payload;
      var e = [], temp = [];
      if(g.query){
        temp = htmlBase.querySelectorAll('a[rel="theater"]');
        for(k = 0; k < temp.length; k++){
          if (temp[k].querySelector('img')) {
            e.push(temp[k]);
          }
        }
        temp = [];
        if(e.length)g.cursor = parseQuery(e[e.length-1].href).opaqueCursor;
      }else{
        e = htmlBase.querySelectorAll(g.thumbSelector);
      }
      var map = {};
      for(k = 0; k < e.length; k++){
        if(!map[e[k].href]){
          map[e[k].href] = 1;
          temp.push(e[k]);
        }
      }
      e = temp;
      eCount+=e.length;
      var old=elms?Array.prototype.slice.call(elms,0):'';
      g.elms=old?old.concat(Array.prototype.slice.call(e,0)):e;
    }
    g.statusEle.textContent = 'Loading album... (' + g.elms.length + ')';
    document.title='('+g.elms.length+') ||'+g.photodata.aName;

    if(!eCount){log('Loaded '+g.elms.length+' photos.');g.lastLoaded=1;}
    if (g.ajaxStartFrom) {
      g.ajaxStartFrom = false;
    }
    setTimeout(getPhotos,1000);
  }
  xhr.open("GET", ajaxAlbum);
  g.timeout=setTimeout(function(){
    xhr.abort();
    if(g.ajaxRetry>5){if(confirm('Timeout reached.\nTry again->OK\nOutput loaded photos->Cancel')){g.ajaxRetry=0;}else{g.lastLoaded=1;}}getPhotos();
  },10000);
  xhr.send();
}
function instaAjax(){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var total=g.total, photodata=g.photodata,
    res=JSON.parse(this.response),elms=res.items;
    if(elms[0].id.indexOf('_')<0)elms=elms[3];
    g.ajax=res.more_available?elms[elms.length-1].id:null;
    for(var i=0;i<elms.length;i++){
      var url = parseFbSrc(elms[i].images.standard_resolution.url);
      var c = elms[i].comments, cList = [c.count];
      for(var k=0; k<c.data.length; k++){
        var p = c.data[k];if(p){
        cList.push({name: p.from.full_name || p.from.username, url: 'http://instagram.com/'+p.from.username, text: p.text, date: parseTime(p.created_time), id: elms[i].link});}
      }
      if(elms[i].videos){
        photodata.videos.push({
          url: elms[i].videos.standard_resolution.url,
          thumb: url
        });
      }
      photodata.photos.push({
        title: elms[i].caption?elms[i].caption.text:'',
        url: url,
        href: elms[i].link,
        date: elms[i].created_time?parseTime(elms[i].created_time):'',
        comments: c.count?cList:''
      });
    }
    log('Loaded '+photodata.photos.length+' of '+total+' photos.');
    g.statusEle.textContent='Loaded '+g.photodata.photos.length+' / '+total;
    document.title="("+g.photodata.photos.length+"/"+total+") ||"+g.photodata.aName;
    if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){output();}
    else if(total>photodata.photos.length&&g.ajax){instaAjax();}else{output();}
  };
  xhr.open("GET", 'https://www.instagram.com/'+g.Env.user.username+'/media/?max_id='+g.ajax);
  xhr.send();
}
function buildIgQuery(max_id, loadCm) {
  var comments = '';
  if (loadCm) {
    comments = 'comments.last(20) { count, nodes{created_at, text, user{username}} }, ';
  }
  return 'q=ig_user(' + g.Env.user.id + ') {media.after(' + max_id + ', 33) ' +
    '{count, nodes {__typename, caption, code, ' + comments + 'date, ' +
    'display_src, id, is_video, video_url, likes {count}, video_url }, ' +
    'page_info } } &ref=users%3A%3Ashow';
}
function _instaQueryAdd(elms) {
  for (var i = 0; i < elms.length; i++) {
    var c = elms[i].comments || {count: 0};
    var cList = [c.count];
    for (var k = 0; c.nodes && k < c.nodes.length; k++) {
      var p = c.nodes[k];
      if (p) {
        cList.push({
          name: p.user.username,
          url: 'http://instagram.com/' + p.user.username,
          text: p.text,
          date: parseTime(p.created_at)
        });
      }
    }
    
    var url;
    if (elms[i].__typename === 'GraphSidecar') {
      var edges = elms[i].edge_sidecar_to_children.edges;
      for (var j = 0; j < edges.length; j++) {
        var n = edges[j].node;
        url = parseFbSrc(n.display_url);
        if (n.is_video) {
          g.photodata.videos.push({
            url: n.video_url,
            thumb: url
          });
        }
        g.photodata.photos.push({
          title: elms[i].caption || '',
          url: url,
          href: 'https://www.instagram.com/p/' + n.code + '/',
          date: elms[i].date ? parseTime(elms[i].date) : '',
          comments: c.nodes && c.nodes.length && j === 0 ? cList : ''
        });
      }
    } else {
      url = parseFbSrc(elms[i].display_src);
      if (elms[i].is_video) {
        g.photodata.videos.push({
          url: elms[i].video_url,
          thumb: url
        });
      }
      g.photodata.photos.push({
        title: elms[i].caption || '',
        url: url,
        href: 'https://www.instagram.com/p/' + elms[i].code + '/',
        date: elms[i].date ? parseTime(elms[i].date) : '',
        comments: c.nodes && c.nodes.length ? cList : ''
      });
    }
  }
}
function _instaQueryProcess(elms) {
  for (var i = 0; i < elms.length; i++) {
    var feed = elms[i];
    if (feed.__typename === 'GraphSidecar' && !feed.edge_sidecar_to_children) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        var res = {};
        try {
          res = JSON.parse(this.response);
        } catch(e) {
          alert('Cannot get album content!');
        }
        elms[i] = res.media;
        _instaQueryProcess(elms);
      };
      xhr.open('GET', 'https://www.instagram.com/p/' + feed.code + '/?__a=1');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.send();
      return;
    }
  }
  _instaQueryAdd(elms);
  var total = g.total;
  var photodata = g.photodata;
  console.log('Loaded '+photodata.photos.length+' of '+total+' photos.');
  g.statusEle.textContent = 'Loaded ' + photodata.photos.length + ' / '+ total;
  document.title="("+photodata.photos.length+"/"+total+") ||"+photodata.aName;
  if (qS('#stopAjaxCkb') && qS('#stopAjaxCkb').checked) {
    output();
  } else if (g.ajax && +g.mode !== 2) {
    setTimeout(instaQuery, 1000);
  } else {
    output();
  }
}
function instaQuery() {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    if (xhr.status === 429) {
      alert('Too many request, Please try again later.');
      return output();
    }
    if (this.response[0] == '<') {
      if (confirm('Cannot load comments, continue?')) {
        g.loadCm = false;
        instaQuery();
      }
      return;
    }
    var res = JSON.parse(this.response).media;
    g.ajax = res.page_info.has_next_page ? res.page_info.end_cursor : null;
    _instaQueryProcess(res.nodes);
  };
  xhr.open('POST', 'https://www.instagram.com/query/');
  xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader('X-CSRFToken', g.token);
  xhr.setRequestHeader('X-Instagram-Ajax', 1);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send(buildIgQuery(g.ajax, g.loadCm));
}
function getInstagram() {
  if (g.start != 2 || g.start == 3) {
    return;
  }
  g.start = 3;
  if (g.Env.user.biography !== undefined) {
    if (!g.Env.media) {
      closeDialog();
      return alert('Cannot download private account.');
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var res = JSON.parse(this.response).user.media;
      g.ajax = res.page_info.has_next_page ? res.page_info.end_cursor : null;
      _instaQueryProcess(res.nodes);
    };
    xhr.open('GET', location.href + '?__a=1');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
  }
}
function getTwitter(){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var r = JSON.parse(this.responseText);
    g.ajax = r.min_position || '';
    var doc = getDOM(r.items_html);
    var elms = doc.querySelectorAll('.content');
    var photodata = g.photodata;
    var i, j, link, url, title, date;
    for(i = 0; i < elms.length; i++){
      link = elms[i].querySelectorAll('.js-adaptive-photo, [data-image-url]');
      if (!link.length) {
        link = elms[i].querySelectorAll('img[src*=media]');
      }
      for(j = 0; j < link.length; j++){
        url = link[j].getAttribute('data-image-url') || link[j].src;
        if (!url) {
          continue;
        }
        title = elms[i].querySelector('.tweet-text').innerHTML || '';
        title = title.replace(/href="\//g, 'href="https://twitter.com/');
        date = elms[i].querySelector('._timestamp, .js-short-timestamp');
        photodata.photos.push({
          title: title,
          url: url.replace(':large', '') + ':orig',
          href: 'https://twitter.com' + date.parentNode.getAttribute('href'),
          date: date ? parseTime(+date.getAttribute('data-time')) : '' 
        });
        if (!r.min_position) {
          var max_id = (date.parentNode.getAttribute('href') || '')
            .match(/status\/(\d+)/);
          if(max_id){
            g.ajax = max_id[1];
          }
        }
      }
    }
    log("Loaded", photodata.photos.length);
    document.title = photodata.photos.length + g.total + ' || ' + g.photodata.aName;
    g.statusEle.textContent = g.photodata.photos.length + g.total;
    if (qS('#stopAjaxCkb') && qS('#stopAjaxCkb').checked) {
      output();
    } else if (r.has_more_items && g.ajax && !g.ajaxStop) {
      setTimeout(getTwitter, 1000);
    } else {
      output();
    }
  };
  var url = 'https://twitter.com/i/profiles/show/'+g.photodata.aName+'/media_timeline?include_available_features=1&include_entities=1' + (g.ajax ? ('&max_position='+g.ajax) : '');
  xhr.open('GET', url);
  xhr.send();
}
function getWeibo(){
  if(!GM_xmlhttpRequest){alert("This script required Greasemonkey/Tampermonkey!");return;}
  GM_xmlhttpRequest({
    method: "GET",
    url: "http://photo.weibo.com/page/waterfall?filter=wbphoto&page="+g.ajaxPage+"&count=20&module_id=profile_photo&oid="+g.oId+"&uid=&lastMid="+g.ajax+"&lang=zh-tw",
    onload: function() {
    g.ajaxPage++;
    var r = this.response;
    var s = r.slice( r.indexOf("{"),r.lastIndexOf("}")+1 );
    var res = new Function("return " + s)().data;
    var elms = res.html;
    var photodata=g.photodata;
    var html;
    g.ajax=res.lastMid || null;
    for(var i=0;elms&&i<elms.length;i++){
      html = document.createElement("div");
      html.innerHTML = elms[i];
      var links = html.querySelectorAll("a.ph_ar_box");
      var img = html.querySelectorAll("img.photo_pic");
      var title = html.querySelector(".describe span").title || '';
      var photoTime = html.querySelector(".photo_time").textContent || '';
      for(var imgCount = 0; imgCount < img.length; imgCount++){
        var data = {};
        var link = links[imgCount].getAttribute("action-data").split("&");
        for(var j=0; j<link.length; j++){
          var t = link[j].split("=");
          data[t[0]] = t[1];
        }
        var url = img[imgCount].src.match(/http:\/\/([\w\.]+)\//);
        url = 'http://' + url[1] + '/large/' + data.pid + '.jpg';
        if(!g.downloaded[url]){g.downloaded[url]=1;}else{continue;}
        photodata.photos.push({
          title: title,
          url: url,
          href: 'http://photo.weibo.com/'+g.uId+'/talbum/detail/photo_id/'+data.mid,
          date: photoTime
        });
      }
    }
    log('Loaded '+photodata.photos.length+' photos.');
    document.title="("+g.photodata.photos.length+") ||"+g.photodata.aName;
    g.statusEle.textContent = 'Loaded ' + g.photodata.photos.length;
    if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){output();}
    else if(g.ajax){setTimeout(getWeibo, 2000);}else{output();}
  }
  });
}
function parsePinterest(list){
  var photodata = g.photodata;
  for(var j = 0; j < list.length; j++){
    if (list[j].name) {
      continue;
    }
    photodata.photos.push({
      title: list[j].description + '<br><a taget="_blank" href="' + 
        list[j].link + '">Pinned from ' + list[j].domain + '</a>',
      url: (list[j].images.orig || list[j].images['736x']).url,
      href: 'https://www.pinterest.com/pin/' + list[j].id + '/',
      date: new Date(list[j].created_at).toLocaleString()
    });
  }
  log('Loaded ' + photodata.photos.length + ' photos.');
}
function getPinterest(){
  var board = location.pathname.match(/\/(\S+)\/(\S+)\//);
  if(board){
    if (board[1] === 'pin') {
      closeDialog();
      var img = qS('.pinImage');
      if (img) {
        var link = document.createElement('a');
        link.href = img.getAttribute('src');
        link.download = '';
        link.click();
      }
      return;
    }
    // User's board / Search
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var html = this.response;
      var doc = getDOM(html);
      var s = doc.querySelectorAll('script');
      for (var i = 0; i < s.length; i++) {
        if (!s[i].src && s[i].textContent.match(/bookmarks":\W*\["/)) {
          s = s[i].textContent;
          break;
        }
      }
      var r = JSON.parse(s);
      var d = r.tree.children;
      for (i = 0; i < d.length; i++) {
        if (d[i].name.indexOf('Page') !== -1) {
          break;
        }
      }
      d = d[i].children;
      if (d[0] && d[0].children) {
        d = d[0].children;
      }
      var content = ['Grid', 'UserProfileContent'];
      for (i = 0; i < d.length; i++) {
        if (content.indexOf(d[i].name) !== -1 ||
          d[i].name.indexOf('PageContent') !== -1) {
          parsePinterest(d[i].data);
          g.bookmarks = d[i].resource.options;
          g.options = d[i].options;
        }
      }
      var type = ['search', 'source', 'explore'];
      var resources = ['Search', 'DomainFeed', 'InterestsFeed'];
      if (type.indexOf(board[1]) !== -1) {
        g.resource = resources[type.indexOf(board[1])] + 'Resource';
      } else if (qS('.UserProfileContent') && board[2] === 'likes') {
        g.resource = 'UserLikesResource';
        delete g.bookmarks.bookmarks;
      } else {
        g.resource = 'BoardFeedResource';
      }
      getPinterest_sub();
    };
    xhr.open('GET', location.href);
    xhr.send();
  }else{
    // Own Feed

  }
}
function getPinterest_sub(){
  var photodata = g.photodata;
  var board = location.pathname.match(/\/(\S+)\/(\S+)\//);
  if(board){
    // User's board / Search
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var r = JSON.parse(this.responseText);
      var d = r.module.tree;
      parsePinterest(d.data);
      g.options = d.options;
      g.bookmarks = d.resource.options;

      document.title="("+g.photodata.photos.length+") ||"+g.photodata.aName;
      g.statusEle.textContent = g.photodata.photos.length + '/' + g.total;
      if(qS('#stopAjaxCkb')&&qS('#stopAjaxCkb').checked){output();}
      else if(g.bookmarks.bookmarks[0] != '-end-'){
        setTimeout(getPinterest_sub, 1000);
      }else{
        output();
      }
    };
    var data = {
      "options" : g.bookmarks,
      "context": {},
      "module": {
        "name": "GridItems",
        "options": g.options
      },
      "module_path": "Button(class_name=primary, text=Close)"
    };
    var url = location.origin + '/resource/' + g.resource + '/get/';
    var data = 'source_url=' + 
      encodeURIComponent('/' + board[1] + '/' + board[2] + '/') + 
      '&data=' + escape(JSON.stringify(data)) + '&_=' + (+new Date());
    xhr.open('POST', url);
    xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var token = g.token || document.cookie.match(/csrftoken=(\S+);/)
    if(token){
      if(!g.token){
        token = token[1];
        g.token = token;
      }
      xhr.setRequestHeader('X-CSRFToken', token);
      xhr.setRequestHeader('X-NEW-APP', 1);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.send(data);
    }else{
      alert('Missing token!');
    }
  }else{
    // Own Feed
  }
}
function getAskFM() {
  var url = g.page || (location.protocol + '//ask.fm/' + g.username + 
    '/answers/more?page=' + g.page);
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var html = getDOM(this.response);
    var hasMore = html.querySelector('.viewMore');
    var elms = html.querySelectorAll('img');
    var i, box, link, title, url, video;
    var photodata = g.photodata;
    for (var i = 0; i < elms.length; i++) {
      box = getParent(elms[i], '.item');
      if (box.className == 'viewMore') {
        continue;
      }
      video = box.querySelector('video');
      if (video) {
        url = elms[i].src;
        photodata.videos.push({
          url: video.src,
          thumb: url
        });
      } else {
        url = elms[i].parentNode.getAttribute('data-url') ||
          elms[i].getAttribute('data-src');
      }
      link = box.querySelector('.streamItemsAge');
      title = 'Q: ' +  
        getText('.streamItemContent-question', 0, box) +
        ' <br>' + 'A: ' + getText('.streamItemContent-answer', 0, box);
      photodata.photos.push({
        title: title,
        url: url,
        href: 'https://ask.fm' + link.getAttribute('href'),
        date: link.getAttribute('data-hint')
      });
    }
    console.log('Loaded ' + photodata.photos.length + ' photos.');
    g.count += html.querySelectorAll('.item').length;
    g.statusEle.textContent = g.count + '/' + g.total;
    document.title = g.statusEle.textContent + ' ||' + g.title;
    if (g.count < g.total && hasMore && !qS('#stopAjaxCkb').checked) {
      g.page = location.origin + hasMore.dataset.url;
      setTimeout(getAskFM, 500);
    } else {
      if (photodata.photos.length) {
        output();
      } else {
        alert('No photos loaded.');
      }
    }
  };
  xhr.open('GET', url);
  xhr.send();
}

var dFAcore = function(setup, bypass) {
  g.start=1;g.settings={};
  if(!setup&&localStorage['dFASetting']){
    g.settings=localStorage['dFASetting']?JSON.parse(localStorage['dFASetting']):{};
  }
  g.mode=g.settings.mode||window.prompt('Please type your choice:\nNormal: 1/press Enter\nDownload without auto load: 2\nAutoload start from specific id: 3\nOptimization for large album: 4')||1;
  if(g.mode==null){return;}
  if(g.mode==3){g.ajaxStartFrom=window.prompt('Please enter the fbid:\ni.e. 123456 if photo link is:\nfacebook.com/photo.php?fbid=123456');if(!g.ajaxStartFrom){return;}}
  if(g.mode==4){g.largeAlbum=true;g.mode=window.prompt('Please type your choice:\nNormal: 1/press Enter\nDownload without auto load: 2\nAutoload start from specific id: 3');}
  g.loadCm=g.settings.notLoadCm?0:(g.settings.loadCm||confirm("Try to load photo's caption?"));
  g.notLoadCm=g.settings.notLoadCm||!g.loadCm;
  g.largeAlbum=g.settings.largeAlbum||g.largeAlbum;
  g.settings={mode:g.mode,loadCm:g.loadCm,largeAlbum:g.largeAlbum,notLoadCm:g.notLoadCm};
  localStorage['dFASetting']=JSON.stringify(g.settings);
  var aName=document.title,aAuth="",aDes="",aTime="";g.start=2;
  g.timeOffset=new Date().getTimezoneOffset()/60*-3600000;
  createDialog();
  g.statusEle = qS('.daCounter');
  if(location.href.match(/.*facebook.com/)){
    if(qS('.fbPhotoAlbumTitle')||qS('.fbxPhotoSetPageHeader')){
    aName=getText('.fbPhotoAlbumTitle')||getText("h2")||document.title;
    aAuth=getText('#fb-timeline-cover-name')||getText("h2")||getText('.fbStickyHeaderBreadcrumb .uiButtonText')||getText(".fbxPhotoSetPageHeaderByline a");
    if(!aAuth){aName=getText('.fbPhotoAlbumTitle'); aAuth=getText('h2');}
    aDes=getText('.fbPhotoCaptionText',1);
    try{aTime=qS('#globalContainer abbr').title;
    var aLoc=qS('.fbPhotoAlbumActionList').lastChild;
    if((!aLoc.tagName||aLoc.tagName!='SPAN')&&(!aLoc.childNodes.length||(aLoc.childNodes.length&&aLoc.childNodes[0].tagName!='IMG'))){aLoc=aLoc.outerHTML?" @ "+aLoc.outerHTML:aLoc.textContent;aTime=aTime+aLoc;}}catch(e){};
    }
    if(location.href.match('/search/')){
      var query = qS('input[name="q"][value]');
      aName = query ? query.value : document.title;
    }
    s = qSA("script");
    try{
      for(i=0,t, len = s.length; t=s[i].textContent, i<len; i++){
        if(t.match(/envFlush\({/)){
          g.Env=JSON.parse(t.slice(t.lastIndexOf("envFlush({")+9,-2)); break;
        }
      }
    }catch(e){alert('Cannot load required variable');}
    try{
      for(i=0; t=s[i].textContent, i<len; i++){
        var m = t.match(/"USER_ID":"(\d+)"/);
        if(m){
          g.Env.user = m[1]; break;
        }
      }
    }catch(e){console.warn(e);alert('Cannot load required variable');}
    if (!g.loadCm) {
      g.loadCm = confirm('Load caption to correct photos url?\n' +
        '(Not required for page)');
      g.notLoadCm = !g.loadCm;
    }
    g.ajaxLoaded=0;g.dataLoaded={};g.ajaxRetry=0;g.elms='';g.lastLoaded=0;g.urlLoaded={};
    g.thumbSelector = 'a.uiMediaThumb[ajaxify], a.uiMediaThumb[rel="theater"],' +
      'a.uiMediaThumbMedium';
    g.downloaded={};g.profilesList={};g.commentsList={count:0};
    g.photodata = {
      aName:aName.replace(/'|"/g,'\"'),
      aAuth:aAuth.replace(/'|"/g,'\"'),
      aLink:window.location.href,
      aTime:aTime,
      photos: [],
      aDes:aDes,
      largeAlbum:g.largeAlbum
    };
    g.newL = !!(qSA('#pagelet_timeline_medley_photos a[role="tab"]').length);
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      var html = this.response;
      var doc = getDOM(html);
      var pageId = doc.querySelector('[property="al:ios:url"]');
      if (pageId && pageId.getAttribute('content').indexOf('page') > 0) {
        g.isPage = true;
        g.pageId = pageId.getAttribute('content').match(/\d+/)[0];
      }
      
      if (location.href.match('messages')) {
        getFbMessagesPhotos();
      } else {
        getPhotos();
      }
    };
    xhr.open('GET', location.href);
    xhr.send();
  }else if(location.href.match(/.*instagram.com/)){
    if (location.pathname === '/') {
      return alert('Please go to profile page.');
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var html = this.response;
      var doc = getDOM(html);
      try {
        s = doc.querySelectorAll('script');
        for (i=0; i<s.length; i++) {
          if (!s[i].src && s[i].textContent.indexOf('_sharedData') > 0) {
            s = s[i].textContent;
            break;
          }
        }
        g.Env = JSON.parse(s.match(/({".*})/)[1]);
        g.token = g.Env.config.csrf_token;
        var data = g.Env.entry_data;
        if (data.ProfilePage) {
          g.Env = data.ProfilePage[0];
        } else {
          alert('Need to reload for required variable.');
          return location.reload();
        }
      } catch(e) {alert('Cannot load required variable!');}
      g.total = g.Env.user.media.count;
      aName = g.Env.user.full_name || 'Instagram';
      aAuth = g.Env.user.username;
      aLink = g.Env.user.external_url || ('http://instagram.com/'+  aAuth);
      g.Env.media = g.Env.user.media.nodes;
      var aTime = g.Env.media && g.Env.media.length ? 
        g.Env.media[0].date : 0;
      g.photodata = {
        aName: aName.replace(/'|"/g,'\"'),
        aAuth: aAuth,
        aLink: aLink,
        aTime: aTime ? 'Last Update: ' + parseTime(aTime) : '',
        photos: [],
        videos: [],
        aDes: (g.Env.user.bio || g.Env.user.biography || '').replace(/'|"/g,'\"')
      };
      getInstagram();
    };
    xhr.open('GET', location.href);
    xhr.send();
  }else if(location.href.match(/twitter.com/)){
    g.id = qS('.ProfileAvatar img').getAttribute('src').match(/\d+/);
    g.ajax = '';
    var name = qS('h1 a');
    var aTime = qS('.tweet-timestamp');
    var total = getText('.PhotoRail-headingWithCount').replace(',', '').match(/\d+/);
    g.total = total ? ('/' + total[0]) : '';
    g.photodata = {
      aName: name.getAttribute('href').slice(1),
      aAuth: name.textContent,
      aLink: location.href,
      aTime: aTime ? aTime.getAttribute('data-original-title') : "",
      photos: [],
      aDes: getText('.ProfileHeaderCard-bio', true)
    };
    getTwitter();
  }else if(location.href.match(/weibo.com/)){
    try{
      aName='微博配圖';
      aAuth=getText('.username') || qS('.pf_photo img') ? qS('.pf_photo img').alt : '';
    }catch(e){}
    g.downloaded = {};
    var k = qSA('script'), id = '';
    for(var i=0; i<k.length && !id.length; i++){
      var t = k[i].textContent.match(/\$CONFIG\['oid'\]/);
      if(t)id = k[i].textContent;
    }
    eval(id);
    if(!$CONFIG){alert("發生錯誤，請聯絡作者");return;}
    g.oId = $CONFIG.page_id || $CONFIG.oid;
    var uId = qS('[action-type="copy_cover"]') || qS('[action-type="webim.conversation"]');
    if(uId){
      uId = uId.getAttribute('action-data').match(/uid=(\d+)/);
      if(uId){
        g.uId = uId[1];
      }
    }
    g.ajaxPage = 1;
    g.ajax = ""
    g.photodata = {
      aName:aName,
      aAuth:aAuth,
      aLink:location.href,
      aTime:aTime,
      photos: [],
      aDes:""
    };
    getWeibo();
  }else if(location.href.match(/pinterest.com/)){
    g.photodata = {
      aName: getText('h1.boardName') || 'Pinterest',
      aAuth: getText('h4.fullname') || '',
      aLink: location.href,
      aTime: aTime,
      photos: [],
      aDes: aDes
    };
    g.total = getText('.pinsAndFollowerCount .value') || getText('.value');
    getPinterest();
  }else if(location.href.match(/ask.fm/)){
    g.count = 0;
    g.page = 0;
    g.total = +getText('.profileTabAnswerCount');
    g.title = document.title;
    g.username = getText('.profile-name span:nth-of-type(2)').slice(1);
    if (!g.username) {
      g.username = location.href.split('/')[3];
    }
    g.photodata = {
      aName: getText('.profile-name span:nth-of-type(1)'),
      aAuth: g.username,
      aLink: location.href,
      aTime: aTime,
      photos: [],
      videos: [],
      aDes: getText('#sidebarBio', 1)
    };
    getAskFM();
  }
};
function sendRequest(request, sender, sendResponse) {
switch(request.type){
  case 'store':
    localStorage["downAlbum"]=request.data;
    log(request.no+' photos data saved.'); break;
  case 'get':
    g.photodata=JSON.parse(localStorage["downAlbum"]);
    g.start=2;
    log(g.photodata.photos.length+' photos got.');
    getPhotos();
    break;
  case 'export':
    if(!request.data){request.data=JSON.parse(localStorage["downAlbum"]);}
    log('Exported '+request.data.photos.length+' photos.');
    var a,b=[],c=request.data;
    c.aName=(c.aName)?c.aName:"Facebook";
    var d = c.photos,totalCount = d.length;
    for (var i=0;i<totalCount;i++) {
      if(d[i]){
      var href=d[i].href?d[i].href:'',title=d[i].title||'',tag=d[i].tag||'',comments=d[i].comments||'',tagIndi='',dateInd='',commentInd='';
      href=href?' href="'+href+'" target="_blank"':'';
      if(tag){
        tag = tag.replace(/href="/g, 'target="_blank" href="https://www.facebook.com');
        tag='<div class="loadedTag">'+tag+'</div>';
        tagIndi='<i class="tagArrow tagInd"></i>';
      }
      if(comments){
        var co ='<div class="loadedComment">';
        try{
          if(comments[0]>comments.length-1){
            var cLink = comments[1].fbid ? ("https://www.facebook.com/photo.php?fbid="+comments[1].fbid) : comments[1].id;
            co += '<p align="center"><a href="'+cLink+'" target="_blank">View all '+comments[0]+' comments</a></p>';
          }
        }catch(e){}
        for(var ii=1; ii<comments.length; ii++){
          var p = comments[ii];
          co += '<blockquote><p>'+p.text+'</p><small><a href="'+p.url+'" target="_blank">'+p.name+'</a> '+(p.fbid?('<a href="https://www.facebook.com/photo.php?fbid='+p.fbid+'&comment_id='+p.id+'" target="_blank">'):'')+p.date+(p.fbid?'</a>':'')+'</small></blockquote>';
        }
        comments = co + '</div>';
        commentInd='<a title="Click to view comments" rel="comments"><i class="tagArrow commentInd"></i></a>';
      }
      if(d[i].date){dateInd='<div class="dateInd"><span>'+d[i].date+'</span> <i class="tagArrow dateInd"></i></div>';}
      var $t = [];
      var test = false;
      var test2 = false;
      try{if(title.match(/<.*>/))$t = $(title);}catch(e){}
      try{test = title.match(/hasCaption/) && $t.length;}catch(e){}
      try{test2 = title.match(/div/) && title.match(/span/)}catch(e){}
      try{
        if(test){
          var t=document.createElement('div');
          t.innerHTML=title;
          var junk=t.querySelector('.text_exposed_hide');
          if(junk&&junk.length)t.removeChild(junk);
          title = $t.html();
          if(title.indexOf("<br>") == 0)title = title.slice(4);
        }else if(test2){
          title = title.replace(/&(?!\w+([;\s]|$))/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        else if($t.length){
          try{
            $t.find('.text_exposed_hide').remove().end()
            .find('div *').unwrap().end()
            .find('.text_exposed_show').unwrap().end()
            .find('span').each(function() {$(this).replaceWith(this.childNodes);});
            title=$t.html();
          }catch(e){}
        }
      }catch(e){}
      title=title?'<div class="captions"><a class="captions" rel="captions"></a>'+title+'</div>':'<div class="captions"></div>';
      var a = '<div rel="gallery" class="item'+(c.largeAlbum?' largeAlbum':'')+'" id="item'+i+'"><a'+href+'>'+(i*1+1)+'</a>'+commentInd+tagIndi+dateInd+'<a class="fancybox" rel="fancybox" href="'+d[i].url+'" target="_blank"><div class="crop"><div style="background-image: url('+d[i].url+');" class="img"><img src="'+d[i].url+'"></div></div></a>'+title+tag+comments+'</div>';
      b.push(a)}
    }
    var tHTML='<!DOCTYPE html><html><body class="index">'+'<script>document.title=\''+c.aAuth+(c.aAuth?"-":"")+c.aName+'\';</script>';
    tHTML=tHTML+'<style>body{line-height:1;background:#f5f2f2;font-size:13px;color:#444;padding-top:70px;}.crop{width:192px;height:192px;overflow:hidden;}.crop img{display:none;}.img{width:192px;height:192px;background-size:cover;background-position:50% 25%;border:none;image-rendering:optimizeSpeed;}@media screen and (-webkit-min-device-pixel-ratio:0){.img{image-rendering: -webkit-optimize-contrast;}}header{display:block}.wrapper{width:960px;margin:0 auto;position:relative}#hd{background:#faf7f7;position:fixed;z-index:100;top:0;left:0;width:100%;}#hd .logo{padding:7px 0;border-bottom:1px solid rgba(0,0,0,0.2)}#container{width:948px;position:relative;margin:0 auto}.item{width:192px;float:left;padding:5px 15px 0;margin:0 7px 15px;font-size:12px;background:white;line-height:1.5}.item .captions{color:#8c7e7e;padding-bottom:15px;overflow:hidden;height:8px;position:relative;}.item .captions:first-child{position:absolute;width:100%;height:100%;top:0;left:0;z-index:1;}#logo{background-color:#3B5998;color:#FFF}#hd .logo h1{background-color:#3B5998;left:0;position:relative;width:100%;display:block;margin:0;color:#FFF;height:100%;font-size:20px}#logo a{color:#FFF}#logo a:hover{color:#FF9}progress{width:100%}#aDes{line-height:1.4;}.largeAlbum>a{visibility:visible;}.largeAlbum .fancybox{visibility:hidden;display:none;}.oImg{background-color:#FFC}\
      .twitter-emoji, .twitter-hashflag {height: 1.25em; width: 1.25em; padding: 0 .05em 0 .1em; vertical-align: -0.2em;}\
      /* drag */ #output{display:none;background:grey;min-height:200px;margin:20px;padding:10px;border:2px dotted#fff;text-align:center;position:relative;-moz-border-radius:15px;-webkit-border-radius:15px;border-radius:15px;}#output:before{content:"Drag and Drop images.";color:#fff;font-size:50px;font-weight:bold;opacity:0.5;text-shadow:1px 1px#000;position:absolute;width:100%;left:0;top:50%;margin:-50px 0 0;z-index:1;}#output img{display:inline-block;margin:0 10px 10px 0;} button{display:inline-block;vertical-align:baseline;outline:none;cursor:pointer;text-align:center;text-decoration:none;font:700 14px/100% Arial, Helvetica, sans-serif;text-shadow:0 1px 1px rgba(0,0,0,.3);color:#d9eef7;border:solid 1px #0076a3;-webkit-border-radius:.5em;-moz-border-radius:.5em;background-color:#59F;border-radius:.5em;margin:0 2px 12px;padding:.5em 1em .55em;}.cName{display:none;}#fsCount{position: absolute;top: 20;right: 20;font-size: 3em;}\
      /*! fancyBox v2.1.3 fancyapps.com | fancyapps.com/fancybox/#license */\
      .fancybox-wrap,.fancybox-skin,.fancybox-outer,.fancybox-inner,.fancybox-image,.fancybox-wrap iframe,.fancybox-wrap object,.fancybox-nav,.fancybox-nav span,.fancybox-tmp{border:0;outline:none;vertical-align:top;margin:0;padding:0;}.fancybox-wrap{position:absolute;top:0;left:0;z-index:8020;}.fancybox-skin{position:relative;background:#f9f9f9;color:#444;text-shadow:none;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;}.fancybox-opened{z-index:8030;}.fancybox-outer,.fancybox-inner{position:relative;}.fancybox-type-iframe .fancybox-inner{-webkit-overflow-scrolling:touch;}.fancybox-error{color:#444;font:14px/20px "Helvetica Neue",Helvetica,Arial,sans-serif;white-space:nowrap;margin:0;padding:15px;}.fancybox-image,.fancybox-iframe{display:block;width:100%;height:100%;}.fancybox-image{max-width:100%;max-height:100%;}#fancybox-loading,.fancybox-close,.fancybox-prev span,.fancybox-next span{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAACYBAMAAABt8RZRAAAAMFBMVEUAAAABAQEiIiIjIyM4ODhMTExmZmaCgoKAgICfn5+5ubnW1tbt7e3////+/v4PDw+0IcHsAAAAEHRSTlP///////////////////8A4CNdGQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAphJREFUSMftlE1oE0EUgNeCICru0YunaVNNSj3kbim5SqUECh7MxZMUvPQgKBQPggrSSy9SdFVC8Q8XwbNLpWhByRJQE5vsvimIFjxss14KmnTj/GR+Nrs9WH9OeZdlP96+nXnzvjG6qWHsDb+sVJK4AzSqfbgN767PXHimOMfu2zxCaPgujuGoWUA0RuyWjt0y4pHDGm43kQi7qvDF1xKf3lDYWZT4OJZ426Nfl1GO1nIk/tEgr9BEFpCnVRW4XSev87AEn8izJHHnIy1K9j5HnlMtgY98QCydJqPxjTi2gP4CnZT4MC2SJUXoOk/JIodqLHmJpatfHqRFCWMLnF+JbcdaRFmabcvtfHfPy82Pqs2HVlninKdadUw11tIauz+Y69ET+jGECyLdauiHdiB4yOgsvq/j8Bw8KqCRK7AWH4h99wAqAN/6p2po1gX/cXIGQwOZfz7I/xBvbW1VEzhijrT6cATNSzNn72ic4YDbcAvHcOQVe+32dBwsi8OB5wpHXkEc5YKm1M5XdfC+woFyZNi5KrGfZ4OzyX66InCHH3uJTqCYeorrTOCAjfdYXeCIjjeaYNNNxlNiJkPASym88566Aatc10asSAb6szvUEXQGXrD9rAvcXucr8dhKagL/5J9PAO1M6ZXaPG/rGrtPHkjsKEcyeFI1tq462DDVxYGL8k5aVbhrv5E32KR+hQFXKmNvGvrJ2941Rv1pU8fbrv/k5mUHl434VB11yFD5y4YZx+HQjae3pxWVo2mQMAfu/Dd3uDoJd8ahmOZOFr6kuYMsnE9xB+Xgc9IdEi5OukOzaynuIAcXUtwZ662kz50ptpCEO6Nc14E7fxEbiaDYSImuEaZhczc8iEEMYm/xe6btomu63L8A34zOysR2D/QAAAAASUVORK5CYII=);}#fancybox-loading{position:fixed;top:50%;left:50%;margin-top:-22px;margin-left:-22px;background-position:0 -108px;opacity:0.8;cursor:pointer;z-index:8060;}#fancybox-loading div{width:44px;height:44px;}.fancybox-close{position:absolute;top:-18px;right:-18px;width:36px;height:36px;cursor:pointer;z-index:8040;}.fancybox-nav{position:absolute;top:0;width:40%;height:100%;cursor:pointer;text-decoration:none;background:transparent url(data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==);-webkit-tap-highlight-color:rgba(0,0,0,0);z-index:8040;}.fancybox-prev{left:-30%;}.fancybox-next{right:-30%;}.fancybox-nav span{position:absolute;top:50%;width:36px;height:34px;margin-top:-18px;cursor:pointer;z-index:8040;visibility:hidden;}.fancybox-prev span{left:10px;background-position:0 -36px;}.fancybox-next span{right:10px;background-position:0 -72px;}.fancybox-tmp{position:absolute;top:-99999px;left:-99999px;visibility:hidden;max-width:99999px;max-height:99999px;overflow:visible!important;}.fancybox-overlay{position:absolute;top:0;left:0;overflow:hidden;display:none;z-index:8010;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjY3NjM0OUJFNDc1MTFFMTk2RENERUM5RjI5NTIwMEQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjY3NjM0OUNFNDc1MTFFMTk2RENERUM5RjI5NTIwMEQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCNjc2MzQ5OUU0NzUxMUUxOTZEQ0RFQzlGMjk1MjAwRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCNjc2MzQ5QUU0NzUxMUUxOTZEQ0RFQzlGMjk1MjAwRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgbXtVkAAAAPSURBVHjaYhDg4dkAEGAAATEA2alCfCIAAAAASUVORK5CYII=);}.fancybox-overlay-fixed{position:fixed;bottom:0;right:0;}.fancybox-lock .fancybox-overlay{overflow:auto;overflow-y:scroll;}.fancybox-title{visibility:hidden;font:normal 13px/20px "Helvetica Neue",Helvetica,Arial,sans-serif;position:relative;text-shadow:none;z-index:8050;}.fancybox-title-float-wrap{position:absolute;bottom:0;right:50%;margin-bottom:-35px;z-index:8050;text-align:center;}.fancybox-title-float-wrap .child{display:inline-block;margin-right:-100%;background:rgba(0,0,0,0.8);-webkit-border-radius:15px;-moz-border-radius:15px;border-radius:15px;text-shadow:0 1px 2px #222;color:#FFF;font-weight:700;line-height:24px;white-space:nowrap;padding:2px 20px;}.fancybox-title-outside-wrap{position:relative;margin-top:10px;color:#fff;}.fancybox-title-inside-wrap{padding-top:10px;}.fancybox-title-over-wrap{position:absolute;bottom:0;left:0;color:#fff;background:rgba(0,0,0,.8);padding:10px;}.fancybox-inner,.fancybox-lock{overflow:hidden;}.fancybox-nav:hover span,.fancybox-opened .fancybox-title{visibility:visible;}\
      #fancybox-buttons{position:fixed;left:0;width:100%;z-index:8050;}#fancybox-buttons.top{top:10px;}#fancybox-buttons.bottom{bottom:10px;}#fancybox-buttons ul{display:block;width:400px;height:30px;list-style:none;margin:0 auto;padding:0;}#fancybox-buttons ul li{float:left;margin:0;padding:0;}#fancybox-buttons a{display:block;width:30px;height:30px;text-indent:-9999px;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaBAMAAADKhlwxAAAAMFBMVEUAAAAAAAAeHh4uLi5FRUVXV1diYmJ3d3eLi4u8vLzh4eHz8/P29vb////+/v4PDw9Xwr0qAAAAEHRSTlP///////////////////8A4CNdGQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAbVJREFUWMPtlktugzAQhnPNnqLnSRuJXaRGVFm3NmFdPMC+YHqA8NiWBHBdlPgxETRIVatWjIQ0Hn/8DL9lywsxJRYz/T10h+uxkefyiUw6xPROpw33xZHHmm4yTD9WKg2LRHhZqumwuNDW77tQkAwCRTepx2VU5y/LSEMlXkPEc3AUHTJCCESn+S4FOaZa/F7OPqm/bDLyGXCmoR8a4nLkKLrupymiwT/Thz3ZbbWDK9ZPnzxuoMeZ6sSTdKLpGthShnP68EaGIX3MGKGFrx1cAXbQDbR0ypY0TDRdX9JKWtD8RawiZqz8CtMbnR6k1zVsDfod046RP8jnbt6XM/1n6WoSzX2ryLlo+dsgXaRWsSxFV1aDdF4kZjGP5BE0TAPj5vEOII+geJgm1Gz9S5p46RSaGK1fQUMwgabPkzpxrqcZWV/vYA5PE1anDG4nrDw4VpFR0ZDhTtbzLp7p/03LW6B5qnaXV1tL27X2VusX8RjdWnTH96PapbXLuzIe7ZvdxBb9OkbXvtga9ca4EP6c38hb5DymsbduWY1pI2/bcRp5W8I4bXmLnMc08hY5P+/L36M/APYreu7rpU5/AAAAAElFTkSuQmCC);background-repeat:no-repeat;outline:none;opacity:0.8;}#fancybox-buttons a:hover{opacity:1;}#fancybox-buttons a.btnPrev{background-position:5px 0;}#fancybox-buttons a.btnNext{background-position:-33px 0;border-right:1px solid #3e3e3e;}#fancybox-buttons a.btnPlay{background-position:0 -30px;}#fancybox-buttons a.btnPlayOn{background-position:-30px -30px;}#fancybox-buttons a.btnToggle{background-position:3px -60px;border-left:1px solid #111;border-right:1px solid #3e3e3e;width:35px;}#fancybox-buttons a.btnToggleOn{background-position:-27px -60px;}#fancybox-buttons a.btnClose{border-left:1px solid #111;width:35px;background-position:-56px 0;}#fancybox-buttons a.btnDisabled{opacity:0.4;cursor:default;}\
      .loadedTag, .loadedComment{display:none}.fbphotosphototagboxes{z-index:9997}.fancybox-nav{width:10%;}.tagArrow{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAABgCAMAAADfGilYAAABQVBMVEUAAABXV1dXV1dXV1dXV1dkZGRkZGQAAABXV1dXV1fj4+NXV1cAAAAAAABXV1dXV1cAAABXV1dXV1cdHR1XV1ciIiLi4uJXV1cnJyfl5eVXV1dXV1ff399XV1dXV1dXV1dXV1dXV1dXV1cXFxcAAABXV1dXV1dXV1cAAAA3NzdXV1dXV1dXV1cAAAAAAABXV1dXV1dXV1dXV1cAAAD+/v74+PhXV1dXV1f29vYeHh4tLS0AAAAyMjJXV1f5+flXV1f7+/v///9XV1dtfq9ugLCSn8PO0+Nrfqq9xdqKmL/x8fh1h7COnL5ugK/O1eKTocGkr87O1OTN0+Gnsc7L0eH4+PuRn8Crt85tgK/c4Oyos8+qtc1ugaytuNHx8vnX2+jx8viqtdFzhbOtt9ByhLHX3OiqtdC9xtuKl7/T2ebS2ObSpKIFAAAAQXRSTlMAFCzrgWZAfNNo5fkwLiY8MnLzhWCH49mJ5yp64x5CDo0yw4MG7Xz7Co0G1T5kSmwCk/1g/fcwOPeFiWKLZvn3+z0qeQsAAAJ7SURBVHhendLXctswEAXQJSVbVrdkW457r3FN7WUBkurFvab3/P8HZAGatCIsZ6zcJ2iOLrgYAKBcrrdbrXa9XAZApAX9RAQgaaNOW8lZWedMS11BmagOcKgAiY6VNAJp0DqQhpJWIC2A60CufVHLUBBDaaBOuJtOI5wA/QmOAzk2pr7y4QoBgpOe3pz0kE56eohaoiNlpYa1ipSq8v5b88vXoCE9VPGUuOdSyqZ7Ix1qqFYHwHOcyqeKIw988WpYkRWseQAdKWv4wXE6oVBHyw/1zZ+O/BzuRtG7fafPNJ2m/OiLPNByoCaoEjmyGsxW1VIlIXZIvECopCokyiVVQqnqipaLc0de3Iq8xCPpC142j7BLXM8N5OTXiZI7ZmAgCgYHiVhAJOJBEQ+aeNBkAEcaONLAkQaeCAyCu8XKRUAyNh6PANu6H+cBwBqK82Ar4mC2qFsmjKbF/AKR3QWWgqeCki7YMatL7CELdOeBEMUkdCeuaWvFWhVrM8DQpB3bF7vAkB1LbooCmEQAcyIPBo0TQH4RzOQs8ikb+OzlIDr8bnxogtc8DFlPaDgV/qQs2Jq4RnHWJJtgYV6kRw2imyukBSWvyOqmZFGIt7rTc9swsyZWrZUtMF/IrtiP2ZMMQEFsRrzEvJgDIgMoi3kg4p61PUVsTbJXsAf/kezDhMqOActL06iSYDpL0494gcyrx6YsKxhL4bNeyT7PQmYkhaUXpR55WRpRjdRIdmxi+x9JYGqjRJCB4XvDPYJvMDWWoeU69Aq+2/D/bQpO0Ea8EK0bspNQ2WY60alLisuJ9MMK/GaJ5I/Lt6QKS24obmSpn+kgAJ4gIi70k79vocBUxmfchgAAAABJRU5ErkJggg==);background-size: auto;background-repeat: no-repeat;display: inline-block;height: 11px;width: 20px;background-position: 0 -24px;margin-top:3px;}.tagInd{background-position: 0 -83px;float:right;}.dateInd{background-position:-12px 1px;text-indent:-100%;text-align:right;float:right;}.dateInd span{padding-right:3px;visibility:hidden;}.dateInd:hover span{visibility:visible;}.vis{visibility:visible !important;}.commentInd{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAGJJREFUKFNjgIGJi47+905fQBCD1EG1MDCABIgBIHVQLSRqmrP2wn8QHo6aeuYdAwugYxiA8cFBDtME04iOYRpBNDSgGVA0YcMwjSiaYABZIVQIBWQ3bsStCcolDhCvgYEBADd1oN6ZvLbPAAAAAElFTkSuQmCC);background-position:0 0;float:right;cursor:pointer;}blockquote {padding: 0 0 0 15px;margin: 0 0 20px;border-left: 5px solid #eeeeee;}blockquote p {margin-bottom: 0;line-height: 1.25;}blockquote small {display: block;line-height: 20px;color: #999999;font-size: 85%;}blockquote small:before {content: "— ";}\
      /* .borderTagBox & .innerTagBox */\
      .fbPhotosPhotoTagboxes{height:100%;left:0;position:absolute;top:0;width:100%;/*pointer-events:none*/}.fbPhotosPhotoTagboxes .tagsWrapper{display:inline-block;height:100%;width:100%;position:relative;vertical-align:middle}.fbPhotosPhotoTagboxBase{line-height:normal;position:absolute}.imageLoading .fbPhotosPhotoTagboxBase{display:none}/*.fbPhotosPhotoTagboxBase .borderTagBox, .fbPhotosPhotoTagboxBase .innerTagBox{-webkit-box-sizing:border-box;height:100%;width:100%}.ieContentFix{display:none;font-size:200px;height:100%;overflow:hidden;width:100%}.fbPhotosPhotoTagboxBase .innerTagBox{border:4px solid #fff;border-color:rgba(255, 255, 255, .8)}*/.fbPhotosPhotoTagboxBase .tag{bottom:0;left:50%;position:absolute}.fbPhotosPhotoTagboxBase .tagPointer{left:-50%;position:relative}.fbPhotosPhotoTagboxBase .tagArrow{left:50%;margin-left:-10px;position:absolute;top:-10px}.fbPhotosPhotoTagboxBase .tagName{background:#fff;color:#404040;cursor:default;font-weight:normal;padding:2px 6px 3px;top:3px;white-space:nowrap}.fancybox-inner:hover .fbPhotosPhotoTagboxes{opacity:1;z-index:9998;}.fbPhotosPhotoTagboxes .tagBox .tag{top:85%;z-index:9999}.fbPhotosPhotoTagboxes .tag, .fbPhotosPhotoTagboxes .innerTagBox, .fbPhotosPhotoTagboxes .borderTagBox{visibility:hidden}.tagBox:hover .tag/*, .tagBox:hover .innerTagBox*/{opacity:1;/*-webkit-transition:opacity .2s linear;*/visibility:visible}</style>';
    tHTML=tHTML+'<header id="hd"><div class="logo" id="logo"><div class="wrapper"><h1><a id="aName" href='+c.aLink+'>'+c.aName+'</a> '+((c.aAuth)?'- '+c.aAuth:"")+' <button onClick="cleanup()">ReStyle</button></h1><h1>Press Ctrl+S / [Mac]Command+S (with Complete option) to save all photos. [Photos are located in _files folder]</h1></div></div></header>';
    tHTML=tHTML+'<center id="aTime">'+c.aTime+'</center><br><center id="aDes">'+c.aDes+'</center><center>Download at: '+c.dTime+'</center><br><div id="output" class="cName"></div><div class="wrapper"><div id="bd"><div id="container" class="masonry">';
    tHTML=tHTML+b.join("")+'</div></div></div><script src="https://rawgit.com/inDream/DownAlbum/master/assets/jquery.min.js"></script></body></html>';
    var file = new File([tHTML], 'photos.html', {type: 'text/html;charset=utf-8'});
    window.open(window.URL.createObjectURL(file), '_blank');
    break;
    }
};

if (unsafeWindow !== undefined) {
  console = unsafeWindow.console;
  try {
    var expG = exportFunction(g, unsafeWindow, {defineAs: "g"});
    unsafeWindow.g = expG;
    var expCore = exportFunction(dFAcore, unsafeWindow, {defineAs: "dFAcore"});
    unsafeWindow.dFAcore = expCore;
  } catch (e) {
    unsafeWindow.dFAcore = dFAcore;
    unsafeWindow.g = g;
  }
  document.addEventListener("DOMContentLoaded", dFAinit, false);
  setTimeout(dFAinit, 2000);
} else {
  alert("Cannot init script. Please try Greasemonkey/Scriptish.");
}
