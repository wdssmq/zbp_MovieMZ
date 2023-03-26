// ==UserScript==
// @name         「Z-BlogPHP」生成电影信息「标准版」
// @namespace    http://www.wdssmq.com/
// @author       沉冰浮水
// @version      0.2
// @description  按格式生成电影描述信息；
// @match        https://movie.douban.com/subject/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.slim.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// ==/UserScript==
(function () {
  "use strict";
  console.log("strart");
  const $ = window.jQuery;

  // 数据发送封装
  function postData(url, data, callback = function () { }) {
    GM_xmlhttpRequest({
      method: "POST",
      data: JSON.stringify(data),
      url: url,
      headers: {
        "User-agent": window.navigator.userAgent,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      onload: function (responseDetail) {
        if (responseDetail.status === 200) {
          callback(JSON.parse(responseDetail.responseText), url);
        } else {
          console.error(responseDetail);
        }
      },
    });
  }

  // API 请求封装
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

  function getData(obj) {
    const urlAPI = `http://api.iyuu.cn/index.php?s=App.Movie.Ptgen&url=${obj.link}`;
    console.log(urlAPI);
    getJSON(urlAPI, function (data, url) {
      if (data) {
        console.log(data);
        obj.info = data.data.format;
      }
    });
  }

  // Base Info
  $(".related-info h2 i").text($(".related-info h2 i").text() + ":");
  $(".related-info h2").html($(".related-info h2 i"));
  $(".attrs span:hidden,span.short").remove();
  $(".all.hidden").removeClass("hidden");
  let is_movie = $("a.bn-sharing[data-type='电影']").length > 0;
  let is_series = $("a.bn-sharing[data-type='电视剧']").length > 0;
  let is_anime = $("a[href='/tag/动画'], a[href='/tag/动漫']").length > 0;
  let is_document = $("span[property=\"v:genre\"]:contains(\"纪录片\")").length > 0;
  // const $imdb = $("div#info a[href^='http://www.imdb.com/title/tt']");
  // $imdb.html($imdb.attr("href"));

  // Main
  let obj = { easy: 0 };
  obj.link =
    "https://" + location.href.match(/movie.douban.com\/subject\/\d+\//);
  obj.id = location.href.replace(/[^\d]+/g, "");
  obj.zhTitle = document.title.replace("(豆瓣)", "").trim().replace(/\s/g, ".");
  obj.akaTitle = ((el) => {
    return el[0].nextSibling.nodeValue.trim();
  })($("#info span.pl:contains(\"又名\")"));
  obj.aka = obj.akaTitle.split(" / ");
  obj.type = (function () {
    if (is_anime) return "动画";
    if (is_document) return "纪录片";
    if (is_movie) return "电影";
    if (is_series) return "电视剧";
  })();

  obj.tags = $("#info span[property=\"v:genre\"]")
    .map(function () {
      // 类别
      return $(this).text().trim();
    })
    .toArray();
  obj.frgTitle = $("#content h1>span[property=\"v:itemreviewed\"]")
    .text()
    .replace(obj.zhTitle, "")
    .trim();
  obj.year = $("#content > h1 > span.year").text().substr(1, 4);
  if (obj.frgTitle) {
    obj.info = `中文名: ${obj.zhTitle}\n`;
    obj.info += `片名: ${obj.frgTitle}\n`;
    obj.frgTitle = obj.frgTitle.replace(/[\s:!]+/g, ".");
  } else {
    obj.info = `片名: ${obj.zhTitle}\n`;
  }
  obj.info += `年代: ${obj.year}\n`;
  obj.info += $("#info").text().trim() + "\n";
  // obj.info += `豆瓣链接: ${obj.link}\n`;
  obj.info += $(".rating_logo").text().trim() + ": ";
  obj.info += $(".rating_num").text().trim();
  obj.info += "\n";
  obj.info += $(".related-info").text().replace("©豆瓣", "").trim();
  obj.info = obj.info.replace(/\n[\s]+/g, "\n");
  obj.info = obj.info.replace(/官方网站: [^\n]+\n/g, "");
  console.log(obj);
  // 请求 API 数据，info 字段将被替换
  getData(obj);
  // 追加元素
  const $js_info = $("<span class=\"pl\">描述文本:</span>");
  const $js_btn = $("<a class=\"js-post2zbp\" href=\"javascript:void(0)\">发送至 Z-BlogPHP</a>");
  // const $js_edt = $('<span class="js-edt"></span>');
  $("#info").append($js_info).append(" ").append($js_btn).append(" ");
  $("#content h1,#info").append("<span class=\"js-edt\"></span>");
  // 绑定点击事件
  $("h1>.year,.js-post2zbp").click(function () {
    postData("-url-", obj, function (data) {
      console.log(data.data);
    });
    // 显示 Z-BlogPHP 新建文章链接
    $(".js-edt").html("<a href=\"-edtUrl-\" target=\"_blank\" rel=\"noopener noreferrer\">新建文章</a");
    // 写入剪切板
    // GM_setClipboard(obj.info);
    // 显示消息
    const _this = $(this);
    const _text = _this.text();

    _this
      .text(
        "已发送",
      );
    setTimeout(function () {
      if (!_this.hasClass("js-post2zbp")) {
        _this.text(_text);
      }
    }, 1000);
  });
})();
