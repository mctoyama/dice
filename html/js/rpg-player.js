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

// player data structure

///////////////////////////////////////////////////////////////////////
// player data structure
var rpgPlayer = (function() {

  // players list
  var _players = [];

  return {

    ///////////////////////////////////////////////////////////////////////
    // generates a new token
    generate: function(name,accountId){

      var p = {name:name,
               accountId:accountId
      };

      return(p);
    },
    ///////////////////////////////////////////////////////////////////////
    // adds a player to game session list
    add: function(name,accountId){

      var p = rpgPlayer.generate(name,accountId);

      _players[p.accountId] = p;

    },
    ///////////////////////////////////////////////////////////////////////
    exists: function(accountId){
      return( rpgTable.validate(_players[accountId]) );
    },
    ///////////////////////////////////////////////////////////////////////    
    // given accountId returns player name
    getName: function(accountId){
      return(_players[accountId].name);
    },
    ///////////////////////////////////////////////////////////////////////
    // returns accountId
    getAccountId: function(name){

      for(var key in _players){
        if( _players[key].name === name )
          return(key);
      }

      return null;
    },
    ///////////////////////////////////////////////////////////////////////
    // list players
    list: function(){

      var ret = [];

      for(var i=0; i<_players.length; ++i){

        var tmp = jQuery.extend({},_players[i],{});

        if( rpgTable.validate(tmp.accountId) )
          ret.push(tmp);
      }

      return(ret);
    },
    ///////////////////////////////////////////////////////////////////////    
  };
}());
