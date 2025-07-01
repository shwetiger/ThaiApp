
async function getLiveData() {
    Parse.serverURL = 'https://thai2d3d.b4a.io';
    Parse.keyLiveQueryUrl = 'wss://thai2d3d.b4a.io';
    Parse.initialize('dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ', 'G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx');
    var client = new Parse.LiveQueryClient({
        applicationId: 'dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ',
        serverURL: 'wss://thai2d3d.b4a.io',
        javascriptKey: 'G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx'
    });  

    client.open();

    var query = new Parse.Query('TwoDLiveResult');

    var datas = await query.get("xNiYjJixOZ");

    var queryResult2D = new Parse.Query('Result2D');
    var twodSectionDatas = await queryResult2D.get("xJyLLYFAPX");
 

    if (datas != '' && datas != null && datas != undefined) {

        document.getElementById('result').innerHTML = datas.get('result');

        var date = new Date(datas.get('lastUpdateDate').toString());
        var dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        var timeStr = date.toLocaleTimeString();
        var updatedTime = "Updated: " + dateStr + " " + timeStr;

        var showAnimation = false;

        var sectionDatas = datas.get('data');
        if (sectionDatas != null && sectionDatas != "") {

            document.getElementById('section-container').innerHTML = '<div id="section-container" class="container"> </div>';
            var sectionList = JSON.parse(sectionDatas);
            //console.log("section"+JSON.parse(sectionDatas))
            // var sectionList=[{"section":"10:30 AM","set":"1,580.09","value":"22,125.33","result":"95","isManual":false,"isDone":true,"from":"09:30:00","to":"10:30:00","toDisplay":"10:30:00","fromDateTime":"2022-06-27T09:30:00","toDateTime":"2022-06-27T10:30:00","toDisplayDateTime":"2022-06-27T10:30:00"},
            // {"section":"12:01 PM","set":"1,577.19","value":"33,906.32","result":"96","isManual":true,"isDone":true,"from":"11:00:00","to":"12:01:00","toDisplay":"12:01:00","fromDateTime":"2022-06-27T11:00:00","toDateTime":"2022-06-27T12:01:00","toDisplayDateTime":"2022-06-27T12:01:00"},
            // {"section":"02:30 PM","set":"--","value":"--","result":"--","isManual":false,"isDone":false,"from":"13:30:00","to":"14:30:00","toDisplay":"14:30:00","fromDateTime":"2022-06-27T13:30:00","toDateTime":"2022-06-27T14:30:00","toDisplayDateTime":"2022-06-27T14:30:00"},
            // {"section":"04:30 PM","set":"--","value":"--","result":"--","isManual":false,"isDone":false,"from":"15:00:00","to":"16:30:00","toDisplay":"16:30:00","fromDateTime":"2022-06-27T15:00:00","toDateTime":"2022-06-27T16:30:00","toDisplayDateTime":"2022-06-27T16:30:00"}];

            for (let i = 0; i < sectionList.length; i++) {
                var item = sectionList[i];
                var from = new Date(item.fromDateTime);
                var to = new Date(item.toDateTime);
                var now = new Date();

                //old
                // if ((from.getTime() < now.getTime() && to.getTime() > now.getTime() && !item.isDone) ||
                //     (from.getTime() == now.getTime() && !item.isDone) ||
                //     (to.getTime() == now.getTime() && !item.isDone)) {
                //     showAnimation = true;
                //     break;
                // }
                if ((from.getTime() < now.getTime() && to.getTime() > now.getTime() && (item.section != "12:01 PM" && !item.isDone)) ||
                (from.getTime() < now.getTime() && to.getTime() > now.getTime() && (item.section == "12:01 PM" && !item.isManual)) || 
                (from.getTime() == now.getTime() && !item.isDone) ||
                (to.getTime() == now.getTime() && (item.section != "12:01 PM" && !item.isDone)) ||
                (to.getTime() <= now.getTime() && (item.section == "12:01 PM" && !item.isManual))
                ) {
                showAnimation = true;
                break;
                }
                else {
                    showAnimation = false;
                }
            }

            if (showAnimation == false) {
                document.getElementById('result').className = 'resultStyle';
            }
            else {
                document.getElementById('result').className = 'resultStyleAnimate';
            }
            document.getElementById('lastUpdateDate').innerHTML =
                (showAnimation == false ? "<ion-icon name='checkmark-outline' style='font-size: 18px; margin-right: 4px; color: green; position: relative; top: 3px;'></ion-icon>" : "<ion-icon name='reload-outline' style='font-size: 18px; margin-right: 4px;'></ion-icon>")
                + '<span style="font-style: italic;">' + updatedTime + '</span>';

            sectionList.forEach((item, index) => {

                var section = item.section;
                var set0 = '--';
                var set1 = '';

                if (item.set != "--" && item.set != null && item.set != '') {
                    set0 = item.set.substr(0, item.set.length - 1);

                    set1 = item.set.substr(item.set.length - 1, item.set.length);

                }

                var val0 = '--';
                var val1 = '';
                var val2 = '';
                var result = '--';
                if (item.value != "--" && item.value != null && item.value != '') {
                    val0 = item.value.substr(0, item.value.length - 4);
                    val1 = item.value.substr(item.value.length - 4, 1);
                    val2 = item.value.substr(item.value.length - 3, item.value.length);
                }
                if(item.isDone == true ){
                    result = item.result;
                }
                else{
                    result = "--";

                }
               
                var now = new Date();
                // var isShake = (new Date(item.fromDateTime).getTime() < now.getTime() &&
                //     new Date(item.toDateTime).getTime() > now.getTime() && !item.isDone) ||
                //     (new Date(item.fromDateTime).getTime() == now.getTime() && !item.isDone) ||
                //     (new Date(item.toDateTime).getTime() == now.getTime() && !item.isDone);

                //old
                // var isShake = (new Date(item.fromDateTime).getTime() < now.getTime() &&
                // new Date(item.toDateTime).getTime() > now.getTime() && (item.section == "12:01 PM" && !item.isManual)) ||
                // (new Date(item.fromDateTime).getTime() < now.getTime() &&
                // new Date(item.toDateTime).getTime() > now.getTime() && (item.section != "12:01 PM" && !item.isDone)) ||
                // (new Date(item.fromDateTime).getTime() == now.getTime() && !item.isDone) ||
                // (new Date(item.toDateTime).getTime() == now.getTime() && !item.isDone);

                var isShake = (new Date(item.fromDateTime).getTime() < now.getTime() &&
                new Date(item.toDateTime).getTime() > now.getTime() && (item.section == "12:01 PM" && !item.isManual)) ||
                (new Date(item.fromDateTime).getTime() < now.getTime() &&
                new Date(item.toDateTime).getTime() > now.getTime() && (item.section != "12:01 PM" && !item.isDone)) ||
                (new Date(item.fromDateTime).getTime() == now.getTime() && !item.isDone) ||
                (new Date(item.toDateTime).getTime() == now.getTime() && (item.section != "12:01 PM" && !item.isDone)) || 
                (new Date(item.toDateTime).getTime() <= now.getTime() && (item.section == "12:01 PM" && !item.isManual));

                document.getElementById('section-container').innerHTML = `${document.getElementById('section-container').innerHTML}
                        <div class='row section-inner'>
                            <a href='${((item.section == "12:01 PM" && item.isDone == true && item.isManual == true) || (item.section != "12:01 PM" && item.isDone == true)) ? `/twod-history/${section}` : 'javascript:'}' style = 'width: 100%; text-decoration: none; color: white;'>
                            <div class='container'>
                                <div class='row ${index != 0?"driver mx-1 pt-1":"mx-1 pt-1" }'></div>
                                <div class='row d-flex justify-content-center ${index != 0?"pt-1":"" }'> ${section} </div>
                                <div class='row' style='padding-top: 8px; text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'> 
                                    <div class='col-4'><p style='color: silver;'>Set</p></div>
                                    <div class='col-4'><p style='color: silver;'>Value</p></div>
                                    <div class='col-3'><p style='color: silver;'>2D</p></div>
                                    <div class='col-1'></div>
                                </div >
                                <div class='row ${isShake ? 'annimate' : 'no-annimate'}'>
                                <div class='col-4'> <span>${set0}</span ><span style='color: #ffff00;'>${set1}</span></div> 
                                <div class='col-4'><span>${val0}</span><span style='color: #ffff00;'>${val1}</span><span>${val2}</span></div> 
                                <div class='col-3'><span style='color: #ffff00;'>${isShake == true?"--": result}</span> </div> 
                                <div class='col-1'>${(((item.section == "12:01 PM" && item.isDone == true && item.isManual == true) || (item.section != "12:01 PM" && item.isDone == true)) ? "<ion-icon name='chevron-forward-outline' style='font-size:15px;'></ion-icon>" : "")}</div>
                                </div>
                                <div class='row ${index == sectionList.length-1 ?"pb-1":"" }'></div>
                                
                            </div>
                            </a>
                        </div>`;

                // document.getElementById('section-container').innerHTML = document.getElementById('section-container').innerHTML +
                // "<div class='row' style='text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between; padding: 0px; margin-top: 2px; margin-bottom: 2px; margin-left: 0px; margin-right: 0px;'>" +
                // "<a " + (item.isDone == true ? "href='/twod-history/" + section + "'" : "") +
                // "style = 'width: 100%; text-decoration: none; color: white;'> <div style='" + (index != sectionList.length-1 ? "border-bottom: 1px solid silver;" : "") + "margin: 0px 15px; padding: 10px; text-align: center;'><div style='text-align: center; color: white; font-weight: bold; padding-bottom: 8px;'>" +
                // section +
                // "</div> <div class='row' style='padding-top: 8px; text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'> <div class='col-4'><p style='color: silver;'>Set</p></div><div class='col-4'><p style='color: silver;'>Value</p></div><div class='col-3'><p style='color: silver;'>2D</p></div><div class='col-1'></div></div >" +
                // "<div class='row' style='" + (isShake == true ? "-webkit-animation: fadeIn 1s infinite alternate; animation: fadeIn 1s infinite alternate;" : "") + "text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'>" +
                // " <div class='col-4'> <span>" + set0 +
                // "</span ><span style='color: #ffff00;'>" +
                // set1 + "</span></div> <div class='col-4'><span>" + val0 + "</span><span style='color: #ffff00;'>" + val1 + "</span><span>" + val2 + "</span></div> <div class='col-3'><span style='color: #ffff00;'>" + result +
                // "</span> </div> <div class='col-1'>" +
                // (item.isDone == false ? "" : "<ion-icon name='chevron-forward-outline' style='font-size:15px;'></ion-icon>") +
                // "</div></div></div></a></div>";

            });


        }

        if (twodSectionDatas != '' && twodSectionDatas != null && twodSectionDatas != undefined) {
            var internet930 = twodSectionDatas.get('internet_930') == "" ? "--" : twodSectionDatas.get('internet_930');
            var modern930 = twodSectionDatas.get('modern_930') == "" ? "--" : twodSectionDatas.get('modern_930');
            var internet200 = twodSectionDatas.get('internet_200') == "" ? "--" : twodSectionDatas.get('internet_200');
            var modern200 = twodSectionDatas.get('modern_200') == "" ? "--" : twodSectionDatas.get('modern_200');
           
            document.getElementById('modern-container').innerHTML = `${document.getElementById('modern-container').innerHTML}
                <div class="row header-row" style="margin: 10px 20px !important;">
                    <div class="col-3"></div>
                    <div class="col-5 text-center text-white">Modern</div>
                    <div class="col-4 text-center text-white">Internet</div>
                </div>
                <div class="row modern-1" style="margin: 10px 20px !important;">
                    <div class="col-3 text-white">9:30 AM</div>
                    <div class="col-5 text-center text-white">${modern930}</div>
                    <div class="col-4 text-center" style="color: #ffff00;">${internet930}</div>
                </div>
                <div style="border-bottom: 1px solid silver;margin: 2px 20px !important;" ></div>
                <div class="row modern-2" style="margin: 10px 20px !important;">
                    <div class="col-3 text-white">2:00 PM</div>
                    <div class="col-5 text-center text-white">${modern200}</div>
                    <div class="col-4 text-center" style="color: #ffff00;">${internet200}</div>
                </div>`;

        }  
    }

    var subscription = client.subscribe(query);

    subscription.on('open', result => {
        /// console.log("OPENED"+JSON.stringify(result));
    });


    subscription.on('update', result => {
        // console.log("UPDATED" + result);
        var page = document.getElementById('livePage');

        // console.log("Page: " + page);
        if (page != null) {
            var datas = result;          

            if (datas != '' && datas != null && datas != undefined) {

                document.getElementById('result').innerHTML = datas.get('result');

                var date = new Date(datas.get('lastUpdateDate').toString());
                var dateStr = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
                var timeStr = date.toLocaleTimeString();
                var updatedTime = "Updated: " + dateStr + " " + timeStr;



                var showAnimation = false;

                var sectionDatas = datas.get('data');
                if (sectionDatas != null && sectionDatas != "") {
                    document.getElementById('section-container').innerHTML = '<div id="section-container" class="container"> </div>';
                    var sectionList = JSON.parse(sectionDatas);
                    //console.log(sectionList)
                    // var sectionList=[{"section":"10:30 AM","set":"1,580.09","value":"22,125.33","result":"95","isManual":false,"isDone":true,"from":"09:30:00","to":"10:30:00","toDisplay":"10:30:00","fromDateTime":"2022-06-27T09:30:00","toDateTime":"2022-06-27T10:30:00","toDisplayDateTime":"2022-06-27T10:30:00"},
                    // {"section":"12:01 PM","set":"1,577.19","value":"33,906.32","result":"96","isManual":true,"isDone":true,"from":"11:00:00","to":"12:01:00","toDisplay":"12:01:00","fromDateTime":"2022-06-27T11:00:00","toDateTime":"2022-06-27T12:01:00","toDisplayDateTime":"2022-06-27T12:01:00"},
                    // {"section":"02:30 PM","set":"--","value":"--","result":"--","isManual":false,"isDone":false,"from":"13:30:00","to":"14:30:00","toDisplay":"14:30:00","fromDateTime":"2022-06-27T13:30:00","toDateTime":"2022-06-27T14:30:00","toDisplayDateTime":"2022-06-27T14:30:00"},
                    // {"section":"04:30 PM","set":"--","value":"--","result":"--","isManual":false,"isDone":false,"from":"15:00:00","to":"16:30:00","toDisplay":"16:30:00","fromDateTime":"2022-06-27T15:00:00","toDateTime":"2022-06-27T16:30:00","toDisplayDateTime":"2022-06-27T16:30:00"}];

                    for (let i = 0; i < sectionList.length; i++) {
                        var item = sectionList[i];
                        var from = new Date(item.fromDateTime);
                        var to = new Date(item.toDateTime);
                        var now = new Date();
                        //old
                        // if ((from.getTime() < now.getTime() && to.getTime() > now.getTime() && !item.isDone) ||
                        //     (from.getTime() == now.getTime() && !item.isDone) ||
                        //     (to.getTime() == now.getTime() && !item.isDone)) {
                        //     showAnimation = true;
                        //     break;
                        // }

                        if ((from.getTime() < now.getTime() && to.getTime() > now.getTime() && (item.section != "12:01 PM" && !item.isDone)) ||
                        (from.getTime() < now.getTime() && to.getTime() > now.getTime() && (item.section == "12:01 PM" && !item.isManual)) || 
                        (from.getTime() == now.getTime() && !item.isDone) ||
                        (to.getTime() == now.getTime() && (item.section != "12:01 PM" && !item.isDone)) ||
                        (to.getTime() <= now.getTime() && (item.section == "12:01 PM" && !item.isManual))
                        ) {
                            showAnimation = true;
                            break;
                        }
                        else {
                            showAnimation = false;
                        }
                    }

                    if (showAnimation == false) {

                        document.getElementById('result').className = 'resultStyle';
                    }
                    else {
                        document.getElementById('result').className = 'resultStyleAnimate';
                    }

                    document.getElementById('lastUpdateDate').innerHTML =
                        (showAnimation == false ? "<ion-icon name='checkmark-outline' style='font-size: 18px; margin-right: 4px; color: green; position: relative; top: 3px;'></ion-icon>" : "<ion-icon name='reload-outline' style='font-size: 18px; margin-right: 4px; position: relative; top: 5px;'></ion-icon>")
                        + '<span style="font-style: italic;">' + updatedTime + '</span>';

                    sectionList.forEach((item, index) => {

                        var section = item.section;
                        var set0 = '--';
                        var set1 = '';

                        if (item.set != "--" && item.set != null && item.set != '') {
                            set0 = item.set.substr(0, item.set.length - 1);

                            set1 = item.set.substr(item.set.length - 1, item.set.length);

                        }

                        var val0 = '--';
                        var val1 = '';
                        var val2 = '';
                        var result = '--';
                        if (item.value != "--" && item.value != null && item.value != '') {
                            val0 = item.value.substr(0, item.value.length - 4);
                            val1 = item.value.substr(item.value.length - 4, 1);
                            val2 = item.value.substr(item.value.length - 3, item.value.length);
                        }
                        result = item.result;

                        var now = new Date();
                        // var isShake = (new Date(item.fromDateTime).getTime() < now.getTime() &&
                        //     new Date(item.toDateTime).getTime() > now.getTime() && !item.isDone) ||
                        //     (new Date(item.fromDateTime).getTime() == now.getTime() && !item.isDone) ||
                        //     (new Date(item.toDateTime).getTime() == now.getTime() && !item.isDone);

                        //old
                        // var isShake = (new Date(item.fromDateTime).getTime() < now.getTime() &&
                        // new Date(item.toDateTime).getTime() > now.getTime() && (item.section == "12:01 PM" && !item.isManual)) ||
                        // (new Date(item.fromDateTime).getTime() < now.getTime() &&
                        // new Date(item.toDateTime).getTime() > now.getTime() && (item.section != "12:01 PM" && !item.isDone)) ||
                        // (new Date(item.fromDateTime).getTime() == now.getTime() && !item.isDone) ||
                        // (new Date(item.toDateTime).getTime() == now.getTime() && !item.isDone);
                        

                        var isShake = (new Date(item.fromDateTime).getTime() < now.getTime() &&
                        new Date(item.toDateTime).getTime() > now.getTime() && (item.section == "12:01 PM" && !item.isManual)) ||
                        (new Date(item.fromDateTime).getTime() < now.getTime() &&
                        new Date(item.toDateTime).getTime() > now.getTime() && (item.section != "12:01 PM" && !item.isDone)) ||
                        (new Date(item.fromDateTime).getTime() == now.getTime() && !item.isDone) ||
                        (new Date(item.toDateTime).getTime() == now.getTime() && (item.section != "12:01 PM" && !item.isDone)) || 
                        (new Date(item.toDateTime).getTime() <= now.getTime() && (item.section == "12:01 PM" && !item.isManual));

                        document.getElementById('section-container').innerHTML = `${document.getElementById('section-container').innerHTML}
                        <div class='row section-inner'>
                            <a href='${((item.section == "12:01 PM" && item.isDone == true && item.isManual == true) || (item.section != "12:01 PM" && item.isDone == true)) ? `/twod-history/${section}` : 'javascript:'}' style = 'width: 100%; text-decoration: none; color: white;'>
                            <div class='container'>
                                <div class='row ${index != 0?"driver mx-1 pt-1":"mx-1 pt-1" }'></div>
                                <div class='row d-flex justify-content-center ${index != 0?"pt-1":"" }'> ${section} </div>
                                <div class='row' style='padding-top: 8px; text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'> 
                                    <div class='col-4'><p style='color: silver;'>Set</p></div>
                                    <div class='col-4'><p style='color: silver;'>Value</p></div>
                                    <div class='col-3'><p style='color: silver;'>2D</p></div>
                                    <div class='col-1'></div>
                                </div >
                                <div class='row ${isShake ? 'annimate' : 'no-annimate'}'>
                                <div class='col-4'> <span>${set0}</span ><span style='color: #ffff00;'>${set1}</span></div> 
                                <div class='col-4'><span>${val0}</span><span style='color: #ffff00;'>${val1}</span><span>${val2}</span></div> 
                                <div class='col-3'><span style='color: #ffff00;'>${isShake == true?"--": result}</span> </div> 
                                <div class='col-1'>${(((item.section == "12:01 PM" && item.isDone == true && item.isManual == true) || (item.section != "12:01 PM" && item.isDone == true)) ? "<ion-icon name='chevron-forward-outline' style='font-size:15px;'></ion-icon>" : "")}</div>
                                </div>
                                <div class='row ${index == sectionList.length-1 ?"pb-1":"" }'></div>
                                
                            </div>
                            </a>
                        </div>`;
                        
                        // document.getElementById('section-container').innerHTML = document.getElementById('section-container').innerHTML +
                        // "<div class='row' style='text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between; padding:0px; margin-top: 8px; margin-bottom: 8px; margin-left :0px ;margin-right: 0px;'>" +
                        // "<a " + (((item.section == "12:01 PM" && item.isDone == true && item.isManual == true) || (item.section != "12:01 PM" && item.isDone == true)) ? "href='/twod-history/" + section + "'" : "") +
                        // "style = 'width: 100%; text-decoration: none; color: white; '> " + "<div style='" + (index != sectionList.length-1 ? "border-bottom: 1px solid silver;" : "") + "margin: 0 15px; padding: 10px; text-align: center;'><div style='text-align: center; color: white; font-weight: bold; padding-bottom: 8px;'>" +
                        // section +
                        // "</div> <div class='row' style='padding-top: 8px; text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'> <div class='col-4'><p style='color: silver;'>Set</p></div><div class='col-4'><p style='color: silver;'>Value</p></div><div class='col-3'><p style='color: silver;'>2D</p></div><div class='col-1'></div></div >" +
                        // "<div class='row' style='" + (isShake == true ? "-webkit-animation: fadeIn 1s infinite alternate; animation: fadeIn 1s infinite alternate;" : "") + "text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'>" +
                        // " <div class='col-4'> <span>"
                        // + set0 +
                        // "</span><span style='color: #ffff00;'>" +
                        // set1 + "</span></div> <div class='col-4'> <span>" + val0 + "</span><span style='color: #ffff00;'>" + val1 + "</span><span>" + val2 + "</span></div> <div class='col-3'><span style='color: #ffff00;'>" + (isShake == true?"--": result) +
                        // "</span> </div> <div class='col-1'>" +
                        // (item.isDone == false ? "" : "<ion-icon name='chevron-forward-outline' style='font-size:15px;'></ion-icon>") +
                        // "</div></div></div></a></div>";

                            // document.getElementById('section-container').innerHTML = document.getElementById('section-container').innerHTML +
                            // "<div class='row' style='text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between; padding:0px; margin-top: 8px; margin-bottom: 8px; margin-left :0px ;margin-right: 0px;'>" +
                            // "<a " + (((item.section == "12:01 PM" && item.isDone == true && item.isManual == true) || (item.section != "12:01 PM" && item.isDone == true)) ? "href='/twod-history/" + section + "'" : "") +
                            // "style = 'width: 100%; text-decoration: none; color: white; '> " + "<div style='" + (index != sectionList.length-1 ? "border-bottom: 1px solid silver;" : "") + "margin: 0 15px; padding: 10px; text-align: center;'><div style='text-align: center; color: white; font-weight: bold; padding-bottom: 8px;'>" +
                            // section +
                            // "</div> <div class='row' style='padding-top: 8px; text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'> <div class='col-4'><p style='color: silver;'>Set</p></div><div class='col-4'><p style='color: silver;'>Value</p></div><div class='col-3'><p style='color: silver;'>2D</p></div><div class='col-1'></div></div >" +
                            // "<div class='row' style='" + (isShake == true ? "-webkit-animation: fadeIn 1s infinite alternate; animation: fadeIn 1s infinite alternate;" : "") + "text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'>" +
                            // " <div class='col-4'> <span>"
                            // + set0 +
                            // "</span><span style='color: #ffff00;'>" +
                            // set1 + "</span></div> <div class='col-4'> <span>" + val0 + "</span><span style='color: #ffff00;'>" + val1 + "</span><span>" + val2 + "</span></div> <div class='col-3'><span style='color: #ffff00;'>" + (isShake == true?"--": result) +
                            // "</span> </div> <div class='col-1'>" +
                            // (item.isDone == false ? "" : "<ion-icon name='chevron-forward-outline' style='font-size:15px;'></ion-icon>") +
                            // "</div></div></div></a></div>";
                          
                        // document.getElementById('section-container').innerHTML = document.getElementById('section-container').innerHTML +
                        // "<div class='row' style='text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between; padding:0px; margin-top: 8px; margin-bottom: 8px; margin-left :0px ;margin-right: 0px;'>" +
                        // "<a " + (item.isDone == true ? "href='/twod-history/" + section + "'" : "") +
                        // "style = 'width: 100%; text-decoration: none; color: white; '> " + "<div style='" + (index != sectionList.length-1 ? "border-bottom: 1px solid silver;" : "") + "margin: 0 15px; padding: 10px; text-align: center;'><div style='text-align: center; color: white; font-weight: bold; padding-bottom: 8px;'>" +
                        // section +
                        // "</div> <div class='row' style='padding-top: 8px; text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'> <div class='col-4'><p style='color: silver;'>Set</p></div><div class='col-4'><p style='color: silver;'>Value</p></div><div class='col-3'><p style='color: silver;'>2D</p></div><div class='col-1'></div></div >" +
                        // "<div class='row' style='" + (isShake == true ? "-webkit-animation: fadeIn 1s infinite alternate; animation: fadeIn 1s infinite alternate;" : "") + "text-align: center; -webkit-box-pack: justify; -ms-flex-pack: justify; justify-content: space-between;'>" +
                        // " <div class='col-4'> <span>"
                        // + set0 +
                        // "</span><span style='color: #ffff00;'>" +
                        // set1 + "</span></div> <div class='col-4'> <span>" + val0 + "</span><span style='color: #ffff00;'>" + val1 + "</span><span>" + val2 + "</span></div> <div class='col-3'><span style='color: #ffff00;'>" + (isShake == true?"--": result) +
                        // "</span> </div> <div class='col-1'>" +
                        // (item.isDone == false ? "" : "<ion-icon name='chevron-forward-outline' style='font-size:15px;'></ion-icon>") +
                        // "</div></div></div></a></div>";
                       
                    });

                }
            }
        }

    });

}

