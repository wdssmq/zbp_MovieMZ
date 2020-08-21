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
      },
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
      },
    });
  }
  // main
  const objCur = { easy: 0 };

  objCur.link =
    "https://" + location.href.match(/movie.douban.com\/subject\/\d+\//);
  objCur.id = location.href.match(/(\d{7,8})/g);
  objCur.id = objCur.id[0];
  objCur.zhTitle = document.title.replace("(豆瓣)", "").trim();
  // objCur.fullTitle = $('#content h1>span[property="v:itemreviewed"]').text();
  // objCur.oriTitle = ((zh, full) => {
  //   return full.replace(zh, "").trim();
  // })(objCur.zhTitle, objCur.fullTitle);
  // objCur.akaTitle = ((el) => {
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
  const urlAPI = `https://api.rhilip.info/tool/movieinfo/gen?site=douban&sid=${objCur.id}`;
  console.log(urlAPI);
  getJSON(urlAPI, function (data) {
    console.log(data);
    objCur.year = data.year;
    objCur.aka = data.aka;
    objCur.akaTitle = data.aka.join(" / ");
    objCur.frgTitle = data.foreign_title.replace(/\s/g, ".");
    objCur.tags = data.genre;
    objCur.info = data.format;
  });
  console.log(objCur);
  // 点击事件
  $("h1>.year").click(function () {
    console.log(objCur);
    const urlPost = "-url-";
    postData(urlPost, JSON.stringify(objCur));
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
          $(this).text(`(${objCur.year.trim()})`);
        }
      )
      .delay(37)
      .animate({
        opacity: 1,
        fontSize: "26px",
      });
  });
})();
