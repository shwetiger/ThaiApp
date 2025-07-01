function dateFormat(inputDate, format) {
    //parse the input date
    const date = new Date(inputDate);

    //extract the parts of the date
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    //replace the month
    format = format.replace("MM", month.toString().padStart(2, "0"));

    //replace the year
    if (format.indexOf("yyyy") > -1) {
        format = format.replace("yyyy", year.toString());
    } else if (format.indexOf("yy") > -1) {
        format = format.replace("yy", year.toString().substr(2, 2));
    }

    //replace the day
    format = format.replace("dd", day.toString().padStart(2, "0"));

    //replace the hour
    format = format.replace("hh", hour.toString().padStart(2, "0"));

    //replace the minute
    format = format.replace("mm", minute.toString().padStart(2, "0"));

    //replace the second
    //format = format.replace("ss", second.toString().padStart(2, "0"));

    //replace the a
    format = format.replace("a", hour >= 12 ? 'PM' : 'AM');

    return format;
}

function timeFormat(time, format) {

    const myArray = time.split(":");
    const hour = myArray[0];
    const minute = myArray[1];
    const second = myArray[2];

    //replace the hour
    var hourValue = hour;
    if (hour > 12) {
        hourValue = hour - 12;
    }
    format = format.replace("hh", hourValue.toString().padStart(2, "0"));

    //replace the minute
    format = format.replace("mm", minute.toString().padStart(2, "0"));

    //replace the second
    format = format.replace("ss", second.toString().padStart(2, "0"));

    //replace the a
    format = format.replace("a", hour >= 12 ? 'PM' : 'AM');

    return format;
}


async function getLiveData() {

   // Parse.serverURL = 'https://parseapi.back4app.com';
    Parse.keyLiveQueryUrl = 'wss://thai2d3d.b4a.io';
    Parse.initialize('dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ', 'G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx');
    var client = new Parse.LiveQueryClient({
        applicationId: 'dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ',
        serverURL: 'wss://thai2d3d.b4a.io',
        javascriptKey: 'G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx'
    });

    client.open();
    var query = new Parse.Query('Result2D');
    var datas = await query.get("xJyLLYFAPX");


    if (datas != '' && datas != null && datas != undefined) {

        var set1200 = datas.get('set_1200');
        var val1200 = datas.get('val_1200');
        var set430 = datas.get('set_430');
        var val430 = datas.get('val_430');
        var result1200 = datas.get('result_1200');
        var result430 = datas.get('result_430');
        var internet930 = datas.get('internet_930') == "" ? "--" : datas.get('internet_930');
        var modern930 = datas.get('modern_930') == "" ? "--" : datas.get('modern_930');
        var internet200 = datas.get('internet_200') == "" ? "--" : datas.get('internet_200');
        var modern200 = datas.get('modern_200') == "" ? "--" : datas.get('modern_200');
        var date = datas.get('date');
        var time1200 = datas.get('time_1200');
        var time430 = datas.get('time_430');
        var live = datas.get('live');
        var liveSet = datas.get('live_set');
        var liveVal = datas.get('live_val');
        var status1200 = datas.get('status_1200');
        var status430 = datas.get('status_430');
        var lastDate = datas.get('last_date');
        var isCloseDay = datas.get('is_close_day');
        var currentDate = datas.get('current_date');
        var currentTime = datas.get('current_time');

        // for Big Result
        var bigResult = "--";
        var bigResultAnimate = (result430 == '--' && set430 != '--') ||
            result1200 == "--";

        bigResult = result1200 == "--"
            ? (result430 ==
                '--'
                ? live
                : result430)
            : (result430 ==
                '--'
                ? (set430 ==
                    '--' && val430 ==
                    '--'
                    ? result1200
                    : live)
                : result430);

        document.getElementById('result').innerHTML = bigResult;

        //for Big Result Animate
        if (bigResultAnimate == false) {

            document.getElementById('result').className = 'resultStyle';
        }
        else {
            document.getElementById('result').className = 'resultStyleAnimate';
        }



        //for Update Date     
        var value = "";
        if (currentDate != null && currentDate != "") {
            var date = new Date();
            var dateStr = dateFormat(date, 'yyyy-MM-dd');
            var updateTime = timeFormat(currentTime, "hh:mm a");
           // console.log("Update time:" + updateTime);

            value = "  Updated: " +
                dateStr
                +
                " " +
                (result1200
                    ==
                    "--"
                    ? (result430
                        ==
                        '--'
                        ? updateTime
                        : "4:30 PM")
                    : (result430
                        ==
                        '--'
                        ? (set430
                            ==
                            '--' &&
                            val430
                            ==
                            '--')
                            ? "12:01 PM"
                            : updateTime
                        : "4:30 PM"))
            //console.log('Converted date: ' + value);

        }
        var updatedTime = value;

        var changeIcon = (result430 == '--' && set430 != '--') || result1200 == "--";

        document.getElementById('lastUpdateDate').innerHTML =
            (changeIcon == false ? "<div class='d-flex justify-content-center'><ion-icon name='checkmark-sharp' style='font-size:18px;padding-right: 2px;'></ion-icon>" : "<img src='/assets/img/refresh.png' width='20'>")
            + '<span>' + updatedTime + '</span></div>';

        //for Sections

        document.getElementById('section-container').innerHTML = '<div id="section-container" class="container"> </div>';

        //for 12:00 PM
        var set1200_0 = '--';
        var set1200_1 = '';

        if (set1200 != "--" && set1200 != null && set1200 != '') {
            set1200_0 = set1200.substr(0, set1200.length - 1);
            set1200_1 = set1200.substr(set1200.length - 1, set1200.length);
        }

        var val1200_0 = '--';
        var val1200_1 = '';
        var val1200_2 = '';
        if (val1200 != "--" && val1200 != null && val1200 != '') {
            val1200_0 = val1200.substr(0, val1200.length - 4);
            val1200_1 = val1200.substr(val1200.length - 4, 1);
            val1200_2 = val1200.substr(val1200.length - 3, val1200.length);
        }

        //for 04:30 PM
        var set430_0 = '--';
        var set430_1 = '';

        if (set430 != "--" && set430 != null && set430 != '') {
            set430_0 = set430.substr(0, set430.length - 1);
            set430_1 = set430.substr(set430.length - 1, set430.length);
        }

        var val430_0 = '--';
        var val430_1 = '';
        var val430_2 = '';
        if (val430 != "--" && val430 != null && val430 != '') {
            val430_0 = val430.substr(0, val430.length - 4);
            val430_1 = val430.substr(val430.length - 4, 1);
            val430_2 = val430.substr(val430.length - 3, val430.length);
        }


        //for 12:00 PM
        var sec1200Shake = result1200 == "--";
        document.getElementById('section-container').innerHTML =
            document.getElementById('section-container').innerHTML +
            " <div class='row' style='text-align: center; - webkit - box - pack: justify; -ms - flex - pack: justify;justify - content: space - between;padding:0px;margin-top:8px;margin-bottom:2px;margin-left:0px;margin-right:0px;'>" +
            "<div class='card' style='min-width: 100%;background-color:#2253A2; margin: 2px 0px;padding: 10px;text - align: center;color:white;'><div style='text-align: center;color: white;font - weight: bold;padding - bottom: 8px; font-size:14px;'>" +
            "12:01 PM" +
            "</div> <div class='row' style='padding-top: 8px;text-align: center; - webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'> <div class='col-4'><p>Set</p></div><div class='col-4'><p>Value</p></div><div class='col-4'><p>2D</p></div></div >" +
            "<div class='row' style='" + (sec1200Shake == true ? "-webkit-animation: fadeIn 1s infinite alternate;animation: fadeIn 1s infinite alternate;" : "") + "text - align: center; -webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'>" +
            " <div class='col - 4'> <span >"
            + set1200_0 +
            "</span ><span style='color: #FFFF00;'>" +
            set1200_1 + "</span></div> <div class='col - 4'> </span><span>" + val1200_0 + "</span><span style='color: #FFFF00;'>" + val1200_1 + "</span><span>" + val1200_2 + "</span></div> <div class='col-4'><span style='color: #FFFF00;'>" + result1200 +
            "</span> </div></div ></div> </div > ";

        //for 04:30 PM
        var sec430Shake = result430 == "--" && result1200 != "--";
        document.getElementById('section-container').innerHTML =
            document.getElementById('section-container').innerHTML +
            " <div class='row' style='text-align: center; - webkit - box - pack: justify; -ms - flex - pack: justify;justify - content: space - between;padding:0px;margin-bottom:2px;margin-left:0px;margin-right:0px;'>" +
            "<div class='card' style='min-width: 100%;background-color:#2253A2; margin: 2px 0px;padding: 10px;text - align: center;color:white;'><div style='text-align: center;color: white;font - weight: bold;padding - bottom: 8px; font-size:14px;'>" +
            "04:30 PM" +
            "</div> <div class='row' style='padding-top: 8px;text-align: center; - webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'> <div class='col-4'><p>Set</p></div><div class='col-4'><p>Value</p></div><div class='col-4'><p>2D</p></div></div >" +
            "<div class='row' style='" + (sec430Shake == true ? "-webkit-animation: fadeIn 1s infinite alternate;animation: fadeIn 1s infinite alternate;" : "") + "text - align: center; -webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'>" +
            " <div class='col - 4'> <span >"
            + set430_0 +
            "</span ><span style='color: #FFFF00;'>" +
            set430_1 + "</span></div> <div class='col - 4'> </span><span>" + val430_0 + "</span><span style='color: #FFFF00;'>" + val430_1 + "</span><span>" + val430_2 + "</span></div> <div class='col-4'><span style='color: #FFFF00;'>" + result430 +
            "</span> </div></div ></div> </div > ";


        //for modern 9:30
        document.getElementById('section-container').innerHTML =
            document.getElementById('section-container').innerHTML +
            " <div class='row' style='text-align: center; - webkit - box - pack: justify; -ms - flex - pack: justify;justify - content: space - between;padding:0px;margin-bottom:2px;margin-left:0px;margin-right:0px;'>" +
            "<div class='card' style='min-width: 100%;background-color:#2253A2; margin: 2px 0px;padding: 10px;text - align: center;color:white;'>" +
            "<div class='row' style='padding-top: 8px;text-align: center; - webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'> <div class='col-4'><p></p></div><div class='col-4'><p>Modern</p></div><div class='col-4'><p>Internet</p></div></div >" +
            "<div class='row' style='text - align: center; -webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'>" +
            " <div class='col - 4' style='margin-top: -20px;'> <span style='font-weight:bold; font-size:16px;' >"
            + "9:30 AM" +
            "</span ></div> <div class='col - 4'> </span><span style='color: #FFFF00;'>" + modern930 + "</span></div> <div class='col-4'><span style='color: #FFFF00;'>" + internet930 +
            "</span> </div></div ></div> </div > ";

        //for modern 2:00
        document.getElementById('section-container').innerHTML =
            document.getElementById('section-container').innerHTML +
            " <div class='row' style='text-align: center; - webkit - box - pack: justify; -ms - flex - pack: justify;justify - content: space - between;padding:0px;margin-bottom:2px;margin-left:0px;margin-right:0px;'>" +
            "<div class='card' style='min-width: 100%;background-color:#2253A2; margin: 2px 0px;padding: 10px;text - align: center;color:white;'>" +
            "<div class='row' style='padding-top: 8px;text-align: center; - webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'> <div class='col-4'><p></p></div><div class='col-4'><p>Modern</p></div><div class='col-4'><p>Internet</p></div></div >" +
            "<div class='row' style='text - align: center; -webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'>" +
            " <div class='col - 4' style='margin-top: -20px;'> <span style='font-weight:bold; font-size:16px;'>"
            + "2:00 PM" +
            "</span ></div> <div class='col - 4'> </span><span style='color: #FFFF00;'>" + modern200 + "</span></div> <div class='col-4'><span style='color: #FFFF00;'>" + internet200 +
            "</span> </div></div ></div> </div > ";

    }

    var subscription = client.subscribe(query);

    subscription.on('open', result => {
        /// console.log("OPENED"+JSON.stringify(result));
    });


    subscription.on('update', result => {
        var page = document.getElementById('livePage');
        if (page != null) {

            var datas = result;

            if (datas != '' && datas != null && datas != undefined) {

                var set1200 = datas.get('set_1200');
                var val1200 = datas.get('val_1200');
                var set430 = datas.get('set_430');
                var val430 = datas.get('val_430');
                var result1200 = datas.get('result_1200');
                var result430 = datas.get('result_430');
                var internet930 = datas.get('internet_930') == "" ? "--" : datas.get('internet_930');
                var modern930 = datas.get('modern_930') == "" ? "--" : datas.get('modern_930');
                var internet200 = datas.get('internet_200') == "" ? "--" : datas.get('internet_200');
                var modern200 = datas.get('modern_200') == "" ? "--" : datas.get('modern_200');
                var date = datas.get('date');
                var time1200 = datas.get('time_1200');
                var time430 = datas.get('time_430');
                var live = datas.get('live');
                var liveSet = datas.get('live_set');
                var liveVal = datas.get('live_val');
                var status1200 = datas.get('status_1200');
                var status430 = datas.get('status_430');
                var lastDate = datas.get('last_date');
                var isCloseDay = datas.get('is_close_day');
                var currentDate = datas.get('current_date');
                var currentTime = datas.get('current_time');

                // for Big Result
                var bigResult = "--";
                var bigResultAnimate = (result430 == '--' && set430 != '--') ||
                    result1200 == "--";

                bigResult = result1200 == "--"
                    ? (result430 ==
                        '--'
                        ? live
                        : result430)
                    : (result430 ==
                        '--'
                        ? (set430 ==
                            '--' && val430 ==
                            '--'
                            ? result1200
                            : live)
                        : result430);

                document.getElementById('result').innerHTML = bigResult;

                //for Big Result Animate
                if (bigResultAnimate == false) {

                    document.getElementById('result').className = 'resultStyle';
                }
                else {
                    document.getElementById('result').className = 'resultStyleAnimate';
                }



                //for Update Date     
                var value = "";
                if (currentDate != null && currentDate != "") {
                    var date = new Date();
                    var dateStr = dateFormat(date, 'yyyy-MM-dd');
                    var updateTime = timeFormat(currentTime, "hh:mm a");
                    //console.log("Update time:" + updateTime);

                    value = "  Updated: " +
                        dateStr
                        +
                        " " +
                        (result1200
                            ==
                            "--"
                            ? (result430
                                ==
                                '--'
                                ? updateTime
                                : "4:30 PM")
                            : (result430
                                ==
                                '--'
                                ? (set430
                                    ==
                                    '--' &&
                                    val430
                                    ==
                                    '--')
                                    ? "12:01 PM"
                                    : updateTime
                                : "4:30 PM"))
                    //console.log('Converted date: ' + value);

                }
                var updatedTime = value;
                var changeIcon = (result430 == '--' && set430 != '--') || result1200 == "--";

                document.getElementById('lastUpdateDate').innerHTML =
                    (changeIcon == false ? "<div class='d-flex justify-content-center'><ion-icon name='checkmark-sharp' style='font-size:18px; padding-right: 2px;'></ion-icon>" : "<img src='/assets/img/refresh.png' width='20'>")
                    + '<span>' + updatedTime + '</span></div>';

                //for Sections

                document.getElementById('section-container').innerHTML = '<div id="section-container" class="container"> </div>';

                //for 12:00 PM
                var set1200_0 = '--';
                var set1200_1 = '';

                if (set1200 != "--" && set1200 != null && set1200 != '') {
                    set1200_0 = set1200.substr(0, set1200.length - 1);
                    set1200_1 = set1200.substr(set1200.length - 1, set1200.length);
                }

                var val1200_0 = '--';
                var val1200_1 = '';
                var val1200_2 = '';
                if (val1200 != "--" && val1200 != null && val1200 != '') {
                    val1200_0 = val1200.substr(0, val1200.length - 4);
                    val1200_1 = val1200.substr(val1200.length - 4, 1);
                    val1200_2 = val1200.substr(val1200.length - 3, val1200.length);
                }

                //for 04:30 PM
                var set430_0 = '--';
                var set430_1 = '';

                if (set430 != "--" && set430 != null && set430 != '') {
                    set430_0 = set430.substr(0, set430.length - 1);
                    set430_1 = set430.substr(set430.length - 1, set430.length);
                }

                var val430_0 = '--';
                var val430_1 = '';
                var val430_2 = '';
                if (val430 != "--" && val430 != null && val430 != '') {
                    val430_0 = val430.substr(0, val430.length - 4);
                    val430_1 = val430.substr(val430.length - 4, 1);
                    val430_2 = val430.substr(val430.length - 3, val430.length);
                }


                //for 12:00 PM
                var sec1200Shake = result1200 == "--";
                document.getElementById('section-container').innerHTML =
                    document.getElementById('section-container').innerHTML +
                    " <div class='row' style='text-align: center; - webkit - box - pack: justify; -ms - flex - pack: justify;justify - content: space - between;padding:0px;margin-top:8px;margin-bottom:8px;margin-left:0px;margin-right:0px;'>" +
                    "<div class='card' style='min-width: 100%;background-color:#2253A2; margin: 2px 0px;padding: 10px;text - align: center;color:white;'><div style='text-align: center;color: white;font - weight: bold;padding - bottom: 8px; font-size:14px;'>" +
                    "12:01 PM" +
                    "</div> <div class='row' style='padding-top: 8px;text-align: center; - webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'> <div class='col-4'><p>Set</p></div><div class='col-4'><p>Value</p></div><div class='col-4'><p>2D</p></div></div >" +
                    "<div class='row' style='" + (sec1200Shake == true ? "-webkit-animation: fadeIn 1s infinite alternate;animation: fadeIn 1s infinite alternate;" : "") + "text - align: center; -webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'>" +
                    " <div class='col - 4'> <span >"
                    + set1200_0 +
                    "</span ><span style='color: #FFFF00;'>" +
                    set1200_1 + "</span></div> <div class='col - 4'> </span><span>" + val1200_0 + "</span><span style='color: #FFFF00;'>" + val1200_1 + "</span><span>" + val1200_2 + "</span></div> <div class='col-4'><span style='color: #FFFF00;'>" + result1200 +
                    "</span> </div></div ></div> </div > ";

                //for 04:30 PM
                var sec430Shake = result430 == "--" && result1200 != "--";
                document.getElementById('section-container').innerHTML =
                    document.getElementById('section-container').innerHTML +
                    " <div class='row' style='text-align: center; - webkit - box - pack: justify; -ms - flex - pack: justify;justify - content: space - between;padding:0px;margin-top:8px;margin-bottom:8px;margin-left:0px;margin-right:0px;'>" +
                    "<div class='card' style='min-width: 100%;background-color:#2253A2; margin: 2px 0px;padding: 10px;text - align: center;color:white;'><div style='text-align: center;color: white;font - weight: bold;padding - bottom: 8px; font-size:14px;'>" +
                    "04:30 PM" +
                    "</div> <div class='row' style='padding-top: 8px;text-align: center; - webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'> <div class='col-4'><p>Set</p></div><div class='col-4'><p>Value</p></div><div class='col-4'><p>2D</p></div></div >" +
                    "<div class='row' style='" + (sec430Shake == true ? "-webkit-animation: fadeIn 1s infinite alternate;animation: fadeIn 1s infinite alternate;" : "") + "text - align: center; -webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'>" +
                    " <div class='col - 4'> <span >"
                    + set430_0 +
                    "</span ><span style='color: #FFFF00;'>" +
                    set430_1 + "</span></div> <div class='col - 4'> </span><span>" + val430_0 + "</span><span style='color: #FFFF00;'>" + val430_1 + "</span><span>" + val430_2 + "</span></div> <div class='col-4'><span style='color: #FFFF00;'>" + result430 +
                    "</span> </div></div ></div> </div > ";


                //for modern 9:30
                document.getElementById('section-container').innerHTML =
                    document.getElementById('section-container').innerHTML +
                    " <div class='row' style='text-align: center; - webkit - box - pack: justify; -ms - flex - pack: justify;justify - content: space - between;padding:0px;margin-top:8px;margin-bottom:8px;margin-left:0px;margin-right:0px;'>" +
                    "<div class='card' style='min-width: 100%;background-color:#2253A2; margin: 2px 0px;padding: 10px;text - align: center;color:white;'>" +
                    "<div class='row' style='padding-top: 8px;text-align: center; - webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'> <div class='col-4'><p></p></div><div class='col-4'><p>Modern</p></div><div class='col-4'><p>Internet</p></div></div >" +
                    "<div class='row ' style='text - align: center; -webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'>" +
                    " <div class='col - 4' style='margin-top: -20px;'> <span style='font-weight:bold; font-size:16px;' >"
                    + "9:30 AM" +
                    "</span ></div> <div class='col - 4'> </span><span style='color: #FFFF00;'>" + modern930 + "</span></div> <div class='col-4'><span style='color: #FFFF00;'>" + internet930 +
                    "</span> </div></div ></div> </div > ";

                //for modern 2:00
                document.getElementById('section-container').innerHTML =
                    document.getElementById('section-container').innerHTML +
                    " <div class='row' style='text-align: center; - webkit - box - pack: justify; -ms - flex - pack: justify;justify - content: space - between;padding:0px;margin-top:8px;margin-bottom:8px;margin-left:0px;margin-right:0px;'>" +
                    "<div class='card' style='min-width: 100%;background-color:#2253A2; margin: 2px 0px;padding: 10px;text - align: center;color:white;'>" +
                    "<div class='row' style='padding-top: 8px;text-align: center; - webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'> <div class='col-4'><p></p></div><div class='col-4'><p>Modern</p></div><div class='col-4'><p>Internet</p></div></div >" +
                    "<div class='row' style='text - align: center; -webkit - box - pack: justify;-ms - flex - pack: justify;justify - content: space - between;'>" +
                    " <div class='col - 4' style='margin-top: -20px;'> <span style='font-weight:bold; font-size:16px;'>"
                    + "2:00 PM" +
                    "</span ></div> <div class='col - 4'> </span><span style='color: #FFFF00;'>" + modern200 + "</span></div> <div class='col-4'><span style='color: #FFFF00;'>" + internet200 +
                    "</span> </div></div ></div> </div > ";

            }





        }

    });

}

