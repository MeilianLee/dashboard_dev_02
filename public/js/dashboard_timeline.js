jQuery(document).ready(function ($) {
    var timelines = $(".cd-horizontal-timeline"),
        eventsMinDistance = 60;

    timelines.length > 0 && initTimeline(timelines);

    function initTimeline(timelines) {
        timelines.each(function () {
            var timeline = $(this),
                timelineComponents = {};
            //cache timeline components
            timelineComponents["timelineWrapper"] =
                timeline.find(".events-wrapper");
            timelineComponents["eventsWrapper"] =
                timelineComponents["timelineWrapper"].children(".events");
            timelineComponents["fillingLine"] =
                timelineComponents["eventsWrapper"].children(".filling-line");
            timelineComponents["timelineEvents"] =
                timelineComponents["eventsWrapper"].find("a");
            timelineComponents["timelineDates"] = parseDate(
                timelineComponents["timelineEvents"]
            );
            timelineComponents["eventsMinLapse"] = minLapse(
                timelineComponents["timelineDates"]
            );
            timelineComponents["timelineNavigation"] = timeline.find(
                ".cd-timeline-navigation"
            );
            timelineComponents["eventsContent"] =
                timeline.children(".events-content");

            //assign a left postion to the single events along the timeline
            setDatePosition(timelineComponents, eventsMinDistance);
            //assign a width to the timeline
            var timelineTotWidth = setTimelineWidth(
                timelineComponents,
                eventsMinDistance
            );
            //the timeline has been initialize - show it
            timeline.addClass("loaded");

            //detect click on the next arrow
            timelineComponents["timelineNavigation"].on(
                "click",
                ".next",
                function (event) {
                    event.preventDefault();
                    updateSlide(timelineComponents, timelineTotWidth, "next");
                }
            );
            //detect click on the prev arrow
            timelineComponents["timelineNavigation"].on(
                "click",
                ".prev",
                function (event) {
                    event.preventDefault();
                    updateSlide(timelineComponents, timelineTotWidth, "prev");
                }
            );
            //detect click on the a single event - show new event content
            timelineComponents["eventsWrapper"].on(
                "click",
                "a",
                function (event) {
                    event.preventDefault();
                    timelineComponents["timelineEvents"].removeClass(
                        "selected"
                    );
                    $(this).addClass("selected");
                    updateOlderEvents($(this));
                    updateFilling(
                        $(this),
                        timelineComponents["fillingLine"],
                        timelineTotWidth
                    );
                    // update data layer
                    changeVariable();
                    mapYearlyChange();
                    // updateVisibleContent($(this), timelineComponents["eventsContent"]);
                }
            );

            //on swipe, show next/prev event content
            timelineComponents["eventsContent"].on("swipeleft", function () {
                var mq = checkMQ();
                mq == "mobile" &&
                    showNewContent(
                        timelineComponents,
                        timelineTotWidth,
                        "next"
                    );
            });
            timelineComponents["eventsContent"].on("swiperight", function () {
                var mq = checkMQ();
                mq == "mobile" &&
                    showNewContent(
                        timelineComponents,
                        timelineTotWidth,
                        "prev"
                    );
            });

            //keyboard navigation
            $(document).keyup(function (event) {
                if (event.which == "37" && elementInViewport(timeline.get(0))) {
                    showNewContent(
                        timelineComponents,
                        timelineTotWidth,
                        "prev"
                    );
                } else if (
                    event.which == "39" &&
                    elementInViewport(timeline.get(0))
                ) {
                    showNewContent(
                        timelineComponents,
                        timelineTotWidth,
                        "next"
                    );
                }
            });
        });
    }

    function updateSlide(timelineComponents, timelineTotWidth, string) {
        //retrieve translateX value of timelineComponents['eventsWrapper']
        var translateValue = getTranslateValue(
                timelineComponents["eventsWrapper"]
            ),
            wrapperWidth = Number(
                timelineComponents["timelineWrapper"]
                    .css("width")
                    .replace("px", "")
            );
        //translate the timeline to the left('next')/right('prev')
        string == "next"
            ? translateTimeline(
                  timelineComponents,
                  translateValue - wrapperWidth + eventsMinDistance,
                  wrapperWidth - timelineTotWidth
              )
            : translateTimeline(
                  timelineComponents,
                  translateValue + wrapperWidth - eventsMinDistance
              );
    }

    function showNewContent(timelineComponents, timelineTotWidth, string) {
        //go from one event to the next/previous one
        var visibleContent =
                timelineComponents["eventsContent"].find(".selected"),
            newContent =
                string == "next"
                    ? visibleContent.next()
                    : visibleContent.prev();

        if (newContent.length > 0) {
            //if there's a next/prev event - show it
            var selectedDate =
                    timelineComponents["eventsWrapper"].find(".selected"),
                newEvent =
                    string == "next"
                        ? selectedDate.parent("li").next("li").children("a")
                        : selectedDate.parent("li").prev("li").children("a");

            updateFilling(
                newEvent,
                timelineComponents["fillingLine"],
                timelineTotWidth
            );
            updateVisibleContent(newEvent, timelineComponents["eventsContent"]);
            newEvent.addClass("selected");
            selectedDate.removeClass("selected");
            updateOlderEvents(newEvent);
            updateTimelinePosition(
                string,
                newEvent,
                timelineComponents,
                timelineTotWidth
            );
        }
    }

    function updateTimelinePosition(
        string,
        event,
        timelineComponents,
        timelineTotWidth
    ) {
        //translate timeline to the left/right according to the position of the selected event
        var eventStyle = window.getComputedStyle(event.get(0), null),
            eventLeft = Number(
                eventStyle.getPropertyValue("left").replace("px", "")
            ),
            timelineWidth = Number(
                timelineComponents["timelineWrapper"]
                    .css("width")
                    .replace("px", "")
            ),
            timelineTotWidth = Number(
                timelineComponents["eventsWrapper"]
                    .css("width")
                    .replace("px", "")
            );
        var timelineTranslate = getTranslateValue(
            timelineComponents["eventsWrapper"]
        );

        if (
            (string == "next" &&
                eventLeft > timelineWidth - timelineTranslate) ||
            (string == "prev" && eventLeft < -timelineTranslate)
        ) {
            translateTimeline(
                timelineComponents,
                -eventLeft + timelineWidth / 2,
                timelineWidth - timelineTotWidth
            );
        }
    }

    function translateTimeline(timelineComponents, value, totWidth) {
        var eventsWrapper = timelineComponents["eventsWrapper"].get(0);
        value = value > 0 ? 0 : value; //only negative translate value
        value =
            !(typeof totWidth === "undefined") && value < totWidth
                ? totWidth
                : value; //do not translate more than timeline width
        setTransformValue(eventsWrapper, "translateX", value + "px");
        //update navigation arrows visibility
        value == 0
            ? timelineComponents["timelineNavigation"]
                  .find(".prev")
                  .addClass("inactive")
            : timelineComponents["timelineNavigation"]
                  .find(".prev")
                  .removeClass("inactive");
        value == totWidth
            ? timelineComponents["timelineNavigation"]
                  .find(".next")
                  .addClass("inactive")
            : timelineComponents["timelineNavigation"]
                  .find(".next")
                  .removeClass("inactive");
    }

    function updateFilling(selectedEvent, filling, totWidth) {
        //change .filling-line length according to the selected event
        var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
            eventLeft = eventStyle.getPropertyValue("left"),
            eventWidth = eventStyle.getPropertyValue("width");
        eventLeft =
            Number(eventLeft.replace("px", "")) +
            Number(eventWidth.replace("px", "")) / 2;
        var scaleValue = eventLeft / totWidth;
        setTransformValue(filling.get(0), "scaleX", scaleValue);
    }

    function setDatePosition(timelineComponents, min) {
        for (i = 0; i < timelineComponents["timelineDates"].length; i++) {
            var distance = daydiff(
                    timelineComponents["timelineDates"][0],
                    timelineComponents["timelineDates"][i]
                ),
                distanceNorm =
                    Math.round(
                        distance / timelineComponents["eventsMinLapse"]
                    ) + 2;
            timelineComponents["timelineEvents"]
                .eq(i)
                .css("left", distanceNorm * min + "px");
        }
    }

    function setTimelineWidth(timelineComponents, width) {
        var timeSpan = daydiff(
                timelineComponents["timelineDates"][0],
                timelineComponents["timelineDates"][
                    timelineComponents["timelineDates"].length - 1
                ]
            ),
            timeSpanNorm = timeSpan / timelineComponents["eventsMinLapse"],
            timeSpanNorm = Math.round(timeSpanNorm) + 4,
            totalWidth = timeSpanNorm * width;
        timelineComponents["eventsWrapper"].css("width", totalWidth + "px");
        updateFilling(
            timelineComponents["timelineEvents"].eq(0),
            timelineComponents["fillingLine"],
            totalWidth
        );

        return totalWidth;
    }

    function updateVisibleContent(event, eventsContent) {
        var eventDate = event.data("date"),
            visibleContent = eventsContent.find(".selected"),
            selectedContent = eventsContent.find(
                '[datadate="' + eventDate + '"]'
            ),
            selectedContentHeight = selectedContent.height();

        if (selectedContent.index() > visibleContent.index()) {
            var classEnetering = "selected enter-right",
                classLeaving = "leave-left";
        } else {
            var classEnetering = "selected enter-left",
                classLeaving = "leave-right";
        }

        selectedContent.attr("class", classEnetering);
        visibleContent
            .attr("class", classLeaving)
            .one(
                "webkitAnimationEnd oanimationend msAnimationEnd animationend",
                function () {
                    visibleContent.removeClass("leave-right leave-left");
                    selectedContent.removeClass("enter-left enter-right");
                }
            );
        eventsContent.css("height", selectedContentHeight + "px");
    }

    function updateOlderEvents(event) {
        event
            .parent("li")
            .prevAll("li")
            .children("a")
            .addClass("older-event")
            .end()
            .end()
            .nextAll("li")
            .children("a")
            .removeClass("older-event");
    }

    function getTranslateValue(timeline) {
        var timelineStyle = window.getComputedStyle(timeline.get(0), null),
            timelineTranslate =
                timelineStyle.getPropertyValue("-webkit-transform") ||
                timelineStyle.getPropertyValue("-moz-transform") ||
                timelineStyle.getPropertyValue("-ms-transform") ||
                timelineStyle.getPropertyValue("-o-transform") ||
                timelineStyle.getPropertyValue("transform");

        if (timelineTranslate.indexOf("(") >= 0) {
            var timelineTranslate = timelineTranslate.split("(")[1];
            timelineTranslate = timelineTranslate.split(")")[0];
            timelineTranslate = timelineTranslate.split(",");
            var translateValue = timelineTranslate[4];
        } else {
            var translateValue = 0;
        }

        return Number(translateValue);
    }

    function setTransformValue(element, property, value) {
        element.style["-webkit-transform"] = property + "(" + value + ")";
        element.style["-moz-transform"] = property + "(" + value + ")";
        element.style["-ms-transform"] = property + "(" + value + ")";
        element.style["-o-transform"] = property + "(" + value + ")";
        element.style["transform"] = property + "(" + value + ")";
    }

    //based on http://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
    function parseDate(events) {
        var dateArrays = [];
        events.each(function () {
            var dateComp = $(this).data("date").split("/"),
                newDate = new Date(dateComp[2], dateComp[1] - 1, dateComp[0]);
            dateArrays.push(newDate);
        });
        return dateArrays;
    }

    function parseDate2(events) {
        var dateArrays = [];
        events.each(function () {
            var singleDate = $(this),
                dateComp = singleDate.data("date").split("T");
            if (dateComp.length > 1) {
                //both DD/MM/YEAR and time are provided
                var dayComp = dateComp[0].split("/"),
                    timeComp = dateComp[1].split(":");
            } else if (dateComp[0].indexOf(":") >= 0) {
                //only time is provide
                var dayComp = ["1951", "0", "0"],
                    timeComp = dateComp[0].split(":");
            } else {
                //only DD/MM/YEAR
                var dayComp = dateComp[0].split("/"),
                    timeComp = ["0", "0"];
            }
            var newDate = new Date();
            dayComp[2], dayComp[1] - 1, dayComp[0], timeComp[0], timeComp[1];
            dateArrays.push(newDate);
        });
        return dateArrays;
    }

    function daydiff(first, second) {
        return Math.round(second - first);
    }

    function minLapse(dates) {
        //determine the minimum distance among events
        var dateDistances = [];
        for (i = 1; i < dates.length; i++) {
            var distance = daydiff(dates[i - 1], dates[i]);
            dateDistances.push(distance);
        }
        return Math.min.apply(null, dateDistances);
    }

    /*
		How to tell if a DOM element is visible in the current viewport?
		http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
	*/
    function elementInViewport(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        while (el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return (
            top < window.pageYOffset + window.innerHeight &&
            left < window.pageXOffset + window.innerWidth &&
            top + height > window.pageYOffset &&
            left + width > window.pageXOffset
        );
    }

    function checkMQ() {
        //check if mobile or desktop device
        return window
            .getComputedStyle(
                document.querySelector(".cd-horizontal-timeline"),
                "::before"
            )
            .getPropertyValue("content")
            .replace(/'/g, "")
            .replace(/"/g, "");
    }
});

// function updateMap() {
//   var yearSelected = document.querySelector("selected");
//   return yearSelected;
// }

// // var myEvent = document.querySelector(".events");
// var aSelected = document.querySelector(".selected");
// var yearSelected = "y" + aSelected.innerHTML;

// console.log(yearSelected);

// var currData = SPI1_Yearly_Country;

function mapYearlyChange() {
    // initialize variables
    const yearlist_ul = document.getElementById("year-list");
    var aSelected = yearlist_ul.querySelector(".selected");
    var yearSelected = "Y" + aSelected.innerHTML;

    var selectedVarName = map_titles.querySelector("h3").innerHTML;

    // remove existing map
    if (map) {
        // if (geojson) {
        //   map.removeLayer(geojson); // 移除 geojson 图层
        // }
        // if (geojson_cambodia) {
        //   map.removeLayer(geojson_cambodia); // 移除 geojson 图层
        // }
        // if (geojson_india) {
        //   map.removeLayer(geojson_india); // 移除 geojson 图层
        // }
        // if (geojson_myanmar) {
        //   map.removeLayer(geojson_myanmar); // 移除 geojson 图层
        // }
        // if (geojson_thailand) {
        //   map.removeLayer(geojson_thailand); // 移除 geojson 图层
        // }
        // if (geojson_vietnam) {
        //   map.removeLayer(geojson_vietnam); // 移除 geojson 图层
        // }
        if (legend) {
            map.removeControl(legend); // 移除图例控件
        }
        if (info) {
            map.removeControl(info); // 移除信息控件
        }
        map.remove(); // 销毁地图实例
    }

    // add a new, plain map
    map = L.map("chart_container").setView([18, 90], 5);

    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            maxZoom: 12,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
    ).addTo(map);

    // // assume for a geojson object, get color for SMPct
    // function getColor(d) {
    //   return d > 80
    //     ? "#8B0000"
    //     : d > 70
    //     ? "#800026"
    //     : d > 60
    //     ? "#BD0026"
    //     : d > 50
    //     ? "#E31A1C"
    //     : d > 40
    //     ? "#FC4E2A"
    //     : d > 30
    //     ? "#FD8D3C"
    //     : d > 20
    //     ? "#FEB24C"
    //     : d > 10
    //     ? "#FED976"
    //     : "#fff";
    // }

    // // // get diverging color for SPI
    // function getColor(d) {
    //   return d > 1
    //     ? "#253494"
    //     : d > 0.8
    //     ? "#2c7fb8"
    //     : d > 0.6
    //     ? "#41b6c4"
    //     : d > 0.4
    //     ? "#7fcdbb"
    //     : d > 0.2
    //     ? "#c7e9b4"
    //     : d > 0
    //     ? "#ffffb2"
    //     : d > -0.5
    //     ? "#ffffcc"
    //     : d > -0.8
    //     ? "#FFFF00 "
    //     : d > -1.3
    //     ? "#FCD37F"
    //     : d > -1.6
    //     ? "#FFAA00"
    //     : d > -2
    //     ? "#E60000"
    //     : d < -2
    //     ? "#730000"
    //     : "#fff";
    // }

    // // new get diverging color for SPI, with white color when SPI>-0.5
    function getColor(d) {
        if (selectedVarName == "Soil Moisture Percentile") {
            return d > 30
                ? "#fff"
                : d > 20
                ? "#FFFF00 "
                : d > 10
                ? "#FCD37F"
                : d > 5
                ? "#FFAA00"
                : d > 2
                ? "#E60000"
                : d > 0
                ? "#730000"
                : "#fff";
        } else if (selectedVarName == "Yield") {
            return d < 0
                ? "#fff"
                : d > 500
                ? "#FFFF00 "
                : d > 100
                ? "#FCD37F"
                : d > 50
                ? "#FFAA00"
                : d > 10
                ? "#E60000"
                : d > 0
                ? "#730000"
                : "#fff";
        } else {
            return d > -0.5
                ? "#fff"
                : d > -0.8
                ? "#FFFF00 "
                : d > -1.3
                ? "#FCD37F"
                : d > -1.6
                ? "#FFAA00"
                : d > -2
                ? "#E60000"
                : d < -2
                ? "#730000"
                : d < -1000
                ? "#fff"
                : "#fff";
        }
    }

    function filterYearDataForFeatures(features, year) {
        const yearKey = `Y${year}`; // Construct the key for the given year, e.g., "Y1961"

        return features
            .map((feature) => {
                const value = feature.properties[yearKey]; // Extract the value for the specific year
                return {
                    Area: feature.properties.Area, // Extract the area name
                    Year: year, // Add the selected year
                    Yield: value, // Add the value for the selected year
                    Geometry: feature.geometry, // Include the geometry data if needed
                    Properties: feature.properties // Optionally include other properties
                };
            })
            .filter((feature) => feature.Value !== undefined); // Filter out features without valid data for the year
    }
    // Function to filter data by year
    let mapRaster;
    var bandIndex;
    let propertyVar;
    function filterByYear(currData, targetYear) {
        // Filter features by the target year
        if (typeof currData.type === "string") {
            mapRaster = false;
            // for SPI
            if (typeof currData.name === "undefined") {
                propertyVar = "SPI";
                result = currData.features.filter(
                    (feature) => feature.properties.year === targetYear
                );
            } else {
                // for yield
                propertyVar = "Yield";
                result = filterYearDataForFeatures(
                    currData.features,
                    targetYear
                );
                // currData.features.filter(feature => feature.properties[('Y'+targetYear.toString())]);
            }

            // for province SPI
            if (result.length === 0) {
                return currData.features.filter(
                    (feature) => feature.properties["y" + targetYear.toString()]
                );
            } else {
                return result;
            }
        } else if (typeof currData.type === "undefined") {
            console.log("raster", currData);
            mapRaster = true;
            bandIndex = Number(targetYear - 1950); // Assuming the year corresponds to the band index
            // console.log('bandindex',bandIndex >=0)
            // Ensure the bandIndex is within range
            if (bandIndex >= 0 && bandIndex < currData.values.length) {
                return currData.values[bandIndex]; // Return the specific band for the selected year
            } else {
                console.error(`Band for year ${targetYear} is out of range.`);
                return null;
            }
        }
    }

    // Filter the data for the year
    const filteredData = filterByYear(currData, Number(aSelected.innerHTML));
    // Create a new FeatureCollection with the filtered features
    console.log("type of", filteredData);
    var filteredFeatureCollection;
    // for SPI, soil moisture and yield
    if (!mapRaster && propertyVar === "SPI") {
        filteredFeatureCollection = {
            type: "FeatureCollection",
            features: filteredData
        };
        // const spiValues = filteredData
        //             .map(item => item.properties[propertyVar]) // Adjust 'value' to the actual property name
        //             .filter(value => typeof value === 'number'); // Ensure the value is a number

        //         if (spiValues.length === 0) {
        //             console.error("No valid numerical values found");
        //             return;
        //         }

        //         // Calculate the mean
        //         const sum = spiValues.reduce((acc, val) => acc + val, 0);
        //         const mean = sum / spiValues.length;
        // window.meanSPI = mean.toFixed(3)
    } else if (mapRaster) {
        // If it's raster data, keep it as a GeoRaster object
        filteredFeatureCollection = {
            ...currData, // Keep all the GeoRaster metadata
            values: [filteredData] // Replace values with the specific band filtered by year
        };
        const flattenedValues = filteredData.flatMap((array) =>
            Array.from(array)
        );
        const validValues = flattenedValues.filter(
            (value) => value !== -999000000
        );
        if (validValues.length === 0) {
            console.error("No valid values to calculate mean");
        } else {
            const sum = validValues.reduce((acc, value) => acc + value, 0);
            const mean = sum / validValues.length;

            // Format the mean to 2 decimal places
            window.meanSPI = mean.toFixed(3);
        }
        console.log("GeoRaster values:", filteredFeatureCollection.values);
        console.log(
            "GeoRaster numberOfRasters:",
            filteredFeatureCollection.numberOfRasters
        );
    } else if (!mapRaster && propertyVar == "Yield") {
        filteredFeatureCollection = filteredData;
    }

    function style(feature) {
        // console.log('feature filtered',feature.properties.SPI1)
        // console.log('color',getColor(feature.properties['y1967']))
        if (feature.properties[propertyVar]) {
            return {
                fillColor: getColor(feature.properties[propertyVar]),
                weight: 2,
                opacity: 1,
                color: "#666",
                // color: "white",
                dashArray: "3",
                fillOpacity: 0.7
            };
        } else {
            propertyVar = "SMPct";
            // soil moisture
            return {
                fillColor: getColor(
                    feature.properties["y" + aSelected.innerHTML.toString()]
                ),
                weight: 2,
                opacity: 1,
                color: "#666",
                // color: "white",
                dashArray: "3",
                fillOpacity: 0.7
            };
        }
    }

    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            color: "#666",
            dashArray: "",
            fillOpacity: 0.8
        });
        info.update(layer.feature.properties);
        layer.bringToFront();
    }

    function resetHighlight(e) {
        if (geojson) {
            geojson.resetStyle(e.target);
        }
        if (geojson_myanmar) {
            geojson_myanmar.resetStyle(e.target);
        }
        if (geojson_cambodia) {
            geojson_cambodia.resetStyle(e.target);
        }
        if (geojson_india) {
            geojson_india.resetStyle(e.target);
        }
        if (geojson_thailand) {
            geojson_thailand.resetStyle(e.target);
        }
        if (geojson_vietnam) {
            geojson_vietnam.resetStyle(e.target);
        }
        info.update();
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    }

    // 添加geometry layer
    console.log(mapRaster);
    console.log(filteredFeatureCollection);
    if (!mapRaster) {
        geojson = L.geoJson(filteredFeatureCollection, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);
    } else {
        console.log("filter collection", filteredFeatureCollection);
        const layer = new GeoRasterLayer({
            georaster: filteredFeatureCollection,
            opacity: 0.6,
            pixelValuesToColorFn: (values) => {
                const pixelValue = values[0];
                if (pixelValue === 0 || isNaN(pixelValue)) {
                    return null;
                }
                return getColor(pixelValue);
            },
            resolution: 64
        });

        layer.addTo(map);
        map.fitBounds(layer.getBounds());
    }

    // geojson = L.geoJson(SPI1_yearly_prov_tha, {
    //   style: style,
    //   onEachFeature: onEachFeature,
    // }).addTo(map);

    // 添加自定义信息控件
    info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create("div", "info"); // 创建一个带有类 "info" 的 div
        this.update();
        return this._div;
    };

    function giveVarFullName(shortName) {
        console.log(shortName);
        if (shortName == "SPI1") {
            return "SPI (1 month)";
        }
        if (shortName == "SPI3") {
            return "SPI (3 month)";
        }
        if (shortName == "SPI6") {
            return "SPI (6 month)";
        }
        if (shortName == "SPI12") {
            return "SPI (12 month)";
        }
        if (shortName == "SMPct") {
            return "Soil Moisture Percentile";
        }
        if (shortName == "Yield") {
            return "Rice Yield";
        }
    }

    // var map_titles = document.querySelector(".map_titles");

    function checkNullThenRound(valueToCheck) {
        if (valueToCheck == null) {
            return null;
        } else {
            return valueToCheck.toFixed(2);
        }
    }
    if (propertyVar == "SPI") {
        info.update = function (props) {
            this._div.innerHTML =
                "<h4>" +
                // map_titles.querySelector("p").innerHTML +
                " " +
                map_titles.querySelector("h3").innerHTML +
                "<h4>" +
                (props
                    ? "<b>" +
                      props.name +
                      "</b><br />" +
                      "Value: " +
                      checkNullThenRound(props[propertyVar])
                    : // props[yearSelected]
                      "Hover over a state");
        };
    } else {
        info.update = function (props) {
            this._div.innerHTML =
                "<h4>" +
                // map_titles.querySelector("p").innerHTML +
                " " +
                map_titles.querySelector("h3").innerHTML +
                "<h4>" +
                (props
                    ? "<b>" +
                      props.name +
                      "</b><br />" +
                      "Value: " +
                      checkNullThenRound(
                          props["y" + aSelected.innerHTML.toString()]
                      )
                    : // props[yearSelected]
                      "Hover over a state");
        };
    }
    info.addTo(map);

    // 添加自定义图例控件
    legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");
        var grades = [-1, -0.8, -0.6, -0.4, -0.2, 0.2, 0.4, 0.6, 0.8, 1.0]; // 图例的分类

        //   // grades = [10, 20, 30, 40, 50, 60, 70, 80],
        //   grades = [-1, -0.8, -0.6, -0.4, -0.2, 0.2, 0.4, 0.6, 0.8, 1.0],
        //   labels = [];

        if (selectedVarName == "Soil Moisture Percentile") {
            div.innerHTML =
                '<h4 class="legend_title">Legend<h4>' +
                '<div class="legend-labels-upper">' +
                '<span class="legend-label D0">D0</span>' +
                '<span class="legend-label D2">D2</span>' +
                '<span class="legend-label D4">D4</span>' +
                "</div>" +
                '<div class="legend-line-SPI"></div>' +
                '<div class="legend-labels-lower">' +
                '<span class="legend-label wet_normal">wet/normal</span>' +
                '<span class="legend-label D1">D1</span>' +
                '<span class="legend-label D3">D3</span>' +
                "</div>";

            // '<h4 class="legend_title">Legend<h4>' +
            // '<div class="legend-line-SMPct"></div>' +
            // '<div class="legend-labels">' +
            // '<span class="legend-label">0</span>' +
            // '<span class="legend-label">25</span>' +
            // '<span class="legend-label">50</span>' +
            // '<span class="legend-label">75</span>' +
            // '<span class="legend-label">100</span>' +
            // "</div>";
        } else {
            div.innerHTML =
                '<h4 class="legend_title">Legend<h4>' +
                '<div class="legend-labels-upper">' +
                '<span class="legend-label D0">D0</span>' +
                '<span class="legend-label D2">D2</span>' +
                '<span class="legend-label D4">D4</span>' +
                "</div>" +
                '<div class="legend-line-SPI"></div>' +
                '<div class="legend-labels-lower">' +
                '<span class="legend-label wet_normal">wet/normal</span>' +
                '<span class="legend-label D1">D1</span>' +
                '<span class="legend-label D3">D3</span>' +
                "</div>";
        }

        // for (var i = 0; i < grades.length; i++) {
        //   div.innerHTML +=
        //     '<p style="background:' + getColor(grades[i] + 0.000001) + '"></p> ';

        //   // for (var i = 0; i < grades.length; i++) {
        //   //   div.innerHTML +=
        //   //     '<i style="background:' +
        //   //     getColor(grades[i] + 0.000001) +
        //   //     '"></i> ' +
        //   //     grades[i] +
        //   //     (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        // }

        return div;
    };

    legend.addTo(map);
}

// mapFunc_m03(yearSelected);

// new test for monthly data change
// include modular function attempt

// 初始化地图
function initializeMap() {
    map = L.map("map").setView([0, 0], 2); // 设置地图中心和缩放等级

    // 添加底图
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    // 添加初始 GeoJSON 图层
    updateMapLayer();
}

// 根据当前日期更新 GeoJSON 图层
function updateMapLayer() {
    if (!currData) {
        console.error("currData 未定义！");
        return;
    }

    // 格式化日期为属性字段格式，例如 "y1990_01"
    const formattedDate = `y${date.replace("-", "_")}`;

    // 提取对应日期的 GeoJSON 数据
    const filteredData = {
        ...currData,
        features: currData.features
            .map((feature) => ({
                ...feature,
                properties: feature.properties[formattedDate] // 仅保留当前日期的属性
            }))
            .filter((feature) => feature.properties) // 过滤无效数据
    };

    // 移除旧的 GeoJSON 图层
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }

    // 添加新的 GeoJSON 图层
    geoJsonLayer = L.geoJSON(filteredData, {
        style: (feature) => ({
            color: "blue",
            fillColor: "lightblue",
            fillOpacity: 0.5
        }),
        onEachFeature: (feature, layer) => {
            if (feature.properties) {
                layer.bindPopup(`Value: ${feature.properties.value}`);
            }
        }
    }).addTo(map);
}
