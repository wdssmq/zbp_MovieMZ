$(function() {});
function MovieMZ_Slide() {
  $domBox = $("#MovieMZ-Box");
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
        height: "437px",
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
  $domBox = $("#MovieMZ-Box");
  Token = $('meta[name="MovieMZ-Token"]').attr("content");
  if (id !== "" && window.MovieData) {
    let data = window.MovieData[id];
    if ($("#edtTitle").val().length > 0 && $("#edtTitle").val() !== "未命名") {
      return;
    }
    $("#edtTitle").val(data.title);
    // $("#edtType").val(data.Type);
    if (data.easy) {
      // let add = "资源名称: " + data.title + "." + data.name + "\n" + data.info;
      data.info = data.info.replace(/上映日期/g, "-more-\n上映日期");
    }
    data.info = data.info.replace(/\n/g, "</p><p>");
    data.info = data.info.replace("<p>-more-</p>", '<hr class="more"/>');
    $("#editor_content").val(data.info);
    $("#edtTag").val(data.tags.join(","));
    // if ($("#edtAlias").val() == "") {
    //   $("#edtAlias").val(data.name.replace(/\s/g, "-"));
    // }

    // $("#cmbCateID").val(data.CateID);
    // $("#cmbPostStatus").val(data.Status);
    // $("#cmbTemplate").val(data.Template);
    // $("#edtDateTime").val(data.PostTime);

    // $("#edtIstop").val(data.IsTop);
    // $("#edtIslock").val(data.IsLock);

    // $("#editor_intro").val(data.Intro);
    setContent(data.info);
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
      '</table><p style="text-align: right;"><input class="button" onclick="$domBox.fadeOut();return false;" value="关闭" type="button" /></p>';
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
