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
    let objMatch = str.match(
      /ed2k:\/\/\|file\|\[?([^\.\]]+)\]?.*(\d{4})\.([^\.]+)\.([^\.]+).+-(.+)\.mkv\|(\d+)\|.+?\|\//
    );
    if (!objMatch) {
      return false;
    }
    // console.log(objMatch);
    let arrMInfo = [
      objMatch[1],
      objMatch[2],
      objMatch[3],
      (objMatch[6] / 1024 / 1024 / 1024).toFixed(2) + "G",
      objMatch[4],
      "",
      objMatch[5]
    ];
    if (!/\d+/.test(arrMInfo[2]) && /\d+/.test(arrMInfo[4])) {
      let tmp = arrMInfo[2];
      arrMInfo[2] = arrMInfo[4];
      arrMInfo[4] = tmp;
    }
    console.log(arrMInfo);
    arrMInfo[5] = "中英字幕";
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
      // let add = html.replace(/-title-/g, title).replace(/-title-/g, title);
      setContent(content + add);
    }
  }
  $(".mmz-input").click(function() {
    let text = $("#mmz-text")
      .val()
      .trim();
    let arr = text.split("\n");
    arr.forEach(ln => {
      fnEd2k(ln.trim());
    });
  });
});
function MovieMZ_Slide() {
  let $domBox = $("#MovieMZ-Wraper");
  MovieMZ_Get();
  if ($domBox.is(":hidden")) {
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
        height: "478px",
        opacity: 0
      })
      .animate({
        top:
          ($(window).height() - $domBox.height()) / 2 + $(window).scrollTop(),
        left: ($(window).width() - $domBox.width()) / 2,
        opacity: 1
      })
      .draggable();
  } else {
    $domBox.fadeOut();
  }
}
function MovieMZ_Get(id = "") {
  let $domBox = $("#MovieMZ-Box");
  Token = $('meta[name="MovieMZ-Token"]').attr("content");
  if (id !== "" && window.MovieData) {
    let data = window.MovieData[id];
    if ($("#edtTitle").val().length > 0 && $("#edtTitle").val() !== "未命名") {
      return;
    }
    if (data.type) {
      data.title = `【${data.type}】${data.title}`;
    }
    data.title += `【${data.year}】`;
    $("#edtTitle").val(data.title);
    // $("#edtType").val(data.Type);
    if (data.easy) {
      // let add = "资源名称: " + data.title + "." + data.name + "\n" + data.info;
      data.info = data.info.replace("上映日期: ", "-more-\n上映日期: ");
      data.info = data.info.replace("首播: ", "-more-\n首播: ");
    }
    data.info = data.info.replace(/官方网站[^\n]+\n/g, "");
    data.info = data.info.replace(/\n/g, "</p><p>");
    data.info = data.info.replace("<p>-more-</p>", '<hr class="more"/>');
    $("#editor_content").val(data.info);
    $("#edtTag").val(data.tags.join(","));
    setContent(data.info);
    $(".content-box ul.content-box-tabs li a.tab2").trigger("click");
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
