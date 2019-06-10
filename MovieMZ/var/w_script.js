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
  $Show = $("#ShowDLBox,.mmz-show");
  $Box = $("#DLBox,.mmz-box");
  $Box.after('<div class="modal-backdrop fade"></div>');
  $Show.click(function() {
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
  $(document).delegate(".modal-backdrop,#close", "click", function() {
    $("#DLBox,.mmz-box,.modal-backdrop")
      .fadeOut(300)
      .removeClass("in"),
      !1;
  });
});
