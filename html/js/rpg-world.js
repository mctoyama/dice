//--------------------------------------------------------------------------------
// Copyright 2015 Marcelo Costa Toyama
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

// map data structes
// world data structures

///////////////////////////////////////////////////////////////////////
// world data structure
var rpgWorld = (function() {

  // basic map world
  // default layer is gmLayer
  // backgroundLayer = 0
  // playerLayer = 1
  // gmLayer = 2
  // {width: 2048, height: 1280, tokenList:{}, selectedLayer: 1};
  var _world = {};

  // _mapId <-> world
  var _mapId = null;

  // selected token obj
  var _selectedToken = {uuid:"", offsetX:0, offsetY:0, lastLeft:0, lastTop:0, lastWidth:0, lastHeight:0};

  // mouse coordinates - in world coordinates
  var _mouse = {lastX:0, lastY:0, x:0, y:0, mouseleftdown: false, mouserightdown: false, mousemiddledown: false, oncanvas: false, cursor:""};

  // events happening
  var _eventType = {moveToken: "moveToken", resizeToken: "resizeToken", clickUp: "clickTokenUpLayer", clickDown: "clickTokenDownLayer", deleteToken: "deleteToken", clickTokenSettings: "clickTokenSettings"};
  var _event = null;

  return {

    ///////////////////////////////////////////////////////////////////////
    // It sets map to display
    setMapId: function(newMapId){
      _mapId = newMapId;
    },
    ///////////////////////////////////////////////////////////////////////
    // returns map id in display
    getMapId: function(){
      return(_mapId);
    },
    ///////////////////////////////////////////////////////////////////////
    // It creates an empty world
    create: function(){
      var ret = {width: 2048, height: 1280, tokenList:{}, selectedLayer: 1};
      ret.tokenList[0] = [];
      ret.tokenList[1] = [];
      ret.tokenList[2] = [];
      return(ret)
    },
    ///////////////////////////////////////////////////////////////////////
    getJSON: function(mapId){
      return( JSON.stringify( _world[mapId] ) );
    },
    ///////////////////////////////////////////////////////////////////////
    setJSON: function(mapId,json){
      _world[mapId] = JSON.parse(json);
    },
    ///////////////////////////////////////////////////////////////////////
    getWidth: function(){
      return( _world[_mapId].width );
    },
    ///////////////////////////////////////////////////////////////////////
    getHeight: function(){
      return( _world[_mapId].height );
    },
    ///////////////////////////////////////////////////////////////////////
    eventTypes: function(){
      return( _eventType );
    },
    ///////////////////////////////////////////////////////////////////////
    getEventType: function(){
      return( _event );
    },
    ///////////////////////////////////////////////////////////////////////
    setEventType: function(ev){

      if( ev === _eventType.moveToken ||
          ev === _eventType.resizeToken ||
          ev === _eventType.clickUp ||
          ev === _eventType.clickDown ||
          ev === _eventType.deleteToken ||
          ev === _eventType.clickTokenSettings
      ){

        _event = ev;

      }else{

        console.log("Invalid event type");
      }
    },
    ///////////////////////////////////////////////////////////////////////
    setSelectedToken: function(uuid){
      _selectedToken.uuid = uuid;
    },
    ///////////////////////////////////////////////////////////////////////
    getSelectedTokenUUID: function(){
      return(_selectedToken.uuid);
    },
    ///////////////////////////////////////////////////////////////////////
    setCursor: function(val){
      _mouse.cursor = val;
    },
    ///////////////////////////////////////////////////////////////////////
    getCursor: function(){
      return(_mouse.cursor);
    },
    ///////////////////////////////////////////////////////////////////////
    // returns an array of mapIds
    maps: function(){
      var keys = []
      for(var k in _world){
        keys.push(k);
      }
      return(keys);
    },
    ///////////////////////////////////////////////////////////////////////
    // sets the world layer
    setLayer: function(layer){

      if( layer >= 0 && layer <= 2) {
        _world[_mapId].selectedLayer = layer;
      }
    },
    ///////////////////////////////////////////////////////////////////////
    // gets the world layer
    getLayer: function(){

      return _world[_mapId].selectedLayer;
    },
    ///////////////////////////////////////////////////////////////////////
    // draw grid
    drawGrid: function(context){

      var width = _world[_mapId].width;
      var height = _world[_mapId].height;

      var w = 0;
      var h = 0;

      context.save();

      while( w < width ){
        context.beginPath();
        context.moveTo(w,0);
        context.lineTo(w,height);
        context.closePath();
        context.stroke();
        w = w + rpgView.getView().gridw;
      }

      while( h < height ){
        context.beginPath();
        context.moveTo(0,h);
        context.lineTo(width,h);
        context.closePath();
        context.stroke();
        h = h + rpgView.getView().gridh;
      }

      context.restore();
    },
    ///////////////////////////////////////////////////////////////////////
    draw: function(context){

      context.save();

      for(var layerIdx=0; layerIdx <= 1; ++layerIdx){

        for( var token=0; token<_world[_mapId].tokenList[layerIdx].length; token++ ){

          var tmp = _world[_mapId].tokenList[layerIdx][token];

          rpgToken.draw(tmp,context);
        }
      }

      context.restore();

      if( rpgTable.amIGM() ) {

        context.save();

        context.globalAlpha = 0.5;

        for( var token=0; token<_world[_mapId].tokenList[2].length; token++ ){

          var tmp = _world[_mapId].tokenList[2][token];

          rpgToken.draw(tmp,context);
        }

        context.globalAlpha = 1.0;

        context.restore();
      }

    },
    ///////////////////////////////////////////////////////////////////////
    // loads world
    load: function(){

      for(layerIdx=0; layerIdx<=2; ++layerIdx){
        for( var token=0; token<_world[_mapId].tokenList[layerIdx].length; token++ ){
          rpgToken.load(_world[_mapId].tokenList[layerIdx][token]);
        }
      }
    },
    ///////////////////////////////////////////////////////////////////////
    click: function(pos){

      var layerIdx = 2;

      if( !rpgTable.amIGM() ){

        layerIdx = 1;
      }

      for(layerIdx; layerIdx >=0; --layerIdx){

        for( var token=_world[_mapId].tokenList[layerIdx].length-1; token>=0; token-- ){

          if( !rpgToken.click(_world[_mapId].tokenList[layerIdx][token],pos) ){ // found event to threat

            var tk = rpgWorld.getTokenByUUID(_selectedToken.uuid);

            if( rpgTable.validate(tk) ){

              _selectedToken.lastLeft = tk.left;
              _selectedToken.lastTop = tk.top;
              _selectedToken.lastWidth = tk.width;
              _selectedToken.lastHeight = tk.height;

              if( _event === _eventType.clickUp ){ // click up

                rpgWorld.upToken();
                return(true);

              }else if( _event === _eventType.clickDown ){ // click down

                rpgWorld.downToken();
                return(true);

              }else if( _event === _eventType.resizeToken ){ // resize Token

                rpgWorld.resizeToken(false);
                return(true);

              }else if( _event === _eventType.moveToken ){ // move token

                _selectedToken.offsetX = pos.x - tk.left;
                _selectedToken.offsetY = pos.y - tk.top;

                rpgWorld.moveToken(false);
                return(true);

              }else if( _event === _eventType.deleteToken ){ // delete token

                rpgShell.deleteToken(_mapId,_selectedToken.uuid)

                return(true);

              }else if( _event === _eventType.clickTokenSettings ){ // token settings

                rpgWorld.displaySettings();
                return(true);
              }

            }

          }
        }
      }

      return false;
    },
    ///////////////////////////////////////////////////////////////////////
    // if hover over token set token display to hover
    hover: function(pos){

      var x = pos.x;
      var y = pos.y;

      var layerIdx = 2;

      if( !rpgTable.amIGM() ){

        layerIdx = 1;
      }

      for( layerIdx; layerIdx >= 0; --layerIdx){

        for( var token=_world[_mapId].tokenList[layerIdx].length-1; token>=0; token-- ){

          var tmp = _world[_mapId].tokenList[layerIdx][token];

          if( rpgToken.hover(tmp,pos) ){
            return true;
          }
        }
      }

      return false;
    },
    ///////////////////////////////////////////////////////////////////////
    cursor: function(pos){

      var x = pos.x;
      var y = pos.y;

      var layerIdx = 2;

      if( !rpgTable.amIGM() ){

        layerIdx = 1;
      }

      for( layerIdx; layerIdx >= 0; --layerIdx){

        for( var token=_world[_mapId].tokenList[layerIdx].length-1; token>=0; token-- ){

          var tmp = _world[_mapId].tokenList[layerIdx][token];

          if( !rpgToken.cursor(tmp,pos) ){
            rpgWorld.setCursor("se-resize");
            return false;
          }
        }
      }

      rpgWorld.setCursor("default");
      return true;
    },
    ///////////////////////////////////////////////////////////////////////
    getTokenByUUID: function(uuid){

      for(var layerIdx=0; layerIdx<=2; ++layerIdx){

        for( var token=0; token<_world[_mapId].tokenList[layerIdx].length; token++ ){

          // get token
          var tmp = _world[_mapId].tokenList[layerIdx][token];

          if( tmp.uuid == uuid )
            return(tmp);
        }
      }

      return(null);
    },
    ///////////////////////////////////////////////////////////////////////
    addToken: function(mapId,tk){

      var width = tk.width;
      var height = tk.height;

      rpgToken.load(tk);

      tk.width = width;
      tk.height = height;

      // insert token
      _world[mapId].tokenList[tk.layer].push(tk);

      rpgView.refresh();
    },
    ///////////////////////////////////////////////////////////////////////
    updateToken: function(mapId,tk){

      var width = tk.width;
      var height = tk.height;

      var oldTK = rpgWorld.getTokenByUUID(tk.uuid);

      if( oldTK.layer !== tk.layer ){

        var idx = 0;

        for(var i=0; i<_world[mapId].tokenList[oldTK.layer].length; ++i){
          if( _world[mapId].tokenList[oldTK.layer][i].uuid === oldTK.uuid ){
            idx = i;
            break;
          }
        }

        _world[mapId].tokenList[oldTK.layer].splice(idx,1);

        rpgToken.load(tk);

        tk.width = width;
        tk.height = height;

        _world[mapId].tokenList[tk.layer].push(tk);

      }else{

        rpgToken.load(tk);

        tk.width = width;
        tk.height = height;

        for(var i=0; i<_world[mapId].tokenList[oldTK.layer].length; ++i){
          if( _world[mapId].tokenList[oldTK.layer][i].uuid === oldTK.uuid ){
            _world[mapId].tokenList[oldTK.layer][i] = tk;
            break;
          }
        }

      }

      rpgView.refresh();
    },
    ///////////////////////////////////////////////////////////////////////
    // mouse move
    // pos.x pos.y
    mouseMove:function(pos){

      // tracking mouse position - in world coordinates
      _mouse.lastX = _mouse.x;
      _mouse.lastY = _mouse.y;

      _mouse.x = pos.x;
      _mouse.y = pos.y;

      // style for hover tokens
      rpgWorld.hover(_mouse);
      rpgWorld.cursor(_mouse);

      if( _event == _eventType.resizeToken ){
        rpgWorld.resizeToken(false);
      }else if( _event == _eventType.moveToken ){
        rpgWorld.moveToken(false);
      }
    },
    ///////////////////////////////////////////////////////////////////////
    // click on event - ev
    mouseDown: function(which,pos){
      switch(which){
        case 1:

          _mouse.mouseleftdown = true;

          rpgWorld.click(pos);

          break;
        case 2:
          _mouse.mousemiddlwdown = true;
          break;
        case 3:
          _mouse.mouserightdown = true;
          break;
      }
    },
    ///////////////////////////////////////////////////////////////////////
    // mouse up event - ev
    mouseUp: function(e){
        switch(e.which){
          case 1:
            _mouse.mouseleftdown = false;

            if( _event == _eventType.moveToken ){
              rpgWorld.moveToken(true);
            }else if( _event == _eventType.resizeToken ){
              rpgWorld.resizeToken(true);
            }

            _event = null;
            _selectedToken.uuid = "";

            break;
          case 2:
            _mouse.mousemiddlwdown = false;
            break;
          case 3:
            _mouse.mouserightdown = false;
            break;
        }
    },
    ///////////////////////////////////////////////////////////////////////
    mouseLeave: function(){
      // setting on canvas
      _mouse.oncanvas = false;

      if( _event == _eventType.moveToken ){
        rpgWorld.moveToken(true);
      }else if( _event == _eventType.resizeToken ){
        rpgWorld.resizeToken(true);
      }

      _event = null;
      _selectedToken.uuid = "";

      _mouse.mouseleftdown = false;
      _mouse.mouserightdown = false;
      _mouse.mousemiddledown = false;
    },
    ///////////////////////////////////////////////////////////////////////
    // sends new token location for all participants
    // force == true forces update
    moveToken: function(force){

      if( rpgTable.validate(_selectedToken.uuid) ) {

        var tk = rpgWorld.getTokenByUUID(_selectedToken.uuid);

        tk.left = _mouse.x - _selectedToken.offsetX;
        tk.top = _mouse.y - _selectedToken.offsetY;

        if( force === true || (Math.abs(_selectedToken.lastLeft - tk.left) > 1) || (Math.abs(_selectedToken.lastTop - tk.top) > 1) ){
          _selectedToken.lastLeft = tk.left;
          _selectedToken.lastTop = tk.top;
          rpgShell.updateToken(_mapId,JSON.stringify(tk));
        }
      }
    },
    ///////////////////////////////////////////////////////////////////////
    resizeToken: function(force){

      if( rpgTable.validate(_selectedToken.uuid) ){

        var tk = rpgWorld.getTokenByUUID(_selectedToken.uuid);

        if( rpgTable.validate(tk) ){

          tk.width = _mouse.x - tk.left;
          tk.height = _mouse.y - tk.top;

          if( force === true || (Math.abs(_selectedToken.lastWidth - tk.width) > 1) || (Math.abs(_selectedToken.lastHeight - tk.height) > 1) ){
            _selectedToken.lastWidth = tk.width;
            _selectedToken.lastHeight = tk.height;
            rpgShell.updateToken(_mapId,JSON.stringify(tk));
          }
        }
      }
    },
    ///////////////////////////////////////////////////////////////////////
    // move the token up one layer
    upToken: function(){

      if( rpgTable.validate(_selectedToken.uuid) ) {

        var tk = rpgWorld.getTokenByUUID(_selectedToken.uuid);

        if( tk.layer < 2 ){

          var idx = 0;

          for(var i=0; i<_world[_mapId].tokenList[tk.layer].length; ++i){
            if( _world[_mapId].tokenList[tk.layer][i].uuid == tk.uuid ){
              idx = i;
              break;
            }
          }

          _world[_mapId].tokenList[tk.layer].splice(idx,1);

          tk.layer = tk.layer+1;

          _world[_mapId].tokenList[tk.layer].push(tk);

          rpgShell.updateToken(_mapId,JSON.stringify(tk));

        }
      }
    },
    ///////////////////////////////////////////////////////////////////////
    // moves token down one layer
    downToken: function(){
      if( rpgTable.validate(_selectedToken.uuid) ) {

        var tk = rpgWorld.getTokenByUUID(_selectedToken.uuid);

        if( tk.layer > 0 ){

          var idx = 0;

          for(var i=0; i<_world[_mapId].tokenList[tk.layer].length; ++i){
            if( _world[_mapId].tokenList[tk.layer][i].uuid == tk.uuid ){
              idx = i;
              break;
            }
          }

          _world[_mapId].tokenList[tk.layer].splice(idx,1);

          tk.layer = tk.layer-1;

          _world[_mapId].tokenList[tk.layer].push(tk);

          rpgShell.updateToken(_mapId,JSON.stringify(tk));

        }
      }
    },
    ///////////////////////////////////////////////////////////////////////
    // deletes a token
    deleteToken: function(mapId,uuid){

      if( rpgTable.validate(uuid) ) {
        for(var layer=0; layer<=2; ++layer){
          for(var idx=0; idx<_world[mapId].tokenList[layer].length; ++idx){
            if( _world[mapId].tokenList[layer][idx].uuid == uuid ){
              _world[mapId].tokenList[layer].splice(idx,1);
              return
            }
          }
        }
      }
    },
    ///////////////////////////////////////////////////////////////////////
    displaySettings: function(){

      var txt = "<h3 id='token-name' class='row col-xs-12'></h3>";

      txt = txt + "<div class='form-group'>";
      txt = txt + "  <label id='label-token-accesslist' for='upload-file-tags'>Access</label><br />"
      txt = txt + "  <input type='text' class='form-control' id='token-accesslist' placeholder='Enter access list'>";
      txt = txt + "</div>";
      txt = txt + "<hr/>";

      $("#tokensettingspage").html(txt);

      $("#token-name").html(_selectedToken.uuid);

      var players = rpgPlayer.list();

      var s = [];

      for(var i=0; i<players.length; ++i){
        s.push(players[i].name);
      }

      $("#token-accesslist").tagsinput({
        trimValue: true,
        freeInput: false,
        typeahead: {
          source: s,
          displayText: function(item){ return item; },
        },
      });

      var tk = rpgWorld.getTokenByUUID(_selectedToken.uuid);

      for(var i=0; i<tk.accessList.length; ++i){
        if( tk.accessList[i] === "ALL" )
          $("#token-accesslist").tagsinput('add',tk.accessList[i]);
        else{
          $("#token-accesslist").tagsinput('add',rpgPlayer.getName(tk.accessList[i]));
        }
      }

      (function(uuid){
        $("#token-accesslist").on('itemAdded', function(event) {
          // event.item: contains the item
          var accountId = rpgPlayer.getAccountId(event.item);
          var tk = rpgWorld.getTokenByUUID(uuid);
          if( jQuery.inArray(accountId,tk.accessList) === -1 ){
            tk.accessList.push(accountId);
            rpgShell.updateToken(_mapId,JSON.stringify(tk));
          }
        });
      })(_selectedToken.uuid);

      (function(uuid){
        $("#token-accesslist").on('itemRemoved', function(event) {
          // event.item: contains the item
          var tk = rpgWorld.getTokenByUUID(uuid);

          var idx = -1;
          if( event.item === "ALL" )
            idx = jQuery.inArray(event.item,tk.accessList);
          else
            idx = jQuery.inArray(rpgPlayer.getAccountId(event.item),tk.accessList);

          if( idx !== -1 ){
            tk.accessList.splice(idx,1);
            rpgShell.updateToken(_mapId,JSON.stringify(tk));
            console.log(tk);
          }
        });
      })(_selectedToken.uuid);

      rpgTable.displayPage("tokensettingspage");
    },
    ///////////////////////////////////////////////////////////////////////
  };
}());
///////////////////////////////////////////////////////////////////////
