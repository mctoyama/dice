//--------------------------------------------------------------------------------
// Copyright 2016 Marcelo Costa Toyama
//
// This file is part of PixelnDice.
//
//    PixelnDice is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    any later version.
//
//    PixelnDice is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with PixelnDice.  If not, see <http://www.gnu.org/licenses/>.
//
//--------------------------------------------------------------------------------

var rpgShell = (function() {

  var STATUS_CODE = {INITIALIZED:1, JOIN:2, PLAYING:3};

  var state = STATUS_CODE.INITIALIZED;

  var ws = {};

  return {

    ///////////////////////////////////////////////////////////////////////
    init: function(url){
      console.log("Connecting wss://"+url);
      ws = new WebSocket("wss://"+url,"diceProtocol");
      ws.onopen = rpgShell.onopen;
      ws.onmessage = rpgShell.onmessage;
      ws.onclose = rpgShell.onclose;
    },
    ///////////////////////////////////////////////////////////////////////
    ready: function(){
      return( state === STATUS_CODE.PLAYING );
    },
    ///////////////////////////////////////////////////////////////////////
    displayMessage:function(msg){

      // playing state
      var tmp = $("#shell-display").html();

      tmp = tmp + msg + "<hr/>";

      $("#shell-display").html(tmp);

      // automatic scroll down
      $("#shell-display").scrollTop($("#shell-display")[0].scrollHeight);
    },
    ///////////////////////////////////////////////////////////////////////
    onopen: function(){

      console.log("open rpgShell");

      var cmd = {FROM: rpgTable.get("accountId"), TO:"SYSTEM", CMD: "INIT", TOKEN:rpgTable.get("token")};

      ws.send(JSON.stringify(cmd));
    },
    ///////////////////////////////////////////////////////////////////////
    onmessage: function(e){

      console.log("message -"+e.data);

      var msg = JSON.parse(e.data);

      if( msg.TO === rpgTable.get("accountId") || msg.TO === "ALL" || msg.TO === "ALL-BUT-ME" ){

        if( state == STATUS_CODE.INITIALIZED ){

          if(msg.CMD === "INITRET" && msg.RET === true){

            state = STATUS_CODE.JOIN;
            var cmd = {FROM: rpgTable.get("accountId"), TO:"SYSTEM", CMD: "JOIN", ROOMID:rpgTable.get("roomId")};
            ws.send(JSON.stringify(cmd));
          }

        }else if( state === STATUS_CODE.JOIN ){

          if( msg.CMD === "JOINRET" ){

            for(var idx=0; idx< msg.PLAYERS.length; ++idx){
              rpgPlayer.add(msg.PLAYERS[idx].NAME,msg.PLAYERS[idx].ACCOUNTID);
            }

            state = STATUS_CODE.PLAYING;

            if( !rpgTable.amIGM() ){
              var cmd = {FROM: rpgTable.get("accountId"), TO:"ALL", CMD: "QUERYMAP"};
              ws.send(JSON.stringify(cmd));
            }

            var currentLocation = window.location;
            var fullPath = "https://"+currentLocation.hostname+"/"+currentLocation.pathname+"/"+currentLocation.search;

            var outMsg = "Share this link to play with your friends! <a href='"+fullPath+"'>"+fullPath+"</a>";

            rpgShell.displayMessage(outMsg);
          }

        }else{

          if(msg.CMD === "TEXT"){

            var outMsg

            if( rpgPlayer.exists(msg.FROM) ){
              outMsg = "<i>"+rpgPlayer.getName(msg.FROM)+" says</i>: "+ msg.MESSAGE + "<hr/>";
            }else{
              outMsg = "<i>"+msg.FROM+" says</i>: "+ msg.MESSAGE + "<hr/>";
            }

            rpgShell.displayMessage(outMsg);

          }else if( msg.CMD === "DICERET"){

            var outMsg = {}
            if( msg.ROLLDICE.toString() !== msg.VALUE.toString() ){
              outMsg = "<i>"+msg.FROM+" is rolling</i>: "+ msg.MESSAGE + " = "+msg.ROLLDICE+" = "+msg.VALUE+"<hr/>";
            }else{
              outMsg = "<i>"+msg.FROM+" is rolling</i>: "+ msg.MESSAGE + " = "+msg.VALUE+"<hr/>";
            }

            rpgShell.displayMessage(outMsg);

          }else if( msg.CMD === "GMDICERET" ){

            var outMsg = {}
            if( msg.ROLLDICE.toString() !== msg.VALUE.toString() ){
              outMsg = "<i>"+msg.FROM+" is rolling <b>only to GM</b></i>: "+ msg.MESSAGE + " = "+msg.ROLLDICE+" = "+msg.VALUE+"<hr/>";
            }else{
              outMsg = "<i>"+msg.FROM+" is rolling <b>only to GM</b></i>: "+ msg.MESSAGE + " = "+msg.VALUE+"<hr/>";
            }

            rpgShell.displayMessage(outMsg);

          }else if( msg.CMD === "NEWPLAYER"){

            rpgPlayer.add(msg.NAME,msg.ACCOUNTID);

          }else if( msg.CMD === "QUERYMAP" ){

            if( rpgTable.amIGM() ){

              var worldJson = rpgWorld.getJSON(rpgTable.get("playersMapId"));

              var cmd = {FROM: rpgTable.get("accountId"), TO:msg.FROM, CMD: "LOADMAP",MAPID:rpgTable.get("playersMapId"), JSON:worldJson, NAME:""};
              ws.send(JSON.stringify(cmd));
            }

          }else if( msg.CMD === "LOADMAP"){

            rpgWorld.setJSON(msg.MAPID,msg.JSON);
            rpgWorld.setMapId(msg.MAPID);
            rpgWorld.load();
            rpgTurn.load();
            rpgTable.set("playersMapId",msg.MAPID);

            if( rpgTable.amIGM() ){
              rpgWorld.setMapId(rpgTable.get("gmMapId"));
            }else{
              rpgWorld.setMapId(rpgTable.get("playersMapId"));
            }

          }else if( msg.CMD === "ADDTOKEN") {

            var token = JSON.parse(msg.TOKEN);

            rpgWorld.addToken(msg.MAPID,token);

            // saves maps if I am the GM
            if( rpgTable.amIGM() ){
              rpgGm.saveMap(msg.MAPID);
            }

          }else if( msg.CMD === "DELETETOKEN" ){

            rpgWorld.deleteToken(msg.MAPID,msg.UUID);

            // saves maps if I am the GM
            if( rpgTable.amIGM() ){
              rpgGm.saveMap(msg.MAPID);
            }

          }else if( msg.CMD === "UPDATETOKEN" ){

            var tk = JSON.parse(msg.JSON);
            rpgWorld.updateToken(msg.MAPID,tk);

            // saves maps if I am the GM
            if( rpgTable.amIGM() && rpgTable.get("accountId") != msg.FROM) {

              rpgGm.saveMap(msg.MAPID);
            }

          }else if( msg.CMD === "UPDATETURN" ){

            var tk = JSON.parse(msg.JSON);
            rpgTurn.add(tk.uuid,tk.imgURI,tk.value,false);

            // saves maps if I am the GM
            if( rpgTable.amIGM() ){
              rpgGm.saveMap(rpgWorld.getMapId());
            }

          }else if( msg.CMD === "REMOVETURN" ){

            rpgTurn.remove(msg.UUID,false);

            // saves maps if I am the GM
            if( rpgTable.amIGM() ){
              rpgGm.saveMap(rpgWorld.getMapId());
            }

          }else if( msg.CMD === "DISPLAYTURN" ){

            if( msg.FLAG )
              rpgTurn.show();
            else
              rpgTurn.hide();

          }else if( msg.CMD === "ASCENDTURN" ){

            rpgTurn.ascend(false);

            // saves maps if I am the GM
            if( rpgTable.amIGM() ){
              rpgGm.saveMap(rpgWorld.getMapId());
            }

          }else if( msg.CMD === "DESCENDTURN" ){

            rpgTurn.descend(false);

            // saves maps if I am the GM
            if( rpgTable.amIGM() ){
              rpgGm.saveMap(rpgWorld.getMapId());
            }

          }else if( msg.CMD === "NEXTTURN" ){

            rpgTurn.next(false);

            // saves maps if I am the GM
            if( rpgTable.amIGM() ){
              rpgGm.saveMap(rpgWorld.getMapId());
            }

          }else{
            console.log("Invalid CMD: "+JSON.stringify(msg));
          }

        }
      }else{
        console.log("Invalid TO field|");
      }

    },
    ///////////////////////////////////////////////////////////////////////
    onclose: function(e){
      console.log("close rpgShell");
    },
    ///////////////////////////////////////////////////////////////////////
    // handles shell input for client
    shellInput: function(ev){

      var key = ev.keyCode;

      // If the user has pressed enter
      if (key == 13) {

        var inputText = $("#shell-input").val();

        var data = {};

        // dice cmd
        var re = /^\s*#/;

        // dice roll to only gm see
        var regm = /^\s*#gm/;

        if( rpgTable.validate(regm.exec(inputText)) ){
          // gm dice roll
          data = {FROM:rpgTable.get("accountId"), TO:rpgTable.get("gmId"), CMD:'GMDICE', MESSAGE:inputText};
        }else if( rpgTable.validate(re.exec(inputText)) ){
          // dice roll
          data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'DICE', MESSAGE:inputText};
        }else{
          // text
          data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'TEXT', MESSAGE:inputText};
        }

        ws.send(JSON.stringify(data));

        $("#shell-input").val(undefined);

        ev.preventDefault();
      }
    },
    ///////////////////////////////////////////////////////////////////////
    loadPlayersMap:function(mapId,name,json){

      data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'LOADMAP', MAPID:mapId, JSON:json, NAME:name};
      ws.send(JSON.stringify(data));
    },
    ///////////////////////////////////////////////////////////////////////
    addToken: function(mapId,token){
      data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'ADDTOKEN', MAPID:mapId, TOKEN:JSON.stringify(token)};
      ws.send(JSON.stringify(data));
    },
    ///////////////////////////////////////////////////////////////////////
    deleteToken: function(mapId,uuid){
      data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'DELETETOKEN', MAPID:mapId, UUID:uuid};
      ws.send(JSON.stringify(data));
    },
    ///////////////////////////////////////////////////////////////////////
    updateToken: function(mapId,json){
      if( rpgTable.get("playersMapId") === rpgWorld.getMapId() ){
        data = {FROM:rpgTable.get("accountId"), TO:"ALL-BUT-ME", CMD:'UPDATETOKEN', MAPID:mapId, JSON:json};
        ws.send(JSON.stringify(data));
      }

      // saves maps if I am the GM
      if( rpgTable.amIGM() ){
        rpgGm.saveMap(mapId);
      }
    },
    ///////////////////////////////////////////////////////////////////////
    updateTurn: function(json){
      data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'UPDATETURN', JSON:json};
      ws.send(JSON.stringify(data));
    },
    ///////////////////////////////////////////////////////////////////////
    removeTurn: function(mapId,uuid){
      data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'REMOVETURN', UUID:uuid};
      ws.send(JSON.stringify(data));
    },
    ///////////////////////////////////////////////////////////////////////
    displayTurn: function(flag){
      data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'DISPLAYTURN', FLAG:flag};
      ws.send(JSON.stringify(data));
    },
    ///////////////////////////////////////////////////////////////////////
    ascendTurn: function(){
      data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'ASCENDTURN'};
      ws.send(JSON.stringify(data));
    },
    ///////////////////////////////////////////////////////////////////////
    descendTurn: function(){
      data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'DESCENDTURN'};
      ws.send(JSON.stringify(data));
    },
    ///////////////////////////////////////////////////////////////////////
    nextTurn: function(){
      data = {FROM:rpgTable.get("accountId"), TO:"ALL", CMD:'NEXTTURN'};
      ws.send(JSON.stringify(data));
    },
    ///////////////////////////////////////////////////////////////////////
  };
}());
///////////////////////////////////////////////////////////////////////
