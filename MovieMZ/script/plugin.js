$(function() {
  const html =
    '<p>\
<strong>\
-title-[-type-下载]：\
</strong>\
</p>\
<p><a target="_blank" href="-href-" title="-title-[-type-下载]">-href-</a></p>\
';
  function fnAddTi(str, i) {
    let ti = $("#edtTitle").val();
    if (ti.indexOf(str) > -1) {
      return;
    }
    let match = ti.match(/【([^】]+)】/g);
    if (!match) {
      return;
    }
    if (!match[i]) {
      ti += `【${str}】`;
    } else {
      ti = ti.replace(match[i], `${match[i]}/【${str}】`);
    }
    ti = ti.replace("】/【", "/");
    $("#edtTitle").val(ti);
    console.log(match);
  }
  function fnEd2k(str) {
    // str =
    // "ed2k://|file|The.Boss.Baby.2017.720p.BluRay.x264-SPARKS.mkv|3519491608|FE2EA99EC4D9A6C7C1D830C6BDA0026F|h=WR3ZY754P6TWINDWU6J4GNBDSZ2PHJ6L|/";
    // ed2k://|file|[毒液：致命守护者].Venom.2018.BluRay.1080p.x264.DTS-CMCT.mkv|10742193842|17b13dbbb460c53e57faff427fe6e806|/
    str = str.replace(/BluRay\.(720p|1080p)/, "$1.BluRay");
    // console.log(str);
    let objMatch = str.match(
      /ed2k:\/\/\|file\|\[?(?<name>[^\.\]]+)\]?.*(?<year>\d{4})\.(?<p>[^\.]+)\.(?<s>[^\.]+).+-(?<by>.+)\.mkv\|(?<size>\d+)\|.+?\|\//
    );
    // console.log(objMatch);
    if (!objMatch) {
      return false;
    }
    let arrMInfo = [
      objMatch.groups.name,
      objMatch.groups.year,
      objMatch.groups.p,
      objMatch.groups.s,
      (objMatch.groups.size / 1024 / 1024 / 1024).toFixed(2) + "G",
      "外挂字幕",
      objMatch.groups.by
    ];
    console.log(arrMInfo);
    let $text = $("#mmz-text");
    if ($text.data("title")) arrMInfo[0] = $text.data("title");
    if (!/\d+/.test(arrMInfo[2]) && /\d+/.test(arrMInfo[3])) {
      let tmp = arrMInfo[2];
      arrMInfo[2] = arrMInfo[3];
      arrMInfo[3] = tmp;
    }
    console.log(arrMInfo);
    if (/CMCT|CnSCG/.test(arrMInfo[6])) arrMInfo[5] = "中英字幕";
    if (/WiKi/.test(arrMInfo[6])) arrMInfo[5] = "内挂字幕";
    if (str.indexOf("2Audios") > -1) arrMInfo[5] = "国英双语";
    fnAddTi(arrMInfo[2], 2);
    fnAddTi("ed2k", 3);
    let content = getContent();
    if (content.indexOf(str) < 0) {
      content += "<hr class='movie' />";
      let add = html;
      let obj = {};
      obj.title = ("[" + arrMInfo.join("][") + "]")
        .replace("HDTV][", "HD-MKV/")
        .replace(/Bluray\]\[/i, "BD-MKV/");
      obj.href = str;
      obj.type = "ed2k";
      for (let x in obj) {
        let re = new RegExp(`-${x}-`, "g"); // re为/^\d+bl$/gim
        add = add.replace(re, obj[x]);
      }
      setContent(content + add);
    }
  }
  // MovieMZ_Slide();
  // $(".content-box ul.content-box-tabs li a.tab2").trigger("click");
  function fnMagnetSP(arr) {
    if (arr[0].indexOf("1080") > -1) {
      fnAddTi("1080p", 2);
    } else {
      fnAddTi("720p", 2);
    }
    fnAddTi("BT", 3);
    let obj = {};
    obj.title = arr[0].replace("资源名：", "").trim();
    obj.href = arr[1]
      .replace("磁力链：", "")
      .trim()
      .replace("&", "&amp;");
    obj.type = "BT";
    let $text = $("#mmz-text");
    if ($text.data("name") && $text.data("title"))
      obj.title = obj.title.replace($text.data("name"), $text.data("title"));
    let content = getContent();
    if (content.indexOf(obj.href) < 0) {
      content += "<hr class='movie' />";
      let add = html;
      for (let x in obj) {
        let re = new RegExp(`-${x}-`, "g"); // re为/^\d+bl$/gim
        add = add.replace(re, obj[x]);
      }
      setContent(content + add);
    }
  }
  $(".mmz-input").click(function() {
    let text = $("#mmz-text")
      .val()
      .trim();
    let arr = text.split("\n");
    $("#mmz-text").data("cache", "");
    let tmp = ["", ""];
    arr.forEach(ln => {
      /ed2k:\/\//.test(ln) && fnEd2k(ln.trim());
      tmp[0] = /资源名：/.test(ln) ? `${ln}` : tmp[0];
      tmp[1] = /磁力链：/.test(ln) ? `${ln}` : tmp[1];
      if (tmp[0] && tmp[1]) {
        fnMagnetSP(tmp);
        tmp = ["", ""];
      }
    });
    $("html, body").animate(
      {
        scrollTop: $("#insertintro").offset().top
      },
      200,
      function() {
        MovieMZ_Slide(1);
      }
    );
  });
  $(".js-savCookie").click(function() {
    let obj = {};
    obj.cate = [
      $("#cmbCateID option:selected").val(),
      $("#cmbCateID option:selected").text()
    ];
    obj.status = [
      $("#cmbPostStatus option:selected").val(),
      $("#cmbPostStatus option:selected").text()
    ];
    localStorage.MovieForm = JSON.stringify(obj);
    $(".js-lsCookie").html(`当前值：${obj.cate[1]} ${obj.status[1]}`);
  });
});
function MovieMZ_Slide(scroll = 0) {
  let $domBox = $("#MovieMZ-Wraper");
  MovieMZ_Get();
  if ($domBox.is(":hidden") || scroll) {
    let intH = $domBox.height() < 100 ? 478 : $domBox.height();
    $domBox
      .css({
        backgroundColor: "#fdfdfd",
        border: "1px solid #ccc",
        display: "block",
        position: "absolute",
        zIndex: "2000",
        margin: "5px 0 10px",
        padding: "10px",
        width: "820px",
        // height: "478px",
        opacity: scroll
      })
      .animate({
        top: ($(window).height() - intH) / 2 + $(window).scrollTop() - 59,
        left: ($(window).width() - $domBox.width()) / 2,
        height: "auto",
        opacity: 1
      })
      .draggable();
    $("#mmz-text").val("");
    $("#tab2 p").css({
      padding: "0.1em 0",
      lineHeight: "1.4em"
    });
  } else {
    $domBox.fadeOut();
  }
}
function MovieMZ_Get(id = "") {
  let $domBox = $("#MovieMZ-Box");
  Token = $('meta[name="MovieMZ-Token"]').attr("content");
  if (id !== "" && window.MovieData) {
    let data = window.MovieData[id];
    let inpTitle;
    if ($("#edtTitle").val().length > 0 && $("#edtTitle").val() !== "未命名") {
      return;
    }
    if (data.type) {
      inpTitle = `【${data.type}】${data.title}`;
    }
    inpTitle += `【${data.year}】`;
    $("#edtTitle").val(inpTitle);
    // $("#edtType").val(data.Type);
    if (data.easy) {
      // let add = "资源名称: " + data.title + "." + data.name + "\n" + data.info;
      data.info = data.info.replace("上映日期: ", "-more-\n上映日期: ");
      data.info = data.info.replace("首播: ", "-more-\n首播: ");
    }
    data.info = data.info.replace(/官方网站[^\n]+\n/g, "");
    data.info = data.info.replace(/\n/g, "</p>\n<p>");
    data.info = data.info.replace("<p>-more-</p>", '<hr class="more"/>');
    $("#editor_content").val(data.info);
    $("#edtTag").val(data.tags.join(","));
    setContent(data.info);

    $(".content-box ul.content-box-tabs li a.tab2").trigger("click");
    $("#mmz-text").val("");
    $("#mmz-text").data("title", data.title);
    $("#mmz-text").data("name", data.name.replace(/[\s:!]+/g, "."));
    if (localStorage.MovieForm) {
      let obj = JSON.parse(localStorage.MovieForm);
      $("#cmbCateID").val(obj.cate[0]);
      $("#cmbPostStatus").val(obj.status[0]);
      $(".js-lsCookie").html(`当前值：${obj.cate[1]} ${obj.status[1]}`);
    }
    return;
  }
  $.getJSON(ajaxurl + `MovieMZ&token=${Token}`, function(data) {
    let str =
      '<table class="tableFull tableBorder tableBorder-thcenter"><tr><th>时间</th><th>文章标题</th><th>内容</th><th>操作</th></tr>';
    window.MovieData = data.data;
    $.each(data.data, function(id, post) {
      // console.log(id, post);
      // return;
      str +=
        '<tr id="movie-' +
        id +
        '"><td class="td10 tdCenter" title="' +
        id +
        '">' +
        post.time +
        '</td><td class="td15 tdCenter" title="' +
        id +
        '">' +
        post.title +
        '</td><td title="' +
        id +
        '"><textarea style="width: 90%; height: 150px">' +
        post.info +
        '</textarea></td><td class="td15 tdCenter">' +
        '<a onclick="return MovieMZ_Get(' +
        id +
        ')" href="javascript:;"><img src="' +
        bloghost +
        'zb_system/image/admin/page_edit.png" alt="使用" title="使用" width="16"></a>&nbsp;&nbsp;&nbsp;&nbsp;' +
        '<a onclick="return MovieMZ_Del(' +
        id +
        ')" href="javascript:;" class="button"><img src="' +
        bloghost +
        '/zb_system/image/admin/delete.png" alt="删除" title="删除" width="16"></a></td></tr>';
    });
    str +=
      '</table><p style="text-align: right;"><input class="button" onclick="$(\'#MovieMZ-Wraper\').fadeOut();return false;" value="关闭" type="button" /></p>';
    $domBox.html(str);
  });
}
function MovieMZ_Del(id) {
  Token = $('meta[name="MovieMZ-Token"]').attr("content");
  $.getJSON(ajaxurl + `MovieMZ&id=${id}&token=${Token}`, function(data) {
    // console.log(data);
    $("#movie-" + id + " .td15").html("已删除");
  });
  return false;
}
function getContent() {
  return editor_api.editor.content.get();
}
function setContent(str) {
  editor_api.editor.content.put(str);
}
