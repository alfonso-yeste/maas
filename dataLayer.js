// ==UserScript==
// @name         Maas
// @namespace    https://maas.es
// @version      2025-07-11
// @description  try to take over the world!
// @author       You
// @match        https://maas.es/seat/ibiza
// @icon         https://www.google.com/s2/favicons?sz=64&domain=maas.es
// @grant        none
// ==/UserScript==

const ENABLED_DEBUG = true;

(function () {
    'use strict';
    try {
        maasDataLayer();
    } catch (exception) {
        debugOnConsole(exception);
    }
})();


function sendSectionView(entries, observer) {

    var visibleProducts = [];

    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            visibleProducts.push(entry.target);
            observer.unobserve(entry.target);
        }
    });

    if(visibleProducts.length > 0) {
        sendEvent('view_section',{
            'sectionName': visibleProducts[0].getAttribute('sectionName'),
            'step' :  visibleProducts[0].getAttribute('step')
        });
    }
}


function addViewSections() {

    var heroBanners = document.querySelectorAll(".container-hero");
    addSectionNameAndStep(heroBanners, 'hero_banner', 0);
    registerObserver(heroBanners, sendSectionView);

    var versionSelection = document.querySelectorAll("#versiones-gama > .container:not(.container-motores):not(.container-boton)");
    addSectionNameAndStep(versionSelection, 'version_selection', 1);
    registerObserver(versionSelection, sendSectionView)

    var engineSection = document.querySelectorAll("#versiones-gama > .container.container-motores");
    addSectionNameAndStep(engineSection, 'engine_section', 2);
    registerObserver(engineSection, sendSectionView);

    var characteristicsSection = document.querySelectorAll("#seccion-caracteristicas");
    addSectionNameAndStep(characteristicsSection, 'characteristics_section', 3);
    registerObserver(characteristicsSection, sendSectionView);

    var dealerSection = document.querySelectorAll("#seccion-listadoversiones");
    addSectionNameAndStep(dealerSection, 'dealer_section', 4);
    registerObserver(dealerSection, sendSectionView);

    var stockSection = document.querySelectorAll("#seccion-modelos-stock");
    addSectionNameAndStep(stockSection, 'stock_selection', 5);
    registerObserver(stockSection, sendSectionView);

    var gamaSection = document.querySelectorAll("#seccion-gama");
    addSectionNameAndStep(gamaSection, 'gama_selection', 6);
    registerObserver(gamaSection, sendSectionView);

    var brandSection = document.querySelectorAll(".seccion-marcas");
    addSectionNameAndStep(brandSection, 'brand_selection', 7);
    registerObserver(brandSection, sendSectionView);

}

function addSectionNameAndStep(nodes, sectionName, step) {
    nodes.forEach(function(node) {
        node.setAttribute('sectionName', sectionName);
        node.setAttribute('step', step);
    });
}

function clickButtonHandler(event) {
    sendEvent('button_section', {
        'eventDetail': toSnakeCase(event.target.innerText)
    });
}

function clickCarCard(event) {

    sendEvent('select_model', {
        'eventDetail': "version",
    });
}

function clickMotorHandler() {
    sendEvent('select_model', {
        'eventDetail': "engine"
    });
}

function clickRequestOffer(event) {

    sendEvent('button_engine_section', {
        'eventDetail': toSnakeCase(event.target.innerText)
    });

}

function clickImageSlideSwiperHandle(event) {
    sendEvent('photo_section', {
        'eventDetail': event.target.parentElement.getAttribute('data-index')
    });
}

function clickArrowSlideHandler(event) {
    sendEvent('photo_section', {
        'eventDetail': toSnakeCase(event.target.parentElement.getAttribute("aria-label"))
    });
}

function clickPlacesHandler(event) {

    sendEvent('dealer_selection', {
        'eventDetail': toSnakeCase(event.target.parent.getAttribute("title"))
    });

}

function addClickEvents() {
    registerIdempotentEventClick(document.querySelectorAll(".cont-botones a"), clickButtonHandler);
    registerIdempotentEventClick(document.querySelectorAll("#seccion-modelos-stock > a"), clickButtonHandler);
    registerIdempotentEventClick(document.querySelectorAll(".card-gama-ficha"), clickCarCard);
    registerIdempotentEventClick(document.querySelectorAll(".card-motor"), clickMotorHandler);
    registerIdempotentEventClick(document.querySelectorAll("#versiones-gama .jsBotonOfertaGama"), clickRequestOffer);
    registerIdempotentEventClick(document.querySelectorAll(".thumbs-swiper .swiper-slide"), clickImageSlideSwiperHandle);
    registerIdempotentEventClick(document.querySelectorAll(".swiper-button-next, .swiper-button-prev"), clickArrowSlideHandler);
}

function maasDataLayer() {
    addViewSections();
    addClickEvents();
}


function registerObserver(nodes, handleIntersection) {
    var dataIndex = 0;

    var observerOptions = {
        threshold: 0.3
    }
    var observer = new IntersectionObserver(handleIntersection, observerOptions);

    nodes.forEach(function (node) {
        if (!node.hasAttribute("data-index")) {
            node.setAttribute("data-index", dataIndex);
            dataIndex++;
        }
        observer.observe(node);
    });
}

function toSnakeCase(text) {
    if (!text) {
        return '';
    }

    return text
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(function (x) {
            return x.toLowerCase()
        })
        .join('_');
}

function sendEvent(eventName, eventBody, ecommerceBody) {

    if (eventBody === null) {
        eventBody = {};
    }

    eventBody.event = eventName;
    var event = eventBody

    if (ecommerceBody != null) {
        event.ecommerce = ecommerceBody;
    }

    try {
        if (ecommerceBody != null) {
            dataLayer.push({ecommerce: null});
        }
        dataLayer.push(event);
    } catch (exception) {
        console.log(exception.toString());
    }
    console.log("Event sent: " + JSON.stringify(event));
}

function registerIdempotentEventClick(nodes, handler) {

    var dataIndex = 1;

    nodes.forEach(
        function (node) {
            if (node.getAttribute("event-click") === null) {
                node.addEventListener('click', handler);
                node.setAttribute("event-click", true);

                if (!node.hasAttribute("data-index")) {
                    node.setAttribute("data-index", dataIndex);
                    dataIndex++;
                }
            }
        }
    );
}

function debugOnConsole(logText) {
    if (ENABLED_DEBUG) {
        console.log(logText);
    }
}
