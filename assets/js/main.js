
(function() {
  "use strict";

  const localization = {
    en: {
      availableIn: "Available in {days} days",
      submittedOn: "Submitted on {date}",
      presentedOn: "Presented on {date}"
    },
    tr: {
      availableIn: "{days} gün içinde mevcut",
      submittedOn: "Gönderildi: {date}",
      presentedOn: "Sunuldu: {date}"
    },
    es: {
      availableIn: "Disponible en {days} días",
      submittedOn: "Enviado el {date}",
      presentedOn: "Presentado el {date}"
    },
    de: {
      availableIn: "Verfügbar in {days} Tagen",
      submittedOn: "Eingereicht am {date}",
      presentedOn: "Präsentiert am {date}"
    }
  };
  let currentLanguage = 'en';

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  // Initialize translations immediately on page load
  document.addEventListener("DOMContentLoaded", function() {
    updateTranslations();
    updateTimeLeft(currentLanguage);
  });

  function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (localization[currentLanguage][key]) {
        el.innerHTML = localization[currentLanguage][key];
      }
    });
  }


  window.addEventListener('load', () => {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = currentYear;
    }
  });



  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 24
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 40
      },

      1200: {
        slidesPerView: 3,
      }
    }
  });

  /**
   * Hide top banner when close icon is clicked
   */
  const bannerClose = select('#banner-close');
  if (bannerClose) {
    on('click', '#banner-close', function() {
      const topBanner = select('#top-banner');
      const header = select('#header');
      if (topBanner) {
        topBanner.style.display = 'none';
        header.style.top = '0';
      }
    });
  }

  function updateTimeLeft(currentLanguage) {
    const now = new Date();
    const specificationDate = new Date(2023, 10, 17, 10, 0);  // November 17 at 10:00 - Spec report deadline 
    const requirementsDate = new Date(2023, 11, 8, 10, 0); // December 8 at 10:00 - Req report deadline 
    const presentationDate = new Date(2023, 11, 20, 10, 0); // December 20 at 10:00 - Presentation deadline
    
    const detailedDesignDate = new Date(2024, 2, 15, 10, 0); // March 15 at 10:00 - Detailed Report deadline 
    const finalReportDate = new Date(2024, 4, 13, 10, 0); // May 14 at 10:00 - Final Report deadline
    const springPresentationDate = new Date(2024, 4, 10, 10, 0); // Last Day of Semester at 10:00
    
    
    const specificationTimeLeft = Math.ceil((specificationDate - now) / (1000 * 60 * 60 * 24));
    const requirementsTimeLeft = Math.ceil((requirementsDate - now) / (1000 * 60 * 60 * 24));
    const presentationTimeLeft = Math.ceil((presentationDate- now) / (1000 * 60 * 60 * 24));
    const detailedDesignDateLeft = Math.ceil((detailedDesignDate - now) / (1000 * 60 * 60 * 24));
    const finalReportDateLeft = Math.ceil((finalReportDate - now) / (1000 * 60 * 60 * 24));
    const springPresentationDateLeft = Math.ceil((springPresentationDate - now) / (1000 * 60 * 60 * 24));

    const specificationNote = document.getElementById("specification-note");
    const requirementsNote = document.getElementById("requirements-note");
    const presentationNote = document.getElementById("presentation-note");
    const detailedDesignNote = document.getElementById("detailed-design-note");
    const finalReportNote = document.getElementById("final-report-note");
    const springPresentationNote = document.getElementById("spring-presentation-note");
    const specificationLink = document.getElementById("specification-link");
    const requirementsLink = document.getElementById("requirements-link");
    const presentationLink = document.getElementById("presentation-link");
    const detailedDesignLink = document.getElementById("detailed-design-report-link");
    const finalReportLink = document.getElementById("final-report-link");
    const springPresentationLink = document.getElementById("spring-presentation-link");

    if (specificationTimeLeft > 0) {
      specificationNote.textContent = localization[currentLanguage].availableIn.replace('{days}', specificationTimeLeft);
    } else {
      specificationNote.textContent = localization[currentLanguage].submittedOn.replace('{date}', "17/11/2023");
      specificationLink.style.display = 'block';
    }

    if (requirementsTimeLeft > 0) {
      requirementsNote.textContent = localization[currentLanguage].availableIn.replace('{days}', requirementsTimeLeft);
    } else {
      requirementsNote.textContent = localization[currentLanguage].submittedOn.replace('{date}', "08/12/2023");
      requirementsLink.style.display = 'block';
    }
    if (presentationTimeLeft > 0) {
      presentationNote.textContent = localization[currentLanguage].availableIn.replace('{days}', presentationTimeLeft);
    } else {
      presentationNote.textContent = localization[currentLanguage].presentedOn.replace('{date}', "05/12/2023");
      presentationLink.style.display = 'block';
    }
    if (detailedDesignDateLeft > 0) {
      detailedDesignNote.textContent = localization[currentLanguage].availableIn.replace('{days}', detailedDesignDateLeft);
    } else {
      detailedDesignNote.textContent = localization[currentLanguage].submittedOn.replace('{date}', "15/03/2024");
      detailedDesignLink.style.display = 'block';
    }
    if (finalReportDateLeft > 0) {
      finalReportNote.textContent = localization[currentLanguage].availableIn.replace('{days}', finalReportDateLeft);
    } else {
      finalReportNote.textContent = localization[currentLanguage].submittedOn.replace('{date}', "13/05/2024");
      finalReportLink.style.display = 'block';
    }
    if (springPresentationDateLeft > 0) {
      springPresentationNote.textContent = localization[currentLanguage].availableIn.replace('{days}', springPresentationDateLeft);
    } else {
      springPresentationNote.textContent = localization[currentLanguage].presentedOn.replace('{date}', "10/05/2024");
      springPresentationLink.style.display = 'block';
    }
  }

  // Update time left immediately and then every day
  updateTimeLeft(currentLanguage);
  setInterval(updateTimeLeft, 24 * 60 * 60 * 1000);

  document.addEventListener("DOMContentLoaded", function() {
   
    const deadlines = [
      {deadline: new Date(2023, 10, 17, 10, 0), labelSelector: '.new-label-specification'}, // November 17 at 10:00 - Spec report deadline
      {deadline: new Date(2023, 11, 8, 10, 0), labelSelector: '.new-label-requirements'}, // December 8 at 10:00 - Req report deadline
      {deadline: new Date(2023, 11, 20, 10, 0), labelSelector: '.new-label-presentation'}, // December 20 at 10:00 - Presentation deadline
      {deadline: new Date(2024, 2, 15, 10, 0), labelSelector: '.new-label-detailedDesign'}, // March 15 at 10:00 - Detailed Report deadline
      {deadline: new Date(2024, 4, 13, 10, 0), labelSelector: '.new-label-finalReport'}, // May 11 at 10:00 - Final Report deadline
      {deadline: new Date(2024, 4, 10, 10, 0), labelSelector: '.new-label-springPresentation'}, // May 17 at 10:00 - Last Day of Semester
  ];
  
    const currentDate = new Date();

    // Iterate over each deadline
    deadlines.forEach(({deadline, labelSelector}) => {
        const differenceInDays = (currentDate - deadline) / (1000 * 60 * 60 * 24);

        
        if (differenceInDays >= 0 && differenceInDays <= 7) {
         
            document.querySelectorAll(labelSelector).forEach(label => {
                label.style.display = 'block';
            });
        }
    });
});

  // Language selector
  document.getElementById('language-select').addEventListener('change', function() {
    currentLanguage = this.value;
    updateTranslations(currentLanguage);
    updateTimeLeft(currentLanguage);
  });


  var jotformScript = document.createElement('script');
  jotformScript.src = "https://form.jotform.com/static/feedback2.js";
  jotformScript.type = "text/javascript";
  document.head.appendChild(jotformScript);

  jotformScript.onload = function() {
    new JotformFeedback({
      type: 2,
      width: 700,
      height: 700,
      fontColor: "#FFFFFF",
      background: "#FB8F8B",
      isCardForm: false,
      formId: "240764186817970",
      buttonText: "Feedback",
      buttonSide: "left",
      buttonAlign: "center",
      base: "https://form.jotform.com/",
    });
  };


  document.addEventListener("DOMContentLoaded", function() {
    var ifr = document.getElementById("lightbox-240764186817970");
    if (ifr) {
      var src = ifr.src;
      var iframeParams = [];
      if (window.location.href && window.location.href.indexOf("?") > -1) {
        iframeParams = iframeParams.concat(window.location.href.substr(window.location.href.indexOf("?") + 1).split('&'));
      }
      if (src && src.indexOf("?") > -1) {
        iframeParams = iframeParams.concat(src.substr(src.indexOf("?") + 1).split("&"));
        src = src.substr(0, src.indexOf("?"));
      }
      iframeParams.push("isIframeEmbed=1");
      ifr.src = src + "?" + iframeParams.join('&');
    }

    window.handleIFrameMessage = function(e) {
      if (typeof e.data === 'object') { return; }
      var args = e.data.split(":");
      var iframe;
      if (args.length > 2) {
        iframe = document.getElementById("lightbox-" + args[(args.length - 1)]);
      } else {
        iframe = document.getElementById("lightbox");
      }
      if (!iframe) { return; }

      switch (args[0]) {
        case "scrollIntoView":
          iframe.scrollIntoView();
          break;
        case "setHeight":
          iframe.style.height = args[1] + "px";
          if (!isNaN(args[1]) && parseInt(iframe.style.minHeight) > parseInt(args[1])) {
            iframe.style.minHeight = args[1] + "px";
          }
          break;
        case "collapseErrorPage":
          if (iframe.clientHeight > window.innerHeight) {
            iframe.style.height = window.innerHeight + "px";
          }
          break;
        case "reloadPage":
          window.location.reload();
          break;
        case "loadScript":
          if (!window.isPermitted(e.origin, ['jotform.com', 'jotform.pro'])) { break; }
          var scriptSrc = args[1];
          if (args.length > 3) {
            scriptSrc = args[1] + ':' + args[2];
          }
          var script = document.createElement('script');
          script.src = scriptSrc;
          script.type = 'text/javascript';
          document.body.appendChild(script);
          break;
        case "exitFullscreen":
          if (window.document.exitFullscreen)        window.document.exitFullscreen();
          else if (window.document.mozCancelFullScreen)   window.document.mozCancelFullScreen();
          else if (window.document.webkitExitFullscreen)  window.document.webkitExitFullscreen();
          else if (window.document.msExitFullscreen)      window.document.msExitFullscreen();
          break;
      }

      var isJotForm = (e.origin.indexOf("jotform") > -1);
      if (isJotForm && "contentWindow" in iframe && "postMessage" in iframe.contentWindow) {
        var urls = {"docurl":encodeURIComponent(document.URL),"referrer":encodeURIComponent(document.referrer)};
        iframe.contentWindow.postMessage(JSON.stringify({"type":"urls","value":urls}), "*");
      }
    };

    window.isPermitted = function(originUrl, whitelisted_domains) {
      var url = document.createElement('a');
      url.href = originUrl;
      var hostname = url.hostname;
      var result = false;
      if (typeof hostname !== 'undefined') {
        whitelisted_domains.forEach(function(element) {
          if (hostname.slice((-1 * element.length - 1)) === '.'.concat(element) || hostname === element) {
            result = true;
          }
        });
        return result;
      }
    };

    if (window.addEventListener) {
      window.addEventListener("message", handleIFrameMessage, false);
    } else if (window.attachEvent) {
      window.attachEvent("onmessage", handleIFrameMessage);
    }
  });
  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    });
  });

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

})()