let request=require("request");
let cheerio=require("cheerio");
let path=require("path");
let fs=require("fs");
//let path=require("path");
//const { table } = require("console");
let mainUrl="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
request(mainUrl,cb);
function cb(error,response,html){
    if(error){
        console.log(error);
    }
    else{
        allMatchUrl(html);
    }
}
function allMatchUrl(html){
    let mainPage=cheerio.load(html);
    let allMatchPage=mainPage(".widget-items.cta-link a").attr("href");
  // for(let k=0;k<allMatchPage.length;k++){ 
    let allIplUrl="https://www.espncricinfo.com"+allMatchPage;
    // console.log(allIplUrl);
    request(allIplUrl,cb);
    function cb(error,response,html){
        if(error){
            console.log(error);
        }else{
            sabLink(html);
        }
    }
   
    function sabLink(html){
      //  console.log(html);
        let allInOne=cheerio.load(html);
        //console.log(allInOne(allInOne).html());
        let allLinks=allInOne(".match-score-block .match-info-link-FIXTURES");
       //console.log(allLinks.length);    
        for(let i=0;i<allLinks.length;i=i+4){
            let halfLink=allInOne(allLinks[i]).attr("href");
          // console.log(halfLink);
            let matchUrl="https://www.espncricinfo.com"+halfLink;
           linkKholo(matchUrl);
        }
    }
    function linkKholo(url){
        //console.log(url);
        request(url,cb);
        function cb(error,response,html){
            if(error){
                console.log(error);
            }else{
                dataBharo(html);
            }
        }
    }
    function dataBharo(html){
        let dhundho=cheerio.load(html);
        let cwd=process.cwd();
        let iplPath=path.join(cwd,"IPL");
        if(fs.existsSync(iplPath)==false){
            fs.mkdirSync(iplPath);
        }
        let teams=dhundho(".name-detail");
        let firstTeamName=dhundho(teams[10]).text();
        let SecondTeamName=dhundho(teams[11]).text();
        //console.log(firstTeamName);
        let firstTeamPath=path.join(iplPath,firstTeamName);
        let SecondTeamPath=path.join(iplPath,SecondTeamName);
        if(fs.existsSync(firstTeamPath)==false){
            fs.mkdirSync(firstTeamPath);
        }
        if(fs.existsSync(SecondTeamPath)==false){
            fs.mkdirSync(SecondTeamPath);
        }
        let tableArr=dhundho(".card.content-block.match-scorecard-table .Collapsible");
        for(let i=0;i<tableArr.length;i++){
            let currTeam =dhundho(tableArr[i]).find(".header-title.label");
            let currTeamName=dhundho(currTeam).text();
            let ct=currTeamName.split("INNINGS"); 
            if(firstTeamName==ct[0].trim()){
                let allRows=dhundho(tableArr[i]).find("tr");
                for(let j=0;j<allRows.length;j++){
                    let playName=dhundho(allRows[j]).find("td");
                    let actPlayName=dhundho(playName[0]).text();
                   // console.log(playName.length);
                    let playPath=path.join(firstTeamPath,actPlayName+".json");
                    let dataToAdd=dhundho(allRows[j]).text();
                    dataToAdd.trim();
                    if(fs.existsSync(playPath)==false){
                        fs.writeFileSync(playPath,"myTeamName\tname\tvenue\tdate\topponent\tresult\t"+dataToAdd);
                    }
                    fs.appendFileSync(playPath,"\n"+dataToAdd);
                }
            }
            else{
                let allRows=dhundho(tableArr[i]).find("tr");
                for(let j=0;j<allRows.length;j++){
                    let playName=dhundho(allRows[j]).find("td");
                    let actPlayName=playName[0];
                    let playPath=path.join(SecondTeamPath,actPlayName+".json");
                    let dataToAdd=dhundho(allRows[j]).text();
                    dataToAdd.trim();
                    if(fs.existsSync(playPath)==false){
                        fs.writeFileSync(playPath,dataToAdd);
                    }
                    fs.appendFileSync(playPath,"\n"+dataToAdd);
                }
            }
        }
    }
}