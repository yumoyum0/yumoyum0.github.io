/**
 * Sets up Justified Gallery.
 */
if (!!$.prototype.justifiedGallery) {
  var options = {
    rowHeight: 140,
    margins: 4,
    lastRow: "justify"
  };
  $(".article-gallery").justifiedGallery(options);
}

$(document).ready(function() {

  /**
   * Shows the responsive navigation menu on mobile.
   */
  $("#header > #nav > ul > .icon").click(function() {
    $("#header > #nav > ul").toggleClass("responsive");
  });


  /**
   * Controls the different versions of  the menu in blog post articles 
   * for Desktop, tablet and mobile.
   */
  if ($(".post").length) {
    var menu = $("#menu");
    var nav = $("#menu > #nav");
    var menuIcon = $("#menu-icon, #menu-icon-tablet");

    /**
     * Display the menu on hi-res laptops and desktops.
     */
    if ($(document).width() >= 1440) {
      menu.show();
      menuIcon.addClass("active");
    }

    /**
     * Display the menu if the menu icon is clicked.
     */
    menuIcon.click(function() {
      if (menu.is(":hidden")) {
        menu.show();
        menuIcon.addClass("active");
      } else {
        menu.hide();
        menuIcon.removeClass("active");
      }
      return false;
    });

    /**
     * Add a scroll listener to the menu to hide/show the navigation links.
     */
    if (menu.length) {
      $(window).on("scroll", function() {
        var topDistance = menu.offset().top;

        // hide only the navigation links on desktop
        if (!nav.is(":visible") && topDistance < 50) {
          nav.show();
        } else if (nav.is(":visible") && topDistance > 100) {
          nav.hide();
        }

        // on tablet, hide the navigation icon as well and show a "scroll to top
        // icon" instead
        if ( ! $( "#menu-icon" ).is(":visible") && topDistance < 50 ) {
          $("#menu-icon-tablet").show();
          $("#top-icon-tablet").hide();
        } else if (! $( "#menu-icon" ).is(":visible") && topDistance > 100) {
          $("#menu-icon-tablet").hide();
          $("#top-icon-tablet").show();
        }
      });
    }

    /**
     * Show mobile navigation menu after scrolling upwards,
     * hide it again after scrolling downwards.
     */
    if ($( "#footer-post").length) {
      var lastScrollTop = 0;
      $(window).on("scroll", function() {
        var topDistance = $(window).scrollTop();

        if (topDistance > lastScrollTop){
          // downscroll -> show menu
          $("#footer-post").hide();
        } else {
          // upscroll -> hide menu
          $("#footer-post").show();
        }
        lastScrollTop = topDistance;

        // close all submenu"s on scroll
        $("#nav-footer").hide();
        $("#toc-footer").hide();
        $("#share-footer").hide();

        // show a "navigation" icon when close to the top of the page, 
        // otherwise show a "scroll to the top" icon
        if (topDistance < 50) {
          $("#actions-footer > #top").hide();
        } else if (topDistance > 100) {
          $("#actions-footer > #top").show();
        }
      });
    }

    /**
     * TOC IntersectionObserver for active link highlighting.
     * Watches all article headings and highlights corresponding TOC links.
     */
    (function initTocObserver() {
      var headings = document.querySelectorAll('.content.e-content h1, .content.e-content h2, .content.e-content h3, .content.e-content h4, .content.e-content h5, .content.e-content h6');
      if (!headings.length) return;

      var tocLinks = document.querySelectorAll('#toc .toc-link, #toc-footer .toc-link');
      if (!tocLinks.length) return;

      // Build a map from heading id to TOC links
      var linkMap = {};
      tocLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          var id = href.slice(1);
          if (!linkMap[id]) linkMap[id] = [];
          linkMap[id].push(link);
        }
      });

      // Track currently active heading
      var activeId = null;

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            // Clear previous active
            if (activeId && linkMap[activeId]) {
              linkMap[activeId].forEach(function(l) { l.classList.remove('active'); });
            }
            // Set new active
            activeId = entry.target.id;
            if (activeId && linkMap[activeId]) {
              linkMap[activeId].forEach(function(l) { l.classList.add('active'); });
            }
          }
        });
      }, {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0
      });

      headings.forEach(function(h) { observer.observe(h); });

      // Fallback: remove active on click to let CSS :target handle it
      // Also scroll TOC to keep active link visible
      document.querySelectorAll('#toc .toc-link, #toc-footer .toc-link').forEach(function(link) {
        link.addEventListener('click', function() {
          var parentToc = link.closest('#toc, #toc-footer');
          if (parentToc) {
            setTimeout(function() {
              var activeEl = parentToc.querySelector('.toc-link.active');
              if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }, 100);
          }
        });
      });
    })();
  }
});
