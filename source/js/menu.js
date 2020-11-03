
  $(".sidebar-dropdown > a").click(function (e) {
    $(".sidebar-submenu").slideUp(200);
    if ($(this).parent().hasClass("active")) {
      $(".sidebar-dropdown").removeClass("active");
      $(this).parent().removeClass("active");
    } else {
      $(".sidebar-dropdown").removeClass("active");
      $(this).next(".sidebar-submenu").slideDown(200);
      $(this).parent().addClass("active");
    }
  });

  $("#close-sidebar").click(function (e) {
    e.preventDefault()
    $(".page-wrapper").removeClass("toggled");
  });
  $("#show-sidebar").click(function (e) {
    e.preventDefault()
    $(".page-wrapper").addClass("toggled");
  });
