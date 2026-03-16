 if (document.querySelector('.map')) {
            let center = [45.030445, 39.066932];


            function init() {

                let map = new ymaps.Map("map", {
                    center: center, // ваши данные
                    zoom: 17
                });

                let placemarkElement = new ymaps.Placemark([45.030445, 39.066932], {}, {
                    iconLayout: 'default#image', /* говорим что будем отображать на карте в качестве геометки  */
                    iconImageHref: './assets/svg/icon-map-mark.svg', /* указываем пусть к картинке на нашем сайте  */
                    iconImageSize: [52, 64], /* размеры картинки  */
                    iconImageOffset: [-25, -32] /* отступ от центра  */
                });

                map.controls.remove('geolocationControl'); // удаляем геолокацию
                map.controls.remove('searchControl'); // удаляем поиск
                map.controls.remove('trafficControl'); // удаляем контроль трафика
                map.controls.remove('typeSelector'); // удаляем тип
                // map.controls.remove('fullscreenControl'); // удаляем кнопку перехода в полноэкранный режим
                // map.controls.remove('zoomControl'); // удаляем контрол зуммирования
                map.controls.remove('rulerControl'); // удаляем контрол правил
                map.behaviors.disable(['scrollZoom']); // отключаем скролл карты (опционально)

                map.geoObjects.add(placemarkElement);

                placemarkElement.events
                    .add('mouseenter', function (e) {
                        e.get('target').options.set('iconImageHref', './assets/svg/icon-map-mark-hover.svg');
                    })
                    .add('mouseleave', function (e) {
                        e.get('target').options.set('iconImageHref', './assets/svg/icon-map-mark.svg');
                    });
            }

            ymaps.ready(init);
        };
