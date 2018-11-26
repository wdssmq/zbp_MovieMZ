// ==UserScript==
// @name         生成电影信息
// @namespace    http://www.wdssmq.com/
// @version      0.1
// @description  按格式生成电影描述信息；
// @author       沉冰浮水
// @match        https://movie.douban.com/subject/*
// @require      http://cdn.bootcss.com/jquery/3.2.1/jquery.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// ==/UserScript==
(function() {
  "use strict";
  console.log("strart");
  const $ = window.jQuery;
  let fetch_anchor = function(anchor) {
    return anchor[0].nextSibling.nodeValue.trim();
  };
  // 定义基础方法
  function postData(url, data, callback = function() {}) {
    GM_xmlhttpRequest({
      method: "POST",
      data: data,
      url: url,
      headers: {
        "User-agent": window.navigator.userAgent,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      onload: function(responseDetail) {
        if (responseDetail.status === 200) {
          //let doc = (new DOMParser).parseFromString(responseDetail.responseText, 'text/html');
          // callback(doc, responseDetail, meta);
        }
      }
    });
  }
  function getDoc(url, meta, callback) {
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      headers: {
        "User-agent": window.navigator.userAgent,
        "Content-type": null
      },
      onload: function(responseDetail) {
        if (responseDetail.status === 200) {
          let doc = new DOMParser().parseFromString(
            responseDetail.responseText,
            "text/html"
          );
          callback(doc, responseDetail, meta);
        }
      }
    });
  }
  function getJSON(url, callback) {
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      headers: {
        Accept: "application/json"
      },
      onload: function(response) {
        if (response.status >= 200 && response.status < 400) {
          callback(JSON.parse(response.responseText), url);
        } else {
          callback(false, url);
        }
      }
    });
  }
  let douban_link, douban_id;

  douban_link =
    "https://" + location.href.match(/movie.douban.com\/subject\/\d+\//);
  douban_id = location.href.match(/(\d{7,8})/g);
  douban_id = douban_id[0];
  let poster;
  let this_title, trans_title, aka;
  let year, region, genre, language, playdate;
  let imdb_link, imdb_id, imdb_average_rating, imdb_votes, imdb_rating;
  let douban_average_rating, douban_votes, douban_rating;
  let episodes, duration;
  let director, writer, cast;
  let tags, introduction, awards;

  $("h1>.year").click(function() {
    let rlt = fnGen();
    let movieclip = rlt
      .replace(/<br>/gi, "\n")
      .replace(/<a [^>]*>/g, "")
      .replace(/<\/a>/g, "");
    postData("-url-", fnGenPost({ info: movieclip }));
    GM_setClipboard(movieclip);
    $(this)
      .css({ fontSize: "12px" })
      .text("复制成功")
      .delay(737)
      .animate(
        {
          opacity: 0
        },
        377,
        function() {
          $(this).text(`(${year.trim()})`);
        }
      )
      .delay(37)
      .animate({
        opacity: 1,
        fontSize: "26px"
      });
  });
  let fnGenPost = function(data) {
    // console.log(data);
    let obj = { title: trans_title, id: douban_id, tags: genre.split("/") };
    obj.name = this_title;
    obj.type = (function() {
      if (is_anime) return "动画";
      if (is_document) return "纪录片";
      if (is_movie) return "电影";
      if (is_series) return "电视剧";
    })();
    return JSON.stringify($.extend(data, obj));
  };
  let fnGen = function() {
    let descr = "";
    descr += poster ? `[img]${poster}[/img]\n\n` : "";
    descr += trans_title ? `◎译　　名　${trans_title}\n` : "";
    descr += this_title ? `◎片　　名　${this_title}\n` : "";
    descr += year ? `◎年　　代　${year.trim()}\n` : "";
    descr += region ? `◎产　　地　${region}\n` : "";
    descr += genre ? `◎类　　别　${genre}\n` : "";
    descr += language ? `◎语　　言　${language}\n` : "";
    descr += playdate ? `◎上映日期　${playdate}\n` : "";
    descr += imdb_rating ? `◎IMDb评分  ${imdb_rating}\n` : "";
    // 注意如果长时间没能请求完成imdb信息，则该条不显示
    descr += imdb_link ? `◎IMDb链接  ${imdb_link}\n` : "";
    descr += douban_rating ? `◎豆瓣评分　${douban_rating}\n` : "";
    descr += douban_link ? `◎豆瓣链接　${douban_link}\n` : "";
    descr += episodes ? `◎集　　数　${episodes}\n` : "";
    descr += duration ? `◎片　　长　${duration}\n` : "";
    descr += director ? `◎导　　演　${director}\n` : "";
    descr += writer ? `◎编　　剧　${writer}\n` : "";
    descr += cast
      ? `◎主　　演　${cast
          .replace(/\n/g, "\n" + "　".repeat(4) + "  　")
          .trim()}\n`
      : "";
    descr += tags ? `\n◎标　　签　${tags}\n` : "";
    descr += introduction
      ? `\n◎简　　介\n\n　　${introduction.replace(
          /\n/g,
          "\n" + "　".repeat(2)
        )}\n`
      : "";
    descr += awards
      ? `\n◎获奖情况\n\n　　${awards.replace(/\n/g, "\n" + "　".repeat(2))}\n`
      : "";
    console.log(descr);
    return descr;
  };

  // 先对一些关键信息进行判断
  let aka_anchor = $('#info span.pl:contains("又名")');
  let has_aka = aka_anchor.length > 0;
  let has_imdb =
    $("div#info a[href^='http://www.imdb.com/title/tt']").length > 0;
  let is_movie = $("a.bn-sharing[data-type='电影']").length > 0;
  let is_series = $("a.bn-sharing[data-type='电视剧']").length > 0;
  let is_anime = $("a[href='/tag/动画'], a[href='/tag/动漫']").length > 0;
  let is_document = $('span[property="v:genre"]:contains("纪录片")').length > 0;

  // 页面元素定位
  let regions_anchor = $('#info span.pl:contains("制片国家/地区")');

  let language_anchor = $('#info span.pl:contains("语言")');

  let episodes_anchor = $('#info span.pl:contains("集数")');

  let duration_anchor = $('#info span.pl:contains("单集片长")');

  // 基础Movieinfo信息
  let chinese_title = document.title.replace("(豆瓣)", "").trim();
  console.log(chinese_title);
  let foreign_title = $('#content h1>span[property="v:itemreviewed"]')
    .text()
    .replace(chinese_title, "")
    .trim();

  if (has_aka) {
    aka = fetch_anchor(aka_anchor)
      .split(" / ")
      .sort(function(a, b) {
        //首字(母)排序
        return a.localeCompare(b);
      })
      .join("/");
  }

  if (foreign_title) {
    trans_title = chinese_title + (aka ? "/" + aka : "");
    this_title = foreign_title;
  } else {
    trans_title = aka ? aka : "";
    this_title = chinese_title;
  }

  playdate = $('#info span[property="v:initialReleaseDate"]')
    .map(function() {
      return $(this)
        .text()
        .trim();
    })
    .toArray()
    .sort(function(a, b) {
      return new Date(a) - new Date(b);
    })
    .join("/");

  year =
    " " +
    $("#content > h1 > span.year")
      .text()
      .substr(1, 4);
  region = regions_anchor[0]
    ? fetch_anchor(regions_anchor)
        .split(" / ")
        .join("/")
    : null;
  language = language_anchor[0]
    ? fetch_anchor(language_anchor)
        .split(" / ")
        .join("/")
    : "";
  episodes = episodes_anchor[0] ? fetch_anchor(episodes_anchor) : null;
  duration = duration_anchor[0]
    ? fetch_anchor(duration_anchor)
    : $('#info span[property="v:runtime"]')
        .text()
        .trim();

  let is_europe = region.match(/美国|英国|丹麦/);
  let is_japan = region.match(/日本/);
  let is_korea = region.match(/韩国/);
  let is_thai = region.match(/泰国/);
  let is_mainland = region.match(/中国大陆/);
  let is_mandarine = language.match(/汉语普通话/);
  genre = $('#info span[property="v:genre"]')
    .map(function() {
      //类别
      return $(this)
        .text()
        .trim();
    })
    .toArray()
    .join("/");
  if (has_imdb) {
    let imdb_link_anchor = $('#info span.pl:contains("IMDb链接")');
    imdb_link = imdb_link_anchor
      .next()
      .attr("href")
      .replace(/(\/)?$/, "/")
      .replace("http://", "https://");
    imdb_id = imdb_link.match(/tt\d+/)[0];
    getDoc(imdb_link, null, function(doc) {
      // 评分，Metascore，烂番茄
      imdb_average_rating = $("div.ratingValue strong span", doc).text();
      imdb_votes = $("div.imdbRating a span", doc).text();
      imdb_rating = imdb_votes
        ? imdb_average_rating + "/10 from " + imdb_votes + " users"
        : ""; // MovieinfoGen 相关
    });
  }
  getDoc(douban_link + "awards/", null, function(doc) {
    awards = $("#content>div>div.article", doc)
      .html()
      .replace(/[ \n]/g, "")
      .replace(/<\/li><li>/g, "</li> <li>")
      .replace(/<\/a><span/g, "</a> <span")
      .replace(/<(div|ul)[^>]*>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/ +\n/g, "\n")
      .trim();
  }); // 该影片的评奖信息
  getJSON("https://api.douban.com/v2/movie/" + douban_id, function(data1) {
    douban_average_rating = data1.rating.average || 0;
    douban_votes = data1.rating.numRaters.toLocaleString() || 0;
    douban_rating =
      douban_average_rating + "/10 from " + douban_votes + " users";
    introduction = data1.summary.replace(/^None$/g, "暂无相关剧情介绍");
    poster = data1.image.replace(/s(_ratio_poster|pic)/g, "l");
    director = data1.attrs.director ? data1.attrs.director.join(" / ") : "";
    writer = data1.attrs.writer ? data1.attrs.writer.join(" / ") : "";
    cast = data1.attrs.cast ? data1.attrs.cast.join("\n") : "";
    tags = data1.tags
      .map(function(member) {
        return member.name;
      })
      .join(" | ");
  });
})();
