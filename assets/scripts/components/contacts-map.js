if (document.querySelector('.map')) {
  let center = [45.030445, 39.066932];
  let map = null;
  let resizeTimeout = null;
  let fullscreenTimeout = null;

  function init() {
    if (map) {
      map.destroy();
      map = null;
    }

    map = new ymaps.Map('map', {
      center: center,
      zoom: 17
    });

    let placemarkElement = new ymaps.Placemark(
      [45.030445, 39.066932],
      {},
      {
        iconLayout: 'default#image',
        iconImageHref: './assets/svg/icon-map-mark.svg',
        iconImageSize: [52, 64],
        iconImageOffset: [-25, -32]
      }
    );

    map.controls.remove('geolocationControl');
    map.controls.remove('searchControl');
    map.controls.remove('trafficControl');
    map.controls.remove('typeSelector');
    // map.controls.remove('fullscreenControl');
    // map.controls.remove('zoomControl');
    map.controls.remove('rulerControl');
    map.behaviors.disable(['scrollZoom']);

    map.geoObjects.add(placemarkElement);

    placemarkElement.events
      .add('mouseenter', function (e) {
        e.get('target').options.set(
          'iconImageHref',
          './assets/svg/icon-map-mark-hover.svg'
        );
      })
      .add('mouseleave', function (e) {
        e.get('target').options.set(
          'iconImageHref',
          './assets/svg/icon-map-mark.svg'
        );
      });

    // Только при выходе из fullscreen
    map.container.events.add('fullscreenexit', handleFullscreenExit);
  }

  function reinitMap() {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(function () {
      init();
    }, 200);
  }

  function handleFullscreenExit() {
    clearTimeout(fullscreenTimeout);

    fullscreenTimeout = setTimeout(function () {
      init();
    }, 300);
  }

  ymaps.ready(function () {
    init();

    window.addEventListener('resize', reinitMap);
    window.addEventListener('orientationchange', reinitMap);
  });
}
