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

// turn elemen data structure

///////////////////////////////////////////////////////////////////////
// player data structure
var rpgTurn = (function() {

  // players list
  var _elems = [];

  return {

    ///////////////////////////////////////////////////////////////////////
    load: function(){

      _elems = rpgWorld.getTurn();

      $("#turn-table tr").map(function(){
        $(this).remove();
      });

      for(var i=0; i<_elems.length; i++){

        rpgTurn.add(_elems[i].uuid,_elems[i].imgURI,_elems[i].value,false);
      }

      if($("#canvas").is(":visible") && !$("#turn-div").is(":visible")  && rpgWorld.getDisplayTurn() ){
        $("#turn-div").show();
      }else if( !rpgWorld.getDisplayTurn() ){
        $("#turn-div").hide();
      }

      $("#turn-panel-body").css('height', $("#turn-div").innerHeight() - $("#turn-panel-header").outerHeight() - $("#turn-resize-icon").outerHeight() );
      $("#turn-table").css('width', $("#turn-panel-body").innerWidth() - 32);

    },
    ///////////////////////////////////////////////////////////////////////
    add: function(uuid,imgURI,value,network){

      var newElem = {uuid:uuid,imgURI:imgURI,value:value};

      var td = $("#turn-table tr[tokenUUID='"+uuid+"'] td:nth-child(2)");

      if( td.length !== 0 ){

        td.text(value);

        for(var i=0; i<_elems.length; i++){

          if(_elems[i].uuid === uuid){

            _elems[i].value = value;
            break;
          }

        }

      }else{

        var tr = {};

        if( rpgTable.amIGM() ){

          tr = $("<tr tokenUUID='"+uuid+"' style='border-bottom:1px solid black;'> \
            <td style='width:60%;'><img src='"+imgURI+"' height='42' width='42'></img></td> \
            <td style='width:25%; text-align:center;' class='input-field' onclick='javascript:rpgTurn.setValue(\""+uuid+"\");'>"+value+"</td> \
            <td style='width:15%;'><a aria-label='...'><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></a></td> \
          </tr> ");

          $(tr).find("td:nth-child(3) a").click(function(){

            (function(puuid){rpgTurn.remove(puuid,true);})(uuid);

          });

        }else{

          tr = $("<tr tokenUUID='"+uuid+"' style='border-bottom:1px solid black;'> \
            <td style='width:60%;'><img src='"+imgURI+"' height='42' width='42'></img></td> \
            <td style='width:40%; text-align:center;' class='input-field' onclick='javascript:rpgTurn.setValue(\""+uuid+"\");'>"+value+"</td> \
          </tr> ");

        }

        // mouse enter elem
        $(tr).mouseenter(function(){

          (function(puuid){
            var tk = rpgWorld.getTokenByUUID(puuid);
            tk.turnHover = true;
          })(uuid);
        });

        // mouse leave elem
        $(tr).mouseleave(function(){

          (function(puuid){
            var tk = rpgWorld.getTokenByUUID(puuid);
            tk.turnHover = false;
          })(uuid);
        });

        $('#turn-table').append(function() {
          return tr
        });

        _elems.push(newElem);

      }

      $("#turn-panel-body").css('height', $("#turn-div").innerHeight() - $("#turn-panel-header").outerHeight() - $("#turn-resize-icon").outerHeight() );
      $("#turn-table").css('width', $("#turn-panel-body").innerWidth() - 32);

      rpgWorld.setTurn(_elems);

      if( rpgTable.validate(network) && network === true )
        rpgShell.updateTurn(JSON.stringify(newElem));
    },
    ///////////////////////////////////////////////////////////////////////
    setValue: function(uuid){

      var td = $("#turn-table tr[tokenUUID='"+uuid+"'] td:nth-child(2)");

      if( td.length === 0 )
        return;

      td.prop('onclick',null).off('click');

      var w = td.innerWidth();

      var inp = $("<input type='number' min='0' max='100'/>");

      (function(puuid){
        inp.keyup(function(e){
          if(e.keyCode == 13){

            var value = $("#turn-table tr[tokenUUID='"+puuid+"'] td input").val();

            $("#turn-table tr[tokenUUID='"+puuid+"'] td:nth-child(2)").html(value);

            $("#turn-table tr[tokenUUID='"+puuid+"'] td:nth-child(2)").click(function(){
              rpgTurn.setValue(puuid);
            });

            for(var i=0; i<_elems.length; i++){
              if( _elems[i].uuid === puuid ){
                _elems[i].value = value;
                break;
              }
            }

            var imgURI = $("#turn-table tr[tokenUUID='"+uuid+"'] td:nth-child(1) img").attr("src");

            rpgWorld.setTurn(_elems);
            rpgShell.updateTurn(JSON.stringify({uuid:puuid,imgURI:imgURI,value:value}));

          }
        });
      })(uuid);

      td.html(inp);

      inp.outerWidth(w);
      inp.focus();

    },
    ///////////////////////////////////////////////////////////////////////
    remove: function(uuid,network){

      $("#turn-table tr").map(function(){

        if( $(this).attr("tokenUUID") === uuid ){
          $(this).remove();
        }

      });

      for(var i=0; i<_elems.length; i++){
        if( _elems[i].uuid === uuid ){
          _elems.splice(i,1);
          break;
        }
      }

      rpgWorld.setTurn(_elems);

      if( rpgTable.validate(network) && network === true )
        rpgShell.removeTurn(uuid);
    },
    ///////////////////////////////////////////////////////////////////////
    toggle: function(){

      if($("#canvas").is(":visible")){
        $("#turn-div").toggle();
      }

      $("#turn-panel-body").css('height', $("#turn-div").innerHeight() - $("#turn-panel-header").outerHeight() - $("#turn-resize-icon").outerHeight() );
      $("#turn-table").css('width', $("#turn-panel-body").innerWidth() - 32);

      rpgShell.displayTurn( $("#turn-div").is(":visible") );
    },
    ///////////////////////////////////////////////////////////////////////
    show: function(){

      rpgTurn.load();

      if($("#canvas").is(":visible") && !$("#turn-div").is(":visible") ){
        $("#turn-div").show();
      }

      rpgWorld.setDisplayTurn(true);

      $("#turn-panel-body").css('height', $("#turn-div").innerHeight() - $("#turn-panel-header").outerHeight() - $("#turn-resize-icon").outerHeight() );
      $("#turn-table").css('width', $("#turn-panel-body").innerWidth() - 32);
    },
    ///////////////////////////////////////////////////////////////////////
    hide: function(){
      if($("#canvas").is(":visible") && $("#turn-div").is(":visible") ){
        $("#turn-div").hide();
      }

      rpgWorld.setDisplayTurn(false);

      $("#turn-panel-body").css('height', $("#turn-div").innerHeight() - $("#turn-panel-header").outerHeight() - $("#turn-resize-icon").outerHeight() );
      $("#turn-table").css('width', $("#turn-panel-body").innerWidth() - 32);
    },
    ///////////////////////////////////////////////////////////////////////
    ascend: function(network){

      var elems = $("#turn-table tr");

      elems.sort(function(a,b){

        return( $(a).find("td:nth-child(2)").html() < $(b).find("td:nth-child(2)").html() )

      });

      $("#turn-table").append(elems);

      _elems.sort(function(a,b){
        return(a.value < b.value);
      });

      rpgWorld.setTurn(_elems);

      if( rpgTable.validate(network) && network === true )
        rpgShell.ascendTurn();
    },
    ///////////////////////////////////////////////////////////////////////
    descend: function(network){

      var elems = $("#turn-table tr");

      elems.sort(function(a,b){

        return( $(b).find("td:nth-child(2)").html() < $(a).find("td:nth-child(2)").html() )

      });

      $("#turn-table").append(elems);

      _elems.sort(function(a,b){
        return(b.value < a.value);
      });

      rpgWorld.setTurn(_elems);

      if( rpgTable.validate(network) && network === true )
        rpgShell.descendTurn();
    },
    ///////////////////////////////////////////////////////////////////////
    next: function(network){

      $("#turn-table").append( $("#turn-table tr")[0] );

      var tmp = _elems.shift();
      _elems.push(tmp);

      rpgWorld.setTurn(_elems);

      if( rpgTable.validate(network) && network === true )
        rpgShell.nextTurn();
    },
    ///////////////////////////////////////////////////////////////////////
  };
}());
