const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env.token;

var doc;

// Google Sheets api initialization
const { google } = require("googleapis");

const spreadsheetId = "1WqogbXoOThLkt2kL3QJbFGT3Kc_x_XwwmK2FCJdrnvQ"; 
const APIKey = 'AIzaSyAEtB4JC7MOXojFuLvL0PqT7NrCM34M3r0';

const sheets = google.sheets({version: "v4", auth: APIKey});
sheets.spreadsheets.get({ spreadsheetId: spreadsheetId }, (err, res) => {
  if (err) {
    console.error(err);
    return;
  }
    sheets.spreadsheets.values.batchGet(
    {
      spreadsheetId: spreadsheetId,
      ranges: ['Republic Minis', 'Dominion Minis', 'Empire Minis']
      //ranges: res.data.sheets.map(e => e.properties.title)
    },
    (err, res) => {
      if (err) {
        console.error(err);
        return;
      }

      doc = JSON.stringify(res.data);
      //console.log(doc);

    }
    
  );
});






var lastUpdate = "2020/07/30";
var prefix = "!mg";


// Discord Bot part
client.login(token);
client.on("ready", () => {
    console.log("ready");
    client.user.setActivity("coded by Insanit");
});

client.on("message", (message) => {
    // if bot command prefix is in front
    if (message.content.startsWith(prefix)){
        var command = message.content.slice(prefix.length+1);
        if(command.match("hi")){
            message.channel.send("hello");
        }
        // lookup minis
        else if (command.startsWith("lookup")){
          var miniLvl = command.replace( /^\D+/g, '');
          var miniName = command.slice(7).toLowerCase().replace(/[0-9]/g, '').replace(/\s+$/, '');;
          
          //message.channel.send("mini name: "+miniName);

          async function gsrun(cl){
            const opt = {
              spreadsheetId: spreadsheetId,
              range: 'Republic Minis'
            };
          
            let repData = await sheets.spreadsheets.values.get(opt);
            let repDataArray = repData.data.values;

            opt.range = 'Dominion Minis';
            let domData = await sheets.spreadsheets.values.get(opt);
            let domDataArray = domData.data.values;

            opt.range = 'Empire Minis';
            let empData = await sheets.spreadsheets.values.get(opt);
            let empDataArray = empData.data.values;

            var miniArray = [repDataArray, domDataArray, empDataArray];
            //console.log(repDataArray[1][5]);
            
            // find mini
            var found = false;
            var lvlError = false;
            for(var j = 0; j < 3; j++){
              for(var i = 0; i < miniArray[j].length; i++){
                if(miniArray[j][i][0].toLowerCase() === miniName){
                  //check if level too high
                  if(miniLvl > miniArray[j][i][4] || miniLvl < 1){
                    lvlError = true;
                    break;
                  }
                  //set found to true
                  found = true;
                  //create embed
                  const miniDataEmbed = new Discord.MessageEmbed()

                  // change based on mini
                  var type = miniArray[j][i][1];
                  var ap = miniArray[j][i][8];
                  var ms = miniArray[j][i][10];
                  var rs = miniArray[j][i][11];
                  
                  // hardcoded mini values for missing spreadsheet values
                  if(miniArray[j][i][0] === "Salamander Bike"){
                    ms = "10 km/h";
                    rs = "72 km/h";
                  } else if (miniArray[j][i][0] === "Avenger") {
                    type = "Truck";
                    ms = "54 km/h";
                    rs = "---";
                  } else if (miniArray[j][i][0] === "Laser Tank" || miniArray[j][i][0] === "Command Tank") {
                    ap = '8';
                  }
                  miniDataEmbed.addFields(
                    {name: 'AP cost: ', value: ap, inline: true},
                    {name: 'Type: ', value: type, inline: true},
                    {name: 'HP: ', value: (parseInt(miniArray[j][i][21])+(miniArray[j][i][22]*(miniLvl-1))), inline: true},
                    {name: 'Upkeep: ', value: miniArray[j][i][9], inline: true},
                    {name: 'Move Speed: ', value: ms, inline: true},
                    {name: 'Run Speed: ', value: rs, inline: true},
                    {name: '\u200B', value: '\u200B' },
                    
                  );

                  // catch empty cells for target prio
                  for (var k = 0; k < 8; k++){
                    if(miniArray[j][i][44+i] === "")
                      miniArray[j][i][44+i] === "---";
                    if(miniArray[j][i][36+i] === "")
                      miniArray[j][i][36+i] === "---";  
                  }
                  
                  // DMG Type 1
                  if (miniArray[j][i][25] !== "---"){
                      miniDataEmbed.addFields(
                        {name: 'DMG Type 1: ', value: miniArray[j][i][25]+" - "+(parseInt(miniArray[j][i][26])+(miniArray[j][i][27]*(miniLvl-1))) , inline: false},
                        //{name: 'Damage: ', value: (parseInt(miniArray[j][i][26])+(miniArray[j][i][27]*(miniLvl-1))), inline: true},
                        {name: 'Range: ', value: miniArray[j][i][28], inline: true },
                        {name: 'Spread: ', value: miniArray[j][i][29], inline: true },
                        {name: 'Clip Size: ', value: miniArray[j][i][30], inline: true },
                        {name: 'Aim Time: ', value: miniArray[j][i][31], inline: true },
                        {name: 'Fire Time: ', value: miniArray[j][i][32], inline: true }, 
                        {name: 'Reload: ', value: miniArray[j][i][33], inline: true }, 
                        {name: 'Cooldown: ', value: miniArray[j][i][34], inline: true }, 
                        {name: 'Target Prio and DMG modifier', value: ("Infantry:\t "+miniArray[j][i][44]+", "+miniArray[j][i][36]+"\nHeavy Infantry: "+miniArray[j][i][45]+", "+miniArray[j][i][37]+"\nTruck:\t\t\t"+miniArray[j][i][46]+", "+miniArray[j][i][38]+"\nTank:\t\t\t"+miniArray[j][i][47]+", "+miniArray[j][i][39]+"\nHelicopter:\t"+miniArray[j][i][48]+", "+miniArray[j][i][40]+"\nPlane: "+miniArray[j][i][49]+", "+miniArray[j][i][41]+"\nBase: "+miniArray[j][i][50]+", "+miniArray[j][i][42]), inline: false},
                      );
                  }   
                  
                  // DMG Type 2
                  if (miniArray[j][i][52] !== "---"){
                    miniDataEmbed.addFields(
                      {name: 'DMG Type 2: ', value: miniArray[j][i][52]+" - "+(parseInt(miniArray[j][i][53])+(miniArray[j][i][54]*(miniLvl-1))), inline: false},
                      //{name: 'Damage: ', value: (parseInt(miniArray[j][i][53])+(miniArray[j][i][54]*(miniLvl-1))), inline: true},
                      {name: 'Range: ', value: miniArray[j][i][55], inline: true },
                      {name: 'Spread: ', value: miniArray[j][i][56], inline: true },
                      {name: 'Clip Size: ', value: miniArray[j][i][57], inline: true },
                      {name: 'Aim Time: ', value: miniArray[j][i][58], inline: true },
                      {name: 'Fire Time: ', value: miniArray[j][i][59], inline: true }, 
                      {name: 'Reload: ', value: miniArray[j][i][60], inline: true }, 
                      {name: 'Cooldown: ', value: miniArray[j][i][61], inline: true }, 
                      {name: 'Target Prio and DMG modifier', value: ("Infantry:\t "+miniArray[j][i][71]+", "+miniArray[j][i][63]+"\nHeavy Infantry: "+miniArray[j][i][72]+", "+miniArray[j][i][64]+"\nTruck:\t\t\t"+miniArray[j][i][73]+", "+miniArray[j][i][65]+"\nTank:\t\t\t"+miniArray[j][i][74]+", "+miniArray[j][i][66]+"\nHelicopter:\t"+miniArray[j][i][75]+", "+miniArray[j][i][67]+"\nPlane: "+miniArray[j][i][76]+", "+miniArray[j][i][68]+"\nBase: "+miniArray[j][i][77]+", "+miniArray[j][i][69]), inline: false},
                    );
                }   
                  // change based on faction
                  if(j === 0){
                    miniDataEmbed.setColor('#2A9DF4');
                    miniDataEmbed.setTitle('Republic '+miniArray[j][i][0]+" level "+miniLvl);
                  } else if(j === 1){
                    miniDataEmbed.setColor('#F2003C');
                    miniDataEmbed.setTitle('Dominion '+miniArray[j][i][0]+" level "+miniLvl);
                  } else if(j === 2){
                    miniDataEmbed.setColor('#444444');
                    miniDataEmbed.setTitle('Empire '+miniArray[j][i][0]+" level "+miniLvl);
                  } 

                 

                  //console.log(miniArray[j][i][25]+"bruh");
                  message.channel.send({ embed: miniDataEmbed });
                } 
                //message.channel.send("repDataArray[i][0]");
              }
            }

            if(!found){
              message.channel.send("Error: Mini not found. Please check your spelling. If you think this is a bug please dm my creator!");
            }

            if(lvlError) {
              message.channel.send("Error: Impossible mini level. If you think this is a bug please dm my creator!");
            }

          }
          
          gsrun();
        }

        //message.channel.send("command:"+command);
    } 
    
});