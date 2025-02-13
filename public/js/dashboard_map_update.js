// get const for event listener
const select = document.querySelectorAll(".select");
const options_list = document.querySelectorAll(".options_list");
const options_1 = document.querySelectorAll(".opt_1");
const options_2 = document.querySelectorAll(".opt_2");

const options_list_data = document.querySelector(".options_list_data");
const options_list_region = document.querySelector(".options_list_region");

// const datePicker = document.getElementById("date-picker");

var map_titles = document.querySelector(".map_titles");
// var map_subtitles = document.querySelector(".map_sub_title");

// initialize current variable data
var currData;

// Show/hide the 2nd menu
function giveVarFullName(shortName) {
    console.log("shortname", shortName);
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

for (let i = 0; i < select.length; i++) {
    select[i].addEventListener("click", () => {
        options_list[i].classList.toggle("active");
        select[i]
            .querySelector(".fa-angle-down")
            .classList.toggle("fa-angle-up");
    });
}

options_1.forEach((option) => {
    option.addEventListener("click", () => {
        options_1.forEach((option) => {
            option.classList.remove("selected");
        });
        select[0].querySelector("span").innerHTML = option.innerHTML;
        // map_titles.querySelector("h3").innerHTML = option.innerHTML;
        map_titles.querySelector("h3").innerHTML = giveVarFullName(
            option.innerHTML
        );
        option.classList.add("selected");
        options_list[0].classList.toggle("active");
        select[0].querySelector(".fa-angle-up").classList.toggle("fa-angle-up");

        // change selected data var
        changeVariable();
        mapYearlyChange();

        // clear all options_2 selected
        // options_2.forEach((option) => {
        //   option.classList.remove("selected");
        // });
        // select[1].querySelector("span").innerHTML = "Select Region";
    });
});

options_2.forEach((option) => {
    option.addEventListener("click", () => {
        options_2.forEach((option) => {
            option.classList.remove("selected");
        });
        select[1].querySelector("span").innerHTML = option.innerHTML;
        map_titles.querySelector("p").innerHTML = option.innerHTML;
        option.classList.add("selected");
        options_list[1].classList.toggle("active");
        select[1].querySelector(".fa-angle-up").classList.toggle("fa-angle-up");

        // change selected data var
        changeVariable();
        mapYearlyChange();
    });
});

// radios selection => change variables & update
function getCheckedRadioSpanContent(radioGroupName) {
    // select all radios having [name=${radioGroupName}]
    const radios = document.querySelectorAll(
        `input[type="radio"][name="${radioGroupName}"]`
    );

    // check which radio checked
    for (let radio of radios) {
        if (radio.checked) {
            // find adjcent span element and get innerHTML value
            const span = radio.nextElementSibling;

            return span.innerHTML;
        }
    }
    // if no checked radio, retun null
    return null;
}

// add event listners to listen every change in radios
function addRadioChangeListener(radioGroupName) {
    const radios = document.querySelectorAll(
        `input[type="radio"][name="${radioGroupName}"]`
    );

    radios.forEach((radio) => {
        radio.addEventListener("click", () => {
            changeVariable();
            mapYearlyChange();
            // selectedSpanContent = getCheckedRadioSpanContent(radioGroupName);
            // // 输出结果到某个元素，或在控制台中输出
            // console.log(selectedSpanContent);
        });
    });
}

console.log("Listener added to window:", window);

//

//

// START: function of fetching data from api

async function fetchData(apiUrl) {
    try {
        // 使用 fetch 从 API 获取数据
        const response = await fetch(apiUrl); // 替换为你的 API URL

        // 检查响应是否成功
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        // 解析 JSON 数据
        const data = await response.json();

        // 将数据赋值给变量
        currData = data; // 在这里赋值

        // 你可以在这里使用 myData 变量
        // console.log("fetch data is like:", currData);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}
// END: function of fetching data from api

// set listeners for radios
addRadioChangeListener("radio_time_res");
addRadioChangeListener("radio_space_res");

const radio_space_res = document.querySelectorAll(".radio_space_res");
// change variable function
function changeVariable() {
    // initialize parameters determining which data will be selected
    // src = "./data/prov_yearly/data_yearly_prov_1950_2016.js";

    console.log("received date info:", date);

    var dataNameSelected =
        options_list_data.querySelector(".selected").innerHTML;
    var regionNameSelected =
        options_list_region.querySelector(".selected").innerHTML;
    console.log(regionNameSelected);
    var spaceresSelected = getCheckedRadioSpanContent("radio_space_res");

    var timeresSelected = getCheckedRadioSpanContent("radio_time_res");
    console.log("time resolution selected:", timeresSelected);

    if (spaceresSelected == "Province/State") {
        spaceresSelected = "Prov";
    }

    // 根据选择构造 API URL
    const apiUrl = `/api/get_${dataNameSelected}_${timeresSelected}_${spaceresSelected}_${regionNameSelected}`;

    console.log("Fetching data from:", apiUrl);

    // check parameters
    if (spaceresSelected == "Country") {
        if (dataNameSelected == "SPI1") {
            currData = SPI1_Yearly_Country;
        }
        if (dataNameSelected == "SPI3") {
            currData = SPI3_Yearly_Country;
        }
        if (dataNameSelected == "SPI6") {
            currData = SPI6_Yearly_Country;
        }
        if (dataNameSelected == "SPI12") {
            currData = SPI12_Yearly_Country;
        }
        if (dataNameSelected == "SMPct") {
            currData = SMPct_Yearly_Country;
        }
        if (dataNameSelected == "Yield") {
            currData = Yield_Yearly_Country;
        }
    }
    if (spaceresSelected == "Province/State") {
        if (dataNameSelected == "SPI1") {
            if (regionNameSelected == "Cambodia") {
                currData = SPI1_yearly_prov_cam;
            }
            if (regionNameSelected == "Laos") {
                currData = SPI1_yearly_prov_lao;
            }
            if (regionNameSelected == "Thailand") {
                currData = SPI1_yearly_prov_tha;
            }
            if (regionNameSelected == "Myanmar") {
                currData = SPI1_yearly_prov_mya;
            }
            if (regionNameSelected == "Vietnam") {
                currData = SPI1_yearly_prov_vie;
            }
        }
        if (dataNameSelected == "SPI3") {
            if (regionNameSelected == "Cambodia") {
                currData = SPI3_yearly_prov_cam;
            }
            if (regionNameSelected == "Laos") {
                currData = SPI3_yearly_prov_lao;
            }
            if (regionNameSelected == "Thailand") {
                currData = SPI3_yearly_prov_tha;
            }
            if (regionNameSelected == "Myanmar") {
                currData = SPI3_yearly_prov_mya;
            }
            if (regionNameSelected == "Vietnam") {
                currData = SPI3_yearly_prov_vie;
            }
        }
        if (dataNameSelected == "SPI6") {
            if (regionNameSelected == "Cambodia") {
                fetchData("/api/get_SPI6_Yearly_Prov_Cambodia");
            }
            if (regionNameSelected == "India") {
                fetchData("/api/get_SPI6_yearly_india");
            }
            if (regionNameSelected == "Laos") {
                fetchData("/api/get_SPI6_yearly_laos");
            }
            if (regionNameSelected == "Thailand") {
                fetchData("/api/get_SPI6_yearly_thailand");
            }
            if (regionNameSelected == "Myanmar") {
                fetchData("/api/get_SPI6_yearly_myanmar");
            }
            if (regionNameSelected == "Vietnam") {
                fetchData("/api/get_SPI6_yearly_vietnam");
            }
        }
        if (dataNameSelected == "SMPct") {
            if (regionNameSelected == "Cambodia") {
                currData = SMPct_yearly_prov_cam;
            }
            if (regionNameSelected == "Laos") {
                currData = SMPct_yearly_prov_lao;
            }
            if (regionNameSelected == "Thailand") {
                currData = SMPct_yearly_prov_tha;
            }
            if (regionNameSelected == "Myanmar") {
                currData = SMPct_yearly_prov_mya;
            }
            if (regionNameSelected == "Vietnam") {
                currData = SMPct_yearly_prov_vie;
            }
        }
    }
    if (spaceresSelected == "Grid") {
        if (dataNameSelected == "SPI1") {
            if (regionNameSelected == "Cambodia") {
                currData = SPI1_yearly_grid_cam;
            }
            if (regionNameSelected == "Laos") {
                currData = SPI1_yearly_grid_lao;
            }
            if (regionNameSelected == "Thailand") {
                currData = SPI1_yearly_grid_tha;
            }
            if (regionNameSelected == "Myanmar") {
                currData = SPI1_yearly_grid_mya;
            }
            if (regionNameSelected == "Vietnam") {
                currData = SPI1_yearly_grid_vie;
            }
        }
        if (dataNameSelected == "SPI3") {
            if (regionNameSelected == "Cambodia") {
                currData = SPI3_yearly_grid_cam;
            }
            if (regionNameSelected == "Laos") {
                currData = SPI3_yearly_grid_lao;
            }
            if (regionNameSelected == "Thailand") {
                currData = SPI3_yearly_grid_tha;
            }
            if (regionNameSelected == "Myanmar") {
                currData = SPI3_yearly_grid_mya;
            }
            if (regionNameSelected == "Vietnam") {
                currData = SPI3_yearly_grid_vie;
            }
        }
        if (dataNameSelected == "SPI6") {
            if (regionNameSelected == "Cambodia") {
                currData = SPI6_yearly_grid_cam;
            }
            if (regionNameSelected == "Laos") {
                currData = SPI6_yearly_grid_lao;
            }
            if (regionNameSelected == "Thailand") {
                currData = SPI6_yearly_grid_tha;
            }
            if (regionNameSelected == "Myanmar") {
                currData = SPI6_yearly_grid_mya;
            }
            if (regionNameSelected == "Vietnam") {
                currData = SPI6_yearly_grid_vie;
            }
        }
        if (dataNameSelected == "SPI12") {
            if (regionNameSelected == "Cambodia") {
                currData = SPI12_yearly_grid_cam;
            }
            if (regionNameSelected == "Laos") {
                currData = SPI12_yearly_grid_lao;
            }
            if (regionNameSelected == "Thailand") {
                currData = SPI12_yearly_grid_tha;
            }
            if (regionNameSelected == "Myanmar") {
                currData = SPI12_yearly_grid_mya;
            }
            if (regionNameSelected == "Vietnam") {
                currData = SPI12_yearly_grid_vie;
            }
        }
        if (dataNameSelected == "SMPct") {
            if (regionNameSelected == "Cambodia") {
                currData = SMPct_yearly_grid_cam;
            }
            if (regionNameSelected == "Laos") {
                currData = SMPct_yearly_grid_lao;
            }
            if (regionNameSelected == "Thailand") {
                currData = SMPct_yearly_grid_tha;
            }
            if (regionNameSelected == "Myanmar") {
                currData = SMPct_yearly_grid_mya;
            }
            if (regionNameSelected == "Vietnam") {
                currData = SMPct_yearly_grid_vie;
            }
        }
    }

    fetchData(apiUrl);

    // apply data change function
    // mapYearlyChange();

    console.log(dataNameSelected);
    console.log(spaceresSelected);
    console.log("current data", currData);
    //   return currData;
}

// var dataSelected = options_list_data.querySelector(".selected").innerHTML;
// console.log(dataSelected);

// // 日期更改事件监听器
// document.getElementById("datepicker").addEventListener("change", (event) => {
//     console.log("event listened: date has changed");
//     date = event.target.value; // 更新全局日期变量
//     var timeresSelected = getCheckedRadioSpanContent("radio_time_res");
//     if ((timeresSelected = "Monthly")) {
//         updateMapLayer(); // 根据新日期更新地图
//     }
// });

// 监听自定义事件-日期改动
addEventListener("datePickerChange", (event) => {
    console.log("Received event of date change:", event);
    date = event.detail.apiUrl;

    // check selected time resolution,
    var timeresSelected = getCheckedRadioSpanContent("radio_time_res");

    console.log(timeresSelected);
    // call responding map update function based on selected time resolution
    if ((timeresSelected = "Monthly")) {
        console.log("Detected 'Monthly' resolution is selected!");
        changeVariable();
        updateMapLayer(); // 根据新日期更新地图
    } else if ((timeresSelected = "Yearly")) {
        console.log("Detected 'Yearly' resolution is selected!");
        changeVariable();
        mapYearlyChange();
    }

    // // 调用地图更新逻辑
    // changeVariable();
    // mapYearlyChange();
});
