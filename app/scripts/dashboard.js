//zepto code
Zepto(function ($) {
  (
    //trigger event on page load
    function init() {
      //trigger hash change event
      onHashChange();
    }
  )();

  //on url hashchange
  window.onhashchange = function(event) {
    //trigger hash change event
    onHashChange(event);
  }

  //page navigation handler
  function onHashChange(event) {
    var defaultUrl = 'Settings';//TODO change it to #Now
    var oldUrl = defaultUrl;
    var newUrl = location.hash.replace('#','') || defaultUrl;
    //if there is an event change
    if (event) {
      oldUrl = event.oldURL.match(/#.*$/ig)[0].replace('#','');
      newUrl = event.newURL.match(/#.*$/ig)[0].replace('#','');
    }
    //set the loaded title
    document.getElementById('pageTitle').innerHTML = newUrl;
    //remove old url class
    document.querySelector('[href="#' + oldUrl + '"]').classList.remove('mdl-navigation__link--current');
    //add new url class
    document.querySelector('[href="#' + newUrl + '"]').classList.add('mdl-navigation__link--current');
    //page container
    var pageContainer = document.getElementById('pageContainer');
    //TODO fade out the page container
    //reset classes for animation
    pageContainer.classList.remove('fadeInUp');
    //fab and other element hide logic
    setTimeout(function () {
      tbt_fab.hide();
    } ,10);
    //set fetch url
    var fetchUrl = newUrl + '.html';
    fetchHtml(fetchUrl, function (html) {
      //set the loaded html
      pageContainer.innerHTML = html;
      //load the history
      // loadHistoryView();
      //create the table
      createTables();
      //bind table row events
      bindEvents();
      //upgrade them using mdl specs
      componentHandler.upgradeDom();
      //TODO do this after the page has drawn
      setTimeout(function () {
        //fade in the page
        pageContainer.classList.add('fadeInUp');
        //fab and other elements show logic
        tbt_fab.show(newUrl);
      } ,10);
    });
  }

  function fetchHtml(url, callback) {
    //create a new xhr request
    var XHRt = new XMLHttpRequest; // new ajax
    XHRt.addEventListener('load', callback(XHRt));//.
    XHRt.responseType='document';
    XHRt.open("POST", 'views/' + url, true);
    XHRt.send();
    XHRt.onreadystatechange = function(){
      if(XHRt.readyState == 4){
        if(XHRt.status == 200) {
          callback(XHRt.response.body.innerHTML);
        }
        else
        {
          //error
        }
      }
    }
  }

  //singleton containing fab -> view relation
  var tbt_fab = new function () {
    var $fab = $('#tbt-fab__main');
    this.relation = {
      Now: {
        state: true,
        icon: 'icon-add',
        action: 'new tab',
        title: 'Create a new tab'
      },
      History: {
        state: true,
        icon: 'icon-date_range',
        action: 'filter tabs',
        title: 'Filter or show for certain days',
        buttons: ['tbt-button__historyView']
      },
      Saved: {
        state: false
      },
      Settings: {
        state: false
      },
      Help: {
        state: false
      },
      About: {
        state: false
      }
    };
    this.hide = function () {
      //hide the fab
      $fab.removeClass('zoomIn animated-delay')
      .addClass('zoomOut');
      //hide the toolbar buttons
      $('.mdl-layout__header-row .mdl-button').css('display','none');
    };
    this.show = function (view) {
      //current relation
      var cRelation = this.relation[view];
      if (cRelation.state) {
        $fab.children('.material-icons')
        .removeClass()
        .addClass('material-icons ' + cRelation.icon);
        $fab.attr('title', cRelation.title);
        $fab.attr('data-action', cRelation.action);
        $fab.removeClass('zoomOut')
        .addClass('zoomIn animated-delay');
      }
      //show the toolbar buttons
      if (cRelation.buttons) {
        for (var i in cRelation.buttons) {
          $('#' + cRelation.buttons[i]).css('display','inline-block');
        }
      }
    };
  }

  //singleton containing the timeline relation
  var tbt_timeline = new function () {
    //current dot number
    this.number = 0;
    //number of the current transition x
    this.translateX = 0;
    //the view box's width
    this.viewbox = 0;
    this.initView = function () {
      this.calcHr();
      $(window).on('resize', function() {
        tbt_timeline.calcHr();
      });
      //dots in nav
      $('.mdl-radio').on('click', function () {
        tbt_timeline.number = $(this).parents('li').index();
        $('.tbt-timeline__hr').css('width', $(this).position().left + 3);
        $('.tbt-timeline__section--active').removeClass('tbt-timeline__section--active');
        $('.tbt-timeline__view .tbt-timeline__section').eq(tbt_timeline.number).addClass('tbt-timeline__section--active');
      });
      //left
      $('.tbt-timeline__left').click(function () {
        if (tbt_timeline.translateX >= 0) {
          tbt_timeline.translateX -= 108;
          $('.tbt-timeline__dots').attr('style', 'transform: translate3d(-' + tbt_timeline.translateX + 'px,0,0)');
          setTimeout(function () {
            tbt_timeline.calcHr();
          }, 300);
        }
      });
      //right
      $('.tbt-timeline__right').click(function () {
        var outside = $('.tbt-timeline__dots li').last().offset().left - $(this).offset().left;
        if (outside > -1) {
          tbt_timeline.translateX += 108;
          $('.tbt-timeline__dots').attr('style', 'transform: translate3d(-' + tbt_timeline.translateX + 'px,0,0)');
          setTimeout(function () {
            tbt_timeline.calcHr();
          }, 300);
        }
      });
    };
    this.calcHr = function () {
      var $line = $('.tbt-timeline__nav .tbt-timeline__hr');
      var dotLeft = $('.tbt-timeline__dots li').eq(this.number).position().left;
      //if the dot is outside the view to the left
      if (dotLeft < 0) {
        $line.css('width', 0);
      }
      else {
        var $dot = $('.tbt-timeline__dots li').eq(this.number);
        $line.css('width', $dot.position().left + 54);
      }
    };
  }

  //bind all events
  function bindEvents() {
    //for tabatron table component
    bindTableEvents();
    //for timeline component
    bindTimeline();
  }

  //bind events for tabatron tables
  function bindTableEvents() {
    //remove table hover on mouseout
    $('.tbt-row').on('mouseleave blur', function () {
      $('.tbt-row').removeClass('tbt-row--hover');
    });
    //add table hover on mouse enter
    $('.tbt-row').on('mouseenter focus', function () {
      $('.tbt-row').removeClass('tbt-row--hover');
      var rowNumber = $(this).index();
      var $columns = $(this).parents('.tbt-body').children('.tbt-table__column');
      $columns.each(function(index){
        $(this).children('.tbt-row').eq(rowNumber).addClass('tbt-row--hover');
      });
    });
  }

  function bindTimeline() {
    //if the timeline exists init it's singleton
    if ($('.tbt-timeline__nav').length > 0) {
      tbt_timeline.initView();
    }
  }

  //create now tables
  function createTables() {
    //TODO MAKE THIS FUNCTIONAL
    //NOTE it is just assigning the dummy favicons colours
    $('.tbt-nofavicon').each(function(index){
      $(this).css('background-color', randomColor({luminosity: 'light'}));
    });
  }

  //click events and other events for persistent elements
  //fab button
  $('#tbt-fab__main').on('click', function () {
    //TODO the event
  });

  //toolbar button for layout switching
  //NOTE uses id
  $('#tbt-button__historyView').on('click', function () {
    //toggle the icon
    $(this).children('i').toggleClass('icon-view_module icon-view_list');
    //set tooltip according to the icon
    var tooltip = 'Grid View';
    if ($(this).children('i').hasClass('icon-view_list')) {
      tooltip = 'List View';
    }
    $(this).next('.mdl-tooltip').html(tooltip);
    //load the view
    loadHistoryView();
  });

  //load the View
  function loadHistoryView() {
    //load view according to the view button status
    //refer the view
    var $session__view = $('.tbt_sessions__view');
    //remove the View classes
    $session__view.removeClass('mdl-grid mdl-list');
    //NOTE uses id
    //load the list view
    if ($('#tbt-button__historyView').children('i').hasClass('icon-view_module')) {
      $session__view.addClass('mdl-list');
      $session__view.load('/templates/templates.html .mdl-list__item', function(data, status, xhr){
        if (status === 'success') {
          //clone it once it is loaded
          var $session__item = $session__view.children('.tbt-sessions__item').clone();
          //clear the session view once before setting it again
          $session__view.empty();
          //load the sessions
          chrome.runtime.sendMessage('sessions', function(response) {
            for (var i in response) {
              var m = moment.tz(parseInt(response[i]), moment.tz.guess());
              //new card
              var $session__newItem = $session__item.clone();
              //set the list data
              $session__newItem.find('#demo-menu-lower-right').attr('id', 'mbutton-' + i);
              $session__newItem.find('.mdl-menu').attr('for', 'mbutton-' + i);
              $session__newItem.find('.mdl-list__item-primary-content b').html(m.format('D MMM'));
              $session__newItem.find('.mdl-list__item-title').html(m.format('YYYY'));
              $session__newItem.find('.mdl-list__item-sub-title').html(m.format('h:m A'));
              $session__view.append($session__newItem);
            }
            //upgrade them using mdl specs
            componentHandler.upgradeDom();
          });
        }
      });
    }
    else {
      $session__view.addClass('mdl-grid');
      $session__view.load('/templates/templates.html .tbt-sessions__card', function(data, status, xhr){
        if (status === 'success') {
          //clone it once it is loaded
          var $session__item = $session__view.children('.tbt-sessions__card').clone();
          //clear the session view once before setting it again
          $session__view.empty();
          //load the sessions
          chrome.runtime.sendMessage('sessions', function(response) {
            for (var i in response) {
              var m = moment.tz(parseInt(response[i]), moment.tz.guess());
              //new card
              var $session__newItem = $session__item.clone();
              //set the card data
              $session__newItem.find('.mdl-card__title-text').html(m.format('D MMM'));
              $session__newItem.find('.mdl-card__title-span').html(m.format('YYYY'));
              $session__newItem.find('.mdl-card__supporting-text b').html(m.format('h:m A'));
              $session__view.append($session__newItem);
            }
            //upgrade them using mdl specs
            componentHandler.upgradeDom();
          });
        }
      });
    }
  }
});
