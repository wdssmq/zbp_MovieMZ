// ==UserScript==
// @name         生成电影信息
// @namespace    https://www.wdssmq.com/
// @version      0.1
// @description  按格式生成电影描述信息；
// @author       沉冰浮水
// @match        https://movie.douban.com/subject/*
// @require      http://cdn.bootcss.com/jquery/3.2.1/jquery.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// ==/UserScript==
(function () {
  "use strict";
  console.log("strart");
  const $ = window.jQuery;
  // 定义基础方法
  function postData(url, data, callback = function () {}) {
    GM_xmlhttpRequest({
      method: "POST",
      data: data,
      url: url,
      headers: {
        "User-agent": window.navigator.userAgent,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      onload: function (responseDetail) {
        if (responseDetail.status === 200) {
          //let doc = (new DOMParser).parseFromString(responseDetail.responseText, 'text/html');
          // callback(doc, responseDetail, meta);
        }
      }
    });
  }
  function getJSON(url, callback) {
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      headers: {
        Accept: "application/json",
      },
      onload: function (response) {
        if (response.status >= 200 && response.status < 400) {
          callback(JSON.parse(response.responseText), url);
        } else {
          callback(false, url);
        }
      }
    });
  }
  // main
  const objCur = {};

  objCur.dbLink =
    "https://" + location.href.match(/movie.douban.com\/subject\/\d+\//);
  objCur.dbID = location.href.match(/(\d{7,8})/g);
  objCur.dbID = objCur.dbID[0];
  objCur.zhTitle = document.title.replace("(豆瓣)", "").trim();
  // objCur.fullTitle = $('#content h1>span[property="v:itemreviewed"]').text();
  // objCur.oriTitle = ((zh, full) => {
  //   let ori = full.replace(zh, "").trim();
  //   return ori;
  // })(objCur.zhTitle,objCur.fullTitle);
  // objCur.moreTitle = ((el)=>{
  //   return el[0].nextSibling.nodeValue.trim();
  // })($('#info span.pl:contains("又名")'));
  objCur.type = (() => {
    const is_movie = $("a.bn-sharing[data-type='电影']").length > 0;
    const is_series = $("a.bn-sharing[data-type='电视剧']").length > 0;
    const is_anime = $("a[href='/tag/动画'], a[href='/tag/动漫']").length > 0;
    const is_document =
      $('span[property="v:genre"]:contains("纪录片")').length > 0;
    if (is_anime) return "动画";
    if (is_document) return "纪录片";
    if (is_movie) return "电影";
    if (is_series) return "电视剧";
  })();
  // API Gen
  const urlAPI = `https://api.rhilip.info/tool/movieinfo/gen?site=douban&sid=${objCur.dbID}`;
  console.log(urlAPI);
  getJSON(urlAPI, function (data) {
    // console.log(data.format);
    objCur.year = data.year;
    objCur.format = data.format;
    objCur.tags = data.genre;
  });
  console.log(objCur);
  // 点击事件
  $("h1>.year").click(function () {
    const objPost = {
      type: objCur.type,
      title: objCur.zhTitle,
      id: objCur.dbID,
      tags: objCur.tags,
      year: objCur.year,
      easy: 0,
      info: objCur.format,
    };
    console.log(objCur, objPost);
    const urlPost = "-url-";
    postData(urlPost, JSON.stringify(objPost));
    GM_setClipboard(objCur.format);
    $(this)
      .css({ fontSize: "12px" })
      .html(
        '复制成功 <a href="-edtUrl-" target="_blank" rel="noopener noreferrer">新建文章</a>'
      )
      .delay(2737)
      .animate(
        {
          opacity: 0,
        },
        377,
        function () {
          $(this).text(`(${objPost.year.trim()})`);
        }
      )
      .delay(37)
      .animate({
        opacity: 1,
        fontSize: "26px",
      });
  });
})();
