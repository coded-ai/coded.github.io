
(function() {
  "use strict";

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

  function updateTimeLeft() {
    const now = new Date();

    
    const specificationDate = new Date(2023, 10, 17);  // November 17 -Spec report deadline + 1 day
    const requirementsDate = new Date(2023, 11, 8); // December 8 - Req report deadline + 1 day
    const presentationDate = new Date(2023, 11, 20); // December 20 - Presentation deadline + 1 day

    const detailedDesignDate = new Date(2024, 2, 16); // March 16 - Detailed Report deadline + 1 day
    const finalReportDate = new Date(2024, 4, 11); // May 11 - Final Report deadline + 1 day 
    const springPresentationDate = new Date(2024, 4, 17); // Last Day of Semester + 1 Day
    
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
    const detailedDesignLink = document.getElementById("detailed-design-link");
    const finalReportLink = document.getElementById("final-report-link");
    const springPresentationLink = document.getElementById("spring-presentation-link");

    if (specificationTimeLeft > 0) {
      specificationNote.textContent = `Available in ${specificationTimeLeft} days`;
    } else {
      specificationNote.textContent = 'Submitted on 17/11/2023';
      specificationLink.style.display = 'block';
    }

    if (requirementsTimeLeft > 0) {
      requirementsNote.textContent = `Available in ${requirementsTimeLeft} days`;
    } else {
      requirementsNote.textContent = 'Submitted on 08/12/2023';
      requirementsLink.style.display = 'block';
    }
    if (presentationTimeLeft > 0) {
      presentationNote.textContent = `Available in ${presentationTimeLeft} days`;
    } else {
      presentationNote.textContent = 'Presented on 5/12/2023';
      presentationLink.style.display = 'block';
    }
    if (detailedDesignDateLeft > 0) {
      detailedDesignNote.textContent = `Available in ${detailedDesignDateLeft} days`;
    } else {
      detailedDesignNote.textContent = 'Submitted on 15/03/2024';
      detailedDesignLink.style.display = 'block';
    }
    if (finalReportDateLeft > 0) {
      finalReportNote.textContent = `Available in ${finalReportDateLeft} days`;
    } else {
      finalReportNote.textContent = 'Submitted on 10/05/2024';
      finalReportLink.style.display = 'block';
    }
    if (springPresentationDateLeft > 0) {
      springPresentationNote.textContent = `Available in May 2024`;
    } else {
      springPresentationNote.textContent = 'Submitted on 16/05/2024';
      springPresentationLink.style.display = 'block';
    }
  }

  // Update time left immediately and then every day
  updateTimeLeft();
  setInterval(updateTimeLeft, 24 * 60 * 60 * 1000);


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