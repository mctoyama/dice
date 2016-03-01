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

// token data structures

///////////////////////////////////////////////////////////////////////
// token data structure
var rpgToken = (function() {

  var iconSize = 32; // border for icons
  var cogImg = "/images/cog.png";
  var upImg = "/images/arrow-up.png";
  var downImg = "/images/arrow-down.png";
  var delImg = "/images/cross.png";
  var alarmImg = "/images/alarm.png";

  return {

    // generates a new token
    generate: function(uuid,layer,src,left,top){

      var genuuid = null;

      if( !rpgTable.validate(uuid) )
        genuuid = rpgTable.createUUID();
      else
        genuuid = uuid;

      var genlayer = null;
      if( !rpgTable.validate(layer) )
        genlayer = 2; // default layer is gmLayer - see rpg-world.js
      else
        genlayer = layer;

      var token = {uuid: genuuid,
                   layer: genlayer,
                   src:src,
                   left:left,
                   top:top,
                   width:0,
                   height:0,
                   ready: false,
                   hover: false,
                   img: null,
                   accessList: ["ALL"],
                   cog: null,
                   up: null,
                   down:null,
                   del: null,
                   alarm: null,
                   turnHover: false,
      };

      // toJSON function
      token.toJSON = function(){

        var ret = jQuery.extend({},token,{});

        ret.ready = false;
        ret.hover = false;
        ret.img = null;
        ret.cog = null;
        ret.up = null;
        ret.down = null;
        ret.del = null;
        ret.alarm = null;

        return ret;
      };

      return token;
    },
    ///////////////////////////////////////////////////////////////////////
    access: function(tk,accountId){

      return( rpgTable.amIGM() ||
              jQuery.inArray( rpgTable.get("accountId"), tk.accessList) != -1 ||
              jQuery.inArray( "ALL", tk.accessList) != -1);

    },
    ///////////////////////////////////////////////////////////////////////
    // loads the image api after a json.parse
    load: function(tk){

      // loads img
      tk.ready = false;

      tk.img = new Image();

      tk.img.onload = function(){
        tk.ready = true;

        if( tk.width === 0 )
          tk.width = tk.img.width;

        if( tk.height === 0 )
          tk.height = tk.img.height;
      };

      tk.img.src = tk.src;

      // loads cog
      tk.cog = new Image();
      tk.cog.onload = function(){};
      tk.cog.src = cogImg;

      // loads up layer icon
      tk.up = new Image();
      tk.up.onload = function(){};
      tk.up.src = upImg;

      // loads down layer icon
      tk.down = new Image();
      tk.down.onload = function(){};
      tk.down.src = downImg;

      // loads dell icon
      tk.del = new Image();
      tk.del.onload = function(){};
      tk.del.src = delImg;

      // loads alarm icon
      tk.alarm = new Image();
      tk.alarm.onload = function(){};
      tk.alarm.src = alarmImg;

      // toJSON function
      tk.toJSON = function(){

        var ret = jQuery.extend({},tk,{});

        ret.ready = false;
        ret.hover = false;
        ret.img = null;
        ret.cog = null;
        ret.up = null;
        ret.down = null;
        ret.del = null;
        ret.alarm = null;

        return ret;
      };
    },
    ///////////////////////////////////////////////////////////////////////
    // returns true if click in inside the token
    click: function(tk,pos){

      var t = rpgWorld.eventTypes();

      if( rpgToken.access(tk,rpgTable.get("accountId") ) ){

        // click up layer
        if( tk.layer < 2 ){
          if( tk.left-iconSize <= pos.x && pos.x <= tk.left &&
              tk.top <= pos.y && pos.y < tk.top+iconSize){

                rpgWorld.setEventType(t.clickUp);
                rpgWorld.setSelectedToken(tk.uuid);
                return(false);
              }
        }

        // click down layer
        if( tk.layer > 0 ){
          if( tk.left-iconSize <= pos.x && pos.x <= tk.left &&
              tk.top+tk.height-iconSize <= pos.y && pos.y <= tk.top+tk.height){

                rpgWorld.setEventType(t.clickDown);
                rpgWorld.setSelectedToken(tk.uuid);
                return(false);
              }
        }

        // click resize
        var size = 16;

        if( tk.left + tk.width - size <= pos.x && pos.x <= tk.left + tk.width + size &&
            tk.top + tk.height - size <= pos.y && pos.y <= tk.top + tk.height + size ){

              rpgWorld.setEventType(t.resizeToken);
              rpgWorld.setSelectedToken(tk.uuid);
              return(false);
        }

        // click move
        if( tk.left <= pos.x && pos.x <= tk.left+tk.width &&
            tk.top <= pos.y && pos.y <= tk.top+tk.height ){

              rpgWorld.setEventType(t.moveToken);
              rpgWorld.setSelectedToken(tk.uuid);
              return(false);
        }

        // delete token
        if( tk.left+tk.width <= pos.x && pos.x <= tk.left+tk.width+iconSize &&
            tk.top <= pos.y && pos.y <= tk.top+iconSize ){

              rpgWorld.setEventType(t.deleteToken);
              rpgWorld.setSelectedToken(tk.uuid);
              return(false);
        }

        // token settings
        if( tk.left+tk.width <= pos.x && pos.x <= tk.left+tk.width+iconSize &&
            tk.top+iconSize <= pos.y && pos.y <= tk.top + (2*iconSize) ){

              rpgWorld.setEventType(t.clickTokenSettings);
              rpgWorld.setSelectedToken(tk.uuid);
              return(false);
        }

        // alarm token
        if( tk.left+tk.width <= pos.x && pos.x <= tk.left+tk.width+iconSize &&
            tk.top+(2*iconSize) <= pos.y && pos.y <= tk.top + (3*iconSize) ){

              rpgWorld.setEventType(t.alarmToken);
              rpgWorld.setSelectedToken(tk.uuid);
              rpgWorld.setSelectedTokenArg("imgURI",tk.src);
              return(false);
        }


      }

      return false;
    },
    ///////////////////////////////////////////////////////////////////////
    // draws the token
    draw: function(tk,context){

      if( tk.ready === true ){

        context.save();
        context.drawImage(tk.img,tk.left,tk.top,tk.width,tk.height);

        if( tk.turnHover ){

          context.save();
          context.beginPath();
          context.moveTo(tk.left,tk.top);
          context.lineTo(tk.left+tk.width,tk.top);
          context.lineTo(tk.left+tk.width,tk.top+tk.height);
          context.lineTo(tk.left,tk.top+tk.height);
          context.lineTo(tk.left,tk.top);
          context.lineWidth = 8;
          context.strokeStyle = '#ff0000';
          context.stroke();
          context.restore();

        }

        if( tk.hover === true ){
          if( rpgToken.access(tk,rpgTable.get("accountId")) ){

            // draw del icon
            context.drawImage(tk.del,tk.left+tk.width, tk.top);

            // draw settings
            context.drawImage(tk.cog,tk.left+tk.width,tk.top+iconSize);

            // draw alarm
            context.drawImage(tk.alarm,tk.left+tk.width,tk.top+(2*iconSize));

            // draw token border
            context.beginPath();
            context.moveTo(tk.left,tk.top);
            context.lineTo(tk.left+tk.width,tk.top);
            context.lineTo(tk.left+tk.width,tk.top+tk.height);
            context.lineTo(tk.left,tk.top+tk.height);
            context.lineTo(tk.left,tk.top);
            context.stroke();

          }
          if( rpgTable.amIGM() ) {

            if( tk.layer < 2 )
              context.drawImage(tk.up,tk.left-iconSize,tk.top);

            if( tk.layer > 0 )
              context.drawImage(tk.down,tk.left-iconSize,tk.top+tk.height-iconSize);
          }
        }
        context.restore();
      }
    },
    ///////////////////////////////////////////////////////////////////////
    hover: function(tk,pos){

      if( rpgToken.access(tk,rpgTable.get("accountId") ) ){

        if( tk.left - iconSize <= pos.x && pos.x <= tk.left+tk.width + iconSize &&
            tk.top -iconSize <= pos.y && pos.y <= tk.top+tk.height +iconSize ){
              tk.hover = true;
              return(true);
            }else{
              tk.hover = false;
              return(false);
            }
      }

      return false;
    },
    ///////////////////////////////////////////////////////////////////////
    cursor: function(tk,pos){

      if( rpgToken.access(tk,rpgTable.get("accountId") ) ){

        // click resize
        var size = 16;

        if( tk.left + tk.width - size <= pos.x && pos.x <= tk.left + tk.width + size &&
            tk.top + tk.height - size <= pos.y && pos.y <= tk.top + tk.height + size ){

              return(false);
            }
      }
      return(true);
    },
    ///////////////////////////////////////////////////////////////////////
  };
}());
