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

var rpgTable = (function() {

  ///////////////////////////////////////////////////////////////////////

  var state = {};

  return {

    ///////////////////////////////////////////////////////////////////////
    get: function get(key){
      return state[key];
    },
    ///////////////////////////////////////////////////////////////////////
    set: function set(key,value){
      state[key] = value;
    },
    ///////////////////////////////////////////////////////////////////////
    amIGM: function amIGM(){
      return( state.gmId === state.accountId );
    },
    ///////////////////////////////////////////////////////////////////////
    // uid4 generator function
    createUUID: function createUUID() {
      // http://www.ietf.org/rfc/rfc4122.txt
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";

      var uuid = s.join("");
      return uuid;
    },

    ///////////////////////////////////////////////////////////////////////
    // validates entry - not null - not undefined - not ""
    validate: function validate(entry){
      return( entry !== undefined && entry !== null && entry !== "" );
    },

    ///////////////////////////////////////////////////////////////////////
    gameLoop: function gameLoop(){

      // refresh canvas
      rpgView.refresh();

      // refresh shell
      $("#shell-input").hide().show();

      setTimeout(gameLoop,17);
    },

    ///////////////////////////////////////////////////////////////////////
    displayPage: function (page){

      if($("#canvas").is(":visible"))
        rpgWorld.setDisplayTurn( $("#turn-div").is(":visible") );

      $("#maps").hide();
      $("#canvas").hide();
      $("#mainpage").hide();
      $("#imagelibrarypage").hide();
      $("#tokenpage").hide();

      if( page == "maps" ){
        $("#maps").show();
        $("#turn-div").hide();
      }else if( page === "canvas" ){
        $("#canvas").show();

        if( rpgWorld.getDisplayTurn() )
          $("#turn-div").show();

      }else if( page === "mainpage" ){
        $("#mainpage").show();
        $("#turn-div").hide();
      }else if( page === "imagelibrarypage" ){
        $("#imagelibrarypage").show();
        $("#turn-div").hide();
      }else if( page === "tokenpage" ){
        $("#tokenpage").show();
        $("#turn-div").hide();
      }
    },
    ///////////////////////////////////////////////////////////////////////
  };
}());
///////////////////////////////////////////////////////////////////////
