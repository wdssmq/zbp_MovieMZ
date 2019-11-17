$(function() {
  $.fn.flash = function(a) {
    $(this).animate(
      {
        opacity: "toggle"
      },
      500,
      function() {
        "none" == $(this).css("display") && $(this).flash(0);
      }
    ),
      a > 1 && $(this).flash(a - 1);
  };
  $Show = $(".mmz-show");
  $Box = $(".mmz-box");
  $("body").append('<div class="modal-backdrop fade"></div>');
  $("body").append($Box);
  $Show.click(function() {
    let _this = $(this);
    if (!_this.hasClass("is-active") && _hmt) {
      _hmt.push(["_trackEvent", "电影下载", "查看"]);
      _this.addClass("is-active");
    }
    $Box
      .addClass("fade")
      .show()
      .css({
        top: ($(window).height() - $Box.height()) / 2 - 59 + "px",
        left: ($(window).width() - $Box.width()) / 2 + "px"
      })
      .addClass("in");
    $(".modal-backdrop")
      .show()
      .addClass("in");
    $(".js-flash").css({
      textShadow: "0 0 1px"
    });
    setTimeout(function() {
      $(".js-flash").flash(2);
    }, 50);
  });
  $(document).delegate(".modal-backdrop,.mmz-close", "click", function() {
    $(".mmz-box,.modal-backdrop")
      .removeClass("in")
      .fadeOut("slow"),
      !1;
  });
});
